import {
  Chat,
  Chats,
  Content,
  GenerateContentResponse,
  GoogleGenAI,
} from "@google/genai";
import {
  GenerateContentConfig,
  FunctionDeclaration,
  CallableTool,
  Models,
  ApiError,
  Part,
  Interactions,
} from "@google/genai";
import z, { ZodString, ZodType } from "zod";
import { writeFileSync } from "fs";
import { isOutputTextContent } from "../types.js";
export interface ValidatingConfig<T extends ZodType = ZodString>
  extends Omit<GenerateContentConfig, "responseJsonSchema"> {
  responseJsonSchema: T;
}
export const createConfig = <T extends ZodType>(
  temperature: number = 0,
  systemInstruction: string,
  responseMimeType: string = "text/plain",
  responseJsonSchema?: T,
  builtInTools: CallableTool[] = [],
  functionDeclarations: FunctionDeclaration[] = []
): ValidatingConfig<T> => {
  const config: ValidatingConfig<T> = {
    systemInstruction: systemInstruction,
    temperature: temperature,
    tools:
      builtInTools.length > 0 || functionDeclarations.length > 0
        ? [...builtInTools, { functionDeclarations: functionDeclarations }]
        : undefined,
    responseJsonSchema: responseJsonSchema,
    responseMimeType: responseMimeType,
  };
  return config;
};
let aiClient: GoogleGenAI | null = null;
export const getModel = async () => {
  if (process.env.GEMINI_API_KEY) {
    if (aiClient) {
      return aiClient;
    }
    const newModel = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    try {
      await newModel.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: "Test" }] }],
      });
    } catch (e) {
      console.error("API Key verification failed:", e);
      throw new ApiError({
        status: 401,
        message: "Invalid API Key or API Error",
      });
    }
    aiClient = newModel;
    return aiClient;
  } else {
    throw new ApiError({ status: 401, message: "Unauthorized" });
  }
};

const postInteraction = async (
  ...parms: Parameters<Interactions["create"]>
): Promise<ReturnType<Interactions["create"]>> => {
  const interaction = (await getModel()).interactions.create(...parms);
  return interaction;
};

