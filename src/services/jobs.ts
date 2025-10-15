import { configDotenv } from "dotenv";
import {
  GoogleGenerativeAI,
  ResponseSchema,
  SchemaType,
} from "@google/generative-ai";
import { Job, JobInput, JobInputSchema } from "../types.js";
import axios from "axios";
configDotenv();

export const getJob = async (jobId: string): Promise<Job> => {
  const { data } = await axios.get<Job>(
    `https://resume.adriens-apis.io/pdf/jobs/${jobId}/`
  );
  return data;
};

export const getJobs = async (parms: Record<string, any>): Promise<Job[]> => {
  const { data } = await axios.get<Job[]>(
    `https://resume.adriens-apis.io/pdf/jobs/`,
    { params: parms }
  );
  return data;
};

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

export async function getFavicon(
  company?: string,
  domain?: string | undefined
): Promise<string> {
  if (company === "" || !company) {
    console.log("No company name provided, returning empty string.");
    return "";
  } else if (domain && domain !== "") {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=48`;
  } else {
    try {
      const jobs = await getJobs({
        company: company,
        favicon: { $exists: true },
      });
      return jobs[0].favicon;
    } catch (e) {
      console.error(
        "Error attempting to fetch jobs from same company for the favicon:\n" +
          JSON.stringify(e)
      );
    }
  }
  return "";
}

export const generateJob = async (
  jobDescription: string
): Promise<JobInput> => {
  if (process.env.GEMINI_API_KEY) {
    const jobExtractor = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = jobExtractor.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are a text/ information extractor. Take the provided job posting and categorize faithfully and with extreme accuracy the data into the provided schema. Do not invent or create any data.",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0,
      },
    });
    const myPrompt = `Here is a job posting: ${jobDescription}
        Analyze it to extract the following information: Company name, job title (without extraneous indications like all genders or m/w/d), link to favicon or link to company website, and job description.`;
    const generatedContent = await model.generateContent(myPrompt);
    console.log(
      "Here is the generatedContent from Gemini",
      generatedContent.response.text()
    );
    const { response } = generatedContent;
    const job = JobInputSchema.parse(JSON.parse(response.text()));
    job.favicon = await getFavicon(job.company, job.domain);
    console.log(
      "Successfully extracted the following data from the posting:",
      JSON.stringify(job)
    );
    return job;
  }
};
