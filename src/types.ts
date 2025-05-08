import z from "zod";
import * as mongo from "mongodb";
export interface Question {
  question: string;
  time: string;
  theme: string;
  asker: string;
  response: string;
}

const Job = z.object({
  company: z.string(),
  title: z.string(),
  description: z.string(),
  link: z.string().optional(),
  favicon: z.string().optional(),
  id: z.string(),
});
export type Job = z.infer<typeof Job>;

export type IdJob = { id: string } & Job;

export const castToJob = (
  dbResponse: mongo.WithId<mongo.BSON.Document> | null
): Job => {
  try {
    return Job.parse(dbResponse);
  } catch (e) {
    console.error("Error parsing database response to Job: " + e);
  }
};
