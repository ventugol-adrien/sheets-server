import * as mongo from "mongodb";
import { configDotenv } from "dotenv";
import { IdJob, Job, castToJob } from "../types.js";
import { newJobSchema } from "./addJob.js";
import { z } from "zod";
configDotenv();

const uri = `mongodb+srv://admin:${process.env.MONGODB_PWD}@cluster0.akpza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new mongo.MongoClient(uri, {
  serverApi: {
    version: mongo.ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const [dbName, collectionName] = ["interactive-resume", "jobs"];
const database = client.db(dbName);
export const collection = database.collection(collectionName);

export async function getJob(JobId: string): Promise<Job> {
  const findJobQuery = { id: JobId };
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const findOneResult = await collection.findOne(findJobQuery);
    return castToJob(findOneResult);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

export async function getFavicon(
  company: string,
  domain?: string | undefined
): Promise<string> {
  if (company === "") {
    console.log("No company name provided, returning empty string.");
    return "";
  }
  const findJobQuery = { company: company };
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const findOneResult = await collection.findOne(findJobQuery);
    if (!findOneResult) {
      console.log("No job found for company:", company);
      if (domain) {
        console.log("Domain provided:", domain);
        const link: string = `https://www.google.com/s2/favicons?domain=${domain}&sz=48`;
        console.log("Here is the favicon we've found:", link);
        return link;
      }
      return "";
    } else {
      const job = newJobSchema.parse(findOneResult);
      console.log("Here is the favicon we've found:", job?.favicon);
      return job?.favicon ?? "";
    }
  } catch (error) {
    console.error("Error fetching favicon from MongoDB:", error);
    return "";
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

export async function putJob(job: IdJob): Promise<mongo.InsertOneResult> {
  const result = await collection.insertOne(job);
  return result;
}
const persistedJob = newJobSchema.extend({ id: z.string() }).nullable();
export const findJob = async (job: Job) => {
  try {
    await client.connect();
    const sameLink = persistedJob.parse(
      await collection.findOne({ link: job.link })
    );
    const sameData = persistedJob.parse(
      await collection.findOne({
        company: job.company,
        description: job.description,
        title: job.title,
      })
    );
    if (sameLink || sameData) {
      const foundId = sameLink?.id ?? sameData?.id;
      console.log("This job was already entered:", foundId);
      return `${process.env.WEB_URL}/${foundId}`;
    }
    return "";
  } catch (err) {
    console.error("error looking for matching job:", err);
  } finally {
    await client.close();
  }
};
