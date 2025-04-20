import { z } from "zod";
import mongo from "mongodb";
import { v4 } from "uuid";
import { configDotenv } from "dotenv";
import {
  GoogleGenerativeAI,
  ResponseSchema,
  SchemaType,
} from "@google/generative-ai";
import { getFavicon } from "./getJobs.js";
import { putValuesREST } from "./getSheets.js";
configDotenv();

export const PromptSchema = z.object({
  question: z.string(),
  default: z.string().optional(),
});
export type Prompt = z.infer<typeof PromptSchema>;

export const jobSchema = z.object({
  company: z.string().default(""),
  title: z.string().default(""),
  link: z.string().default(""),
  favicon: z.string().nullable().default(""),
  domain: z.string().nullable().default(""),
  description: z.string().default(""),
});

export const filledOutJob = z.object({
  company: z.string().nonempty(),
  title: z.string().nonempty(),
  link: z.string().nonempty(),
  favicon: z.string().nonempty(),
  description: z.string().nonempty(),
});
export type FullJob = z.infer<typeof filledOutJob>;
export type Job = z.infer<typeof jobSchema>;

const schema: ResponseSchema = {
  description:
    "Information about a specific job posting, comprised of company name, job title, favicon from website, and description.",
  type: SchemaType.OBJECT,
  properties: {
    company: {
      type: SchemaType.STRING,
      description: "Name of the company posting the job.",
      nullable: true,
    },
    title: {
      type: SchemaType.STRING,
      description: "Job title as extracted from the job posting",
      nullable: true,
    },
    favicon: {
      type: SchemaType.STRING,
      description:
        "Link to the favicon for the company's website, found in the head section of the html, in a link tag with attribute rel=icon most often.",
      nullable: true,
    },
    domain: {
      type: SchemaType.STRING,
      description:
        "Website domain associated with the company posting the job. Often www.company.com, or company.com or company.io etc",
    },
    description: {
      type: SchemaType.STRING,
      description:
        "Job Description, including company description, job responsibilities, and required skills and experience. formatted in a human legible way.",
      nullable: true,
    },
  },
};

export const prefillJob = async (job: string): Promise<Prompt[]> => {
  if (process.env.GEMINI_API_KEY) {
    const jobExtractor = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = jobExtractor.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "You are a text/ information extractor. Take the provided job posting and categorize faithfully and with extreme accuracy the data into the provided schema. Do not invent or create any data.",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0,
      },
    });
    const myPrompt = `Here is a job posting: ${job}
        Analyze it to extract the following information: Company name, job title (without extraneous indications like all genders or m/w/d), link to favicon or link to company website, and job description.`;
    const response = await model.generateContent(myPrompt);
    console.log("Here is the response from Gemini", response.response.text());
    const extractedData = jobSchema.parse(JSON.parse(response.response.text()));
    console.log(
      "Successfully extracted the following data from the posting:",
      extractedData
    );
    const foundFavicon = await getFavicon(
      extractedData.company,
      extractedData.domain
    );
    const prompts: Prompt[] = [];
    prompts.push({
      question: "Enter Company name:",
      default: extractedData.company,
    });
    prompts.push({
      question: "Enter job title:",
      default: extractedData.title,
    });
    prompts.push({
      question: "Enter job link:",
      default: "",
    });
    prompts.push({
      question: "Enter favicon link:",
      default: foundFavicon,
    });
    prompts.push({
      question: "Enter job description:",
      default: extractedData.description,
    });
    return prompts;
  }
};
const jobId = jobSchema.extend({ id: z.string() });
export type IdJob = z.infer<typeof jobId>;

export const putJob = async (job: Job): Promise<string> => {
  const uri = `mongodb+srv://admin:${process.env.MONGODB_PWD}@cluster0.akpza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  const client = new mongo.MongoClient(uri, {
    serverApi: {
      version: mongo.ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  const [dbName, collectionName] = ["interactive-resume", "jobs"];
  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  const id = v4();
  console.log("here is the JobId", { id: id, ...job });
  const jobWithId = jobId.parse({ id: id, ...job });
  try {
    return await client
      .connect()
      .then(async () => {
        console.log("Connected to MongoDB to put new job", jobWithId);
        return await collection
          .insertOne(jobWithId)
          .then((result) => {
            console.log("Inserted new job", result);
            const personalizedLink = `${process.env.WEB_URL}/${id}`;
            console.log(
              "New Job up and running at the following address:",
              personalizedLink
            );
            return personalizedLink;
          })
          .catch((error) => {
            console.error("Error inserting new job", error);
            throw error;
          });
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB", error);
        throw error;
      });
  } catch (error) {
    console.error("Error inserting new job.", error);
    throw error;
  } finally {
    await client.close();
    console.log("Closed MongoDB connection.");
  }
};
