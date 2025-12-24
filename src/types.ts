import z, { output } from "zod";
import { makeTool } from "./services/tools.js";
import { Interactions } from "@google/genai";

export const QuestionSchema = z.object({
  question: z.string(),
  time: z.string(),
  asker: z.optional(z.string()),
});
export type Question = z.infer<typeof QuestionSchema>;

export const AnsweredQuestionSchema = QuestionSchema.extend({
  response: z.string(),
  theme: z.string(),
});

export type AnsweredQuestion = z.infer<typeof AnsweredQuestionSchema>;

export const HighlightCardSchema = z.object({
  title: z
    .string()
    .describe(
      "Synthesizes a point/ fact relevant to the question in 2 to 3 words."
    ),
  content: z
    .string()
    .describe("Individual point / fact relevant to the question asked."),
});
export const AnswerSchema = z.object({
  answer: z.string().describe("Answer to the user's question/ follow up"),
  highlightCards: z.optional(
    z
      .array(HighlightCardSchema)
      .describe(
        "Array of titles and contents describing facts of points relevant to the question."
      )
      .max(4)
  ),
});

export type Answer = z.infer<typeof AnswerSchema>;
export const OriginsSchema = z.array(z.url());
export type Origins = z.infer<typeof OriginsSchema>;

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

export const GetFaviconToolParms = z.object({
  company: z.string().describe("Company described in the job description."),
  domain: z
    .optional(
      z
        .string()
        .describe("web domain of the company described in the job description.")
    )
    .nullable(),
});
const GetFaviconToolResponse = z.object({
  favicon: z.string().describe("The favicon for the company"),
});

export const GetFaviconTool = makeTool(
  "getFavicon",
  "Tool to retrieve the favicon for a company",
  GetFaviconToolParms,
  GetFaviconToolResponse
);

export const ThemeAnalysisSchema = z.object({
  theme: z.string().describe("String describing the theme of the question"),
});

export type JobInput = z.infer<typeof JobInputSchema>;

export const JobSchema = JobInputSchema.extend({
  id: z.string(),
  link: z.url(),
  resume: z.optional(z.string()),
  keywords: KeywordsSchema,
});

export type Job = z.infer<typeof JobSchema>;

export const isJob = (data: any): data is Job =>
  JobSchema.safeParse(data).success;

export const TechnologyCategorySchema = z.enum([
  "frontend",
  "backend",
  "database",
  "testing",
  "cicd",
  "cloud",
]);
export type TechnologyCategory = z.infer<typeof TechnologyCategorySchema>;

// Pydantic: Technologies
export const TechnologiesSchema = z.object({
  frontend: z
    .array(z.enum(["React", "Typescript", "Javascript", "Vue"]))
    .min(2)
    .default(["React", "Typescript", "Javascript", "Vue"])
    .describe(
      "Known front end technologies relevant to this job posting. Default to all technologies if relevant ones can't be identified."
    ),
  backend: z
    .array(
      z.enum(["Java", "Spring Boot", "Node", "Express", "Python", "Django"])
    )
    .min(2)
    .default(["Java", "Spring Boot", "Node", "Express", "Python", "Django"]),
  database: z
    .array(z.enum(["SQL", "NoSQL", "MongoDB"]))
    .min(2)
    .default(["SQL", "NoSQL", "MongoDB"]),
  testing: z
    .array(z.enum(["JUnit", "Jest", "Cypress", "Pytest"]))
    .min(2)
    .default(["JUnit", "Jest", "Cypress", "Pytest"]),
  cicd: z
    .array(z.enum(["Git", "Docker", "Jenkins", "SonarQube"]))
    .min(3)
    .default(["Git", "Docker", "Jenkins", "SonarQube"]),
  cloud: z
    .array(z.enum(["GCP", "AWS"]))
    .min(1)
    .default(["GCP", "AWS"]),
});
export type Technologies = z.infer<typeof TechnologiesSchema> & {
  [key: string]: string[];
};

// Pydantic: Skills
export const SkillsSchema = z
  .array(z.array(z.string()))
  .describe(
    "A model to represent up to 10 engineering and tech related skills arranged in up to 5 arrays of two skills. Only methodologies, soft skills and ways of working should be listed."
  );
export type Skills = z.infer<typeof SkillsSchema>;

// Pydantic: Contribution
export const ContributionSchema = z.object({
  headline: z.string(),
  details: z
    .array(z.string())
    .default([""])
    .describe("A list of specific details about the contribution."),
});
export type Contribution = z.infer<typeof ContributionSchema>;

// Pydantic: Position
export const PositionSchema = z.object({
  index: z.number().int(),
  company: z.string(),
  location: z.string(),
  title: z.string(),
  dates: z.string(),
  responsibilities: z.string(),
  contributions: z.array(ContributionSchema),
});
export type Position = z.infer<typeof PositionSchema>;

// Pydantic: Award
export const AwardSchema = z.array(z.string());
export type Award = z.infer<typeof AwardSchema>;

// Pydantic: Education
export const EducationSchema = z.object({
  qualification: z.string(),
  institution: z.string(),
  location: z.string(),
  date: z.string(),
});
export type Education = z.infer<typeof EducationSchema>;

// Pydantic: Language
export const LanguageSchema = z.object({
  language: z.string(),
  level: z.tuple([z.string(), z.string()]),
});
export type Language = z.infer<typeof LanguageSchema>;

// Pydantic: Project (inherits from Contribution)
export const ProjectSchema = ContributionSchema.extend({
  link: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

// Pydantic: Contact
export const ContactSchema = z.object({
  phone: z.string(),
  email: z.string().email(),
  linkedin: z.string().url(),
  github: z.string().url(),
});
export type Contact = z.infer<typeof ContactSchema>;

// Pydantic: Checklist
export const ChecklistSchema = z.array(z.string());
export type Checklist = z.infer<typeof ChecklistSchema>;

// Pydantic: Usage
export const UsageSchema = z.object({
  id: z.string(),
  entry_date: z.string().datetime(),
  object_type: z.enum(["resume", "job"]),
});
export type Usage = z.infer<typeof UsageSchema>;

// Pydantic: Metadata
export const MetadataSchema = z.object({
  id: z.string(),
  entry_date: z.string().datetime(),
  modified_date: z.string().datetime(),
});
export type Metadata = z.infer<typeof MetadataSchema>;

// Pydantic: ResumeMetadata (inherits from Metadata)
export const ResumeMetadataSchema = MetadataSchema.extend({
  success: z.boolean().optional(),
  job: z.string(),
  basisForResumes: z.array(UsageSchema).optional(),
});
export type ResumeMetadata = z.infer<typeof ResumeMetadataSchema>;

// Pydantic: Resume
export const ResumeSchema = z.object({
  technologies: TechnologiesSchema,
  skills: SkillsSchema,
  responsibilities: z.string(),
  positions: z.array(PositionSchema),
  checklist: ChecklistSchema,
  education: EducationSchema,
  languages: z.array(LanguageSchema),
  awards: z.array(AwardSchema),
  projects: z.array(ProjectSchema),
  contact: ContactSchema,
});
export type Resume = z.infer<typeof ResumeSchema>;

// Pydantic: ResumeDocument (combines Metadata and Resume)
export const ResumeDocumentSchema = ResumeMetadataSchema.extend(
  ResumeSchema.shape
);
export type ResumeDocument = z.infer<typeof ResumeDocumentSchema>;

export const isOutputTextContent = (
  output: any
): output is Interactions.TextContent => {
  4;
  return "text" in output;
};