export const postResearch = async (topic: string, title: string) => {
  const model = await getModel();
  const initialInteraction = await model.interactions.create({
    input: topic + "\nFormat your research report using markdown.",
    agent: "deep-research-pro-preview-12-2025",
    background: true,
  });
  while (true) {
    const interaction = await model.interactions.get(initialInteraction.id);
    console.log(`Status: ${interaction.status}`);

    if (interaction.status === "completed") {
      const output = interaction.outputs[interaction.outputs.length - 1];
      if (isOutputTextContent(output)) {
        const filePath = `${title}.md`;
        writeFileSync(filePath, output.text);
        return filePath;
      }

      break;
    } else if (["failed", "cancelled"].includes(interaction.status)) {
      console.log(`Failed with status: ${interaction.status}`);
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};
type ChatModel = Parameters<Chats["create"]>[0]["model"];
interface AIChat {
  chat: Chat;
  chosenModel: ChatModel;
}
let aiChat: AIChat | null = null;
export const startChat = async (model?: string) => {
  const client = await getModel();
  if (aiChat) {
    const { chosenModel } = aiChat;
    if (model && chosenModel !== model) {
      const newChat = client.chats.create({
        model: model,
        history: aiChat.chat.getHistory(),
      });
      const newAIChat = { chosenModel: model, chat: newChat };
      aiChat = newAIChat;
    }
    return aiChat;
  } else {
    const chosenModel = model ?? "gemini-2.5-flash-lite";
    const newChat = client.chats.create({ model: chosenModel });
    const newAIChat = { chosenModel: chosenModel, chat: newChat };
    aiChat = newAIChat;
    return aiChat;
  }
};

export const getLastAnswer = async () => {
  const { chat } = await startChat();
  try {
    const lastAnswer = chat
      .getHistory(true)
      .findLast((turn) => turn.role === "model");
    if (lastAnswer) {
      const lastText = lastAnswer.parts?.map(({ text }) => text).join("\n");
      if (lastText) {
        const lastSlice = lastText.slice(-150);
        console.log(lastSlice);
        return lastSlice;
      }
    }
  } catch (e) {
    console.error(
      "Error retrieving last answer from history: " + JSON.stringify(e)
    );
    return "";
  }
};

export interface ToolFunctionArgs<T = any, U = any, V = any, W = any, X = any> {
  externalArgs?: T;
  function: (...parms: U[]) => V;
  callback?: (...parms: W[]) => X;
}
interface ValidatingContent<T>
  extends Omit<
    GenerateContentResponse,
    "functionCalls" | "executableCode" | "codeExecutionResult"
  > {
  parsed?: T;
}
export const inferContent = async <T extends ZodType = ZodString>(
  model: Models,
  LLM:
    | "gemini-2.5-flash-lite"
    | "gemini-2.5-flash"
    | "gemini-2.5-pro"
    | undefined = "gemini-2.5-flash-lite",
  config: ValidatingConfig<T>,
  content: Content[],
  functionMap?: Record<string, ToolFunctionArgs>
) => {
  const functionCallingConfig = (): GenerateContentConfig => {
    const { responseJsonSchema, responseMimeType, ...newConfig } = {
      ...config,
    };
    return newConfig;
  };
  const structuredOutputConfig = (): GenerateContentConfig => {
    const { responseJsonSchema, responseMimeType, ...newConfig } = {
      ...config,
    };
    newConfig["responseJsonSchema"] = z.toJSONSchema(responseJsonSchema);
    newConfig["responseMimeType"] = "application/json";
    return newConfig;
  };

  const { candidates, functionCalls, data, text } = await model.generateContent(
    {
      model: LLM,
      contents: content,
      config: config.tools ? functionCallingConfig() : structuredOutputConfig(),
    }
  );
  if (functionCalls && functionCalls.length > 0) {
    content.push(candidates[0].content);
    const responseParts: Part[] = [];
    functionCalls.forEach(({ name, args }) => {
      const { externalArgs, function: callable, callback } = functionMap[name];
      const result = callable({ ...externalArgs, ...args });
      if (callback) {
        callback();
      }

      responseParts.push({
        functionResponse: {
          name: name,
          response: result,
        },
      });
      content.push({
        role: "user",
        parts: responseParts,
      });
    });
    const {
      candidates: finalCandidates,
      data,
      text,
    } = await model.generateContent({
      model: LLM,
      contents: content,
      config: config,
    });
    if (config.responseJsonSchema) {
      const parsed = config.responseJsonSchema.parse(JSON.parse(text));
      return { candidates: finalCandidates, data, text, parsed };
    } else {
      return { candidates: finalCandidates, data, text };
    }
  } else {
    try {
      if (config.responseJsonSchema) {
        const parsed = config.responseJsonSchema.parse(JSON.parse(text));
        return { candidates: candidates, data, text, parsed };
      } else {
        return { candidates: candidates, data, text };
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        const parsed = config.responseJsonSchema.parse(text);
        return { candidates, data, text, parsed };
      } else {
        throw e;
      }
    }
  }
};

export const reasonStructured = async <T = string>(
  userInput: string,
  structure: ZodType<T>,
  instructions?: {
    reasoningInstructions?: string;
    structuringInstructions?: string;
  }
) => {
  const { models: reasoningModel } = await getModel();
  const reasoning = await inferContent(
    reasoningModel,
    "gemini-2.5-pro",
    createConfig(
      0,
      "You are the first step in a reason -> structure process. Reason about the user's query and answer to the best of your ability." +
        instructions?.reasoningInstructions,
      null
    ),
    [{ role: "user", parts: [{ text: userInput }] }]
  );

  const { text } = reasoning;
  console.log(text);
  const structuring = await inferContent(
    reasoningModel,
    "gemini-2.5-flash-lite",
    createConfig(
      0,
      "You are the second step in a two step reason -> structure process. Transform the reasoning provided to you into the provided structured.",
      "application/json" + instructions?.structuringInstructions,
      structure
    ),
    [{ role: "user", parts: [{ text: text }] }]
  );
  return structuring;
};
