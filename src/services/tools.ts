import { FunctionDeclaration } from "@google/genai";
import { z, ZodType } from "zod";

export const makeTool = (
  name: string,
  description: string,
  parametersJsonSchema: ZodType,
  responseJsonSchema: ZodType
): FunctionDeclaration => {
  return {
    name: name,
    description: description,
    parametersJsonSchema: z.toJSONSchema(parametersJsonSchema),
    responseJsonSchema: z.toJSONSchema(responseJsonSchema),
  };
};
