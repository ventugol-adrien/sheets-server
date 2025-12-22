import { ApiError, Chat, GenerateContentConfig } from "@google/genai";
import { AnswerSchema, Resume, ThemeAnalysisSchema } from "../types.js";
import {
  getModel,
  createConfig,
  inferContent,
  startChat,
  getLastAnswer,
  reasonStructured,
} from "../utils/model.js";
import { Feedback } from "../assets/Feedback.js";
import z from "zod";

export const inferTheme = async (target: string, chat?: Chat) => {
  const { models: themeAnalyzer } = await getModel();
  const lastAnswer = chat ? await getLastAnswer() : "";
  const myPrompt = ` a user is asking the following question/follow ups about the engineer:${target}
${chat ? "Taking into account your last interaction: " + lastAnswer : ""}
              Give the theme of the question.
              Example: "What is the engineer's experience with React?" ->"Frontend experience" 
              Example: What is the engineer's Backend Experience? ->"Backend Experience" 
              Example: Is the engineer qualified for the job? ->"Qualification"
              Example: "How does the engineer handle difficult situations?" ->"Interpersonal skills" 
              In case of a follow up (yes, yes please, sure), parse the previous response to get the theme.`;
  const contents = [{ role: "user", parts: [{ text: myPrompt }] }];
  const instructions =
    "Your role is to analyze a question given by a user about an engineer. Analyze the broad theme of the question given by the asker in term of the what abilities it concerns. Return the theme of the question in a maximum of 3 words as a JSON object.";
  const config = createConfig(
    0,
    instructions,
    "application/json",
    ThemeAnalysisSchema
  );
  try {
    const {
      candidates,
      data,
      text,
      parsed: theme,
    } = await inferContent(themeAnalyzer, undefined, config, contents);
    return theme;
  } catch (err) {
    const error = "Error inferring theme: " + JSON.stringify(err);
    console.error(error);
    throw new ApiError({ message: error, status: err.status });
  }
};

export const askQuestion = async (
  input: string,
  jobTitle?: string,
  company?: string,
  description?: string,
  resume?: Resume
) => {
  const { chat } = await startChat();
  const instructions = `You are an assistant tasked with getting the software engineer mentioned (the applicant) in the feedback hired into the following position:
                 ${
                   jobTitle ? jobTitle : "Mid to Senior Fullstack Engineer"
                 } at ${company ? company : "a software company"}.
                 Use all the data provided to answer questions, convincing the user to hire the worker.
                To this end you must give the impression of being impartial.
                Do not let the user know you intend to convince them of the worker's ability, but phrase and shape your response to actively do so.`;
  const feedback = Feedback.map(({ feedback }) => feedback).join("\n");
  const prompt = `here is a number of positive feedback that a worker has received at their workplace:${feedback}
              ${
                resume
                  ? "Here is a json file representing the applicant's resume: " +
                    JSON.stringify(resume)
                  : ""
              }
              Use this information to answer the question asked by the interested party: ${input}
              Ensure that your answer emphasizes the traits, skills and expectations inherent to ${
                description
                  ? "the following job description: " + description
                  : "a software engineering role."
              } 
              Formulate your answer by first deciding whether the user needs quick, short information found in the resume, or a longer, thought out response.
              Then take a look at your last answer: ${getLastAnswer()} and the user's latest input: ${input} and prioritize answering follow ups.
              Where possible answer very briefly, quoting the resume.
              Ask the user if you can answer additional questions about the applicant, bringing up relevant skills and strengths not yet mentioned, e.g. "Are you interested in hearing more about ____ skills?"`;
  const questionConfig = createConfig(
    0,
    instructions,
    "application/json",
    AnswerSchema
  );
  const structuredConfig: GenerateContentConfig = { ...questionConfig };
  structuredConfig.responseJsonSchema = z.toJSONSchema(
    questionConfig.responseJsonSchema
  );
  const { text: response } = await chat.sendMessage({
    message: prompt,
    config: structuredConfig,
  });
  return AnswerSchema.parse(JSON.parse(response));
};
export const askQuestionAdvanced = async (
  input: string,
  jobTitle?: string,
  company?: string,
  description?: string,
  resume?: Resume
) => {
  const instructions = `You are an assistant tasked with getting the software engineer mentioned (the applicant) in the feedback hired into the following position:
                 ${
                   jobTitle ? jobTitle : "Mid to Senior Fullstack Engineer"
                 } at ${company ? company : "a software company"}.
                 Use all the data provided to answer questions, convincing the user to hire the worker.
                To this end you must give the impression of being impartial.
                Do not let the user know you intend to convince them of the worker's ability, but phrase and shape your response to actively do so.`;
  const feedback = Feedback.map(({ feedback }) => feedback).join("\n");
  const prompt = `here is a number of positive feedback that a worker has received at their workplace:${feedback}
              ${
                resume
                  ? "Here is a json file representing the applicant's resume: " +
                    JSON.stringify(resume)
                  : ""
              }
              Use this information to answer the question asked by the interested party: ${input}
              Ensure that your answer emphasizes the traits, skills and expectations inherent to ${
                description
                  ? "the following job description: " + description
                  : "a software engineering role."
              } 
              Formulate your answer by first deciding whether the user needs quick, short information found in the resume, or a longer, thought out response.
              Then take a look at your last answer: ${getLastAnswer()} and the user's latest input: ${input} and prioritize answering follow ups.
              Where possible answer very briefly, quoting the resume.
              Ask the user if you can answer additional questions about the applicant, bringing up relevant skills and strengths not yet mentioned, e.g. "Are you interested in hearing more about ____ skills?"`;

  const response = await reasonStructured(prompt, AnswerSchema, {
    reasoningInstructions: instructions,
  });
  return response;
};
