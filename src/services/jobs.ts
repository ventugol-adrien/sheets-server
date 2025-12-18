import { Job, JobInput, JobInputSchema, ResumeDocument } from "../types.js";
import axios, { AxiosError } from "axios";
import { IncomingHttpHeaders } from "http2";
import { createConfig, getModel, inferContent } from "../utils/model.js";

export const getJob = async (jobId: string): Promise<Job> => {
  try {
    const { data } = await axios.get<Job>(
      `https://resume.adriens-apis.io/pdf/jobs/${jobId}/`
    );
    return data;
  } catch (err) {
    console.error("Error fetching Job: " + JSON.stringify(err));
    throw new AxiosError("Error fetching Job: " + JSON.stringify(err));
  }
};

export const getJobs = async (
  parms: Record<string, any>,
  headers?: Record<string, any>
): Promise<Job[]> => {
  const response = await axios.get<Job[]>(
    `https://resume.adriens-apis.io/pdf/jobs/`,
    {
      headers: { ...headers },
      params: { ...parms },
    }
  );
  return response.data;
};

export async function getFavicon({
  company,
  domain,
  headers,
}: {
  company?: string;
  domain?: string;
  headers?: Record<string, string>;
}): Promise<{ favicon: string }> {
  if (company === "" || !company) {
    console.log("No company name provided, returning empty string.");
    return { favicon: "" };
  } else if (domain && domain !== "") {
    return {
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=48`,
    };
  } else {
    try {
      const jobs = await getJobs(
        {
          company: company,
          favicon: JSON.stringify({ $exists: true }),
        },
        headers
      );
      console.log(jobs);
      if (jobs.length > 0) {
        return { favicon: jobs[0].favicon };
      }
    } catch (e: any) {
      console.error(
        "Error attempting to fetch jobs from same company for the favicon:"
      );
      if (e.response) {
        console.error(e.response.data);
        console.error(e.response.status);
        console.error(e.response.headers);
      } else if (e.request) {
        console.error(e.request);
      } else {
        console.error("Error", e.message);
      }
    }
  }
  return { favicon: "" };
}

export const generateJob = async (
  headers: IncomingHttpHeaders,
  jobDescription: string
): Promise<JobInput> => {
  const { models: jobExtractor } = await getModel();
  const myPrompt = `Here is a job posting: ${jobDescription}
        Analyze it to extract the following information: Company name, job title (without extraneous indications like all genders or m/w/d), link to favicon or link to company website, and job description.`;
  const contents = [{ role: "user", parts: [{ text: myPrompt }] }];
  const instructions =
    "You are a text/ information extractor. Take the provided job posting and categorize faithfully and with extreme accuracy the data into the provided schema.";
  const config = createConfig(
    0,
    instructions,
    undefined,
    undefined,
    JobInputSchema,
    "application/json"
  );
  const {
    candidates,
    data,
    text,
    parsed: job,
  } = await inferContent(jobExtractor, undefined, config, contents);
  const { favicon } = await getFavicon({
    company: job.company,
    domain: job.domain,
    headers: { Authorization: headers.authorization },
  });
  job.favicon = favicon;

  return job;
};

export const getResume = async (resumeId: string): Promise<ResumeDocument> => {
  try {
    const { data } = await axios.get<ResumeDocument>(
      `https://resume.adriens-apis.io/pdf/resumes/${resumeId}/`
    );
    return data;
  } catch (err) {
    console.error(err);
    throw new AxiosError(err);
  }
};

export const getLinkedResume = async (job: Job | Job["id"]) => {
  const { resume: resumeId } = await getJob(
    typeof job === "string" ? job : job.id
  );
  const resume = await getResume(resumeId);
  return resume;
};
