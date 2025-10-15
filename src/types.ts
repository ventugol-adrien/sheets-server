import z from "zod";

export const QuestionSchema = z.object({
  question: z.string(),
  time: z.string(),
  theme: z.string(),
  asker: z.string(),
  response: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const PromptSchema = z.object({
  question: z.string(),
  default: z.string().optional(),
});
export type Prompt = z.infer<typeof PromptSchema>;

export const KeywordsSchema = z.object({
  technologies: z.array(z.string()).max(20),
  tech_skills: z.array(z.string()).max(30),
  soft_skills: z.array(z.string()).max(25),
  qualities: z.array(z.string()).max(25),
});
export type Keywords = z.infer<typeof KeywordsSchema>;

export const JobInputSchema = z.object({
  company: z.optional(z.string()),
  favicon: z.optional(z.url()).nullable(),
  title: z.optional(z.string()),
  description: z.optional(z.string()),
  domain: z.optional(z.string()),
});

export type JobInput = z.infer<typeof JobInputSchema>;

export const JobSchema = JobInputSchema.extend({
  id: z.string(),
  link: z.url(),
  resumes: z.optional(z.array(z.string())),
  keywords: KeywordsSchema,
});

export type Job = z.infer<typeof JobSchema>;

export const isJob = (data: any): data is Job =>
  JobSchema.safeParse(data).success;
