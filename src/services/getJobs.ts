import * as mongo from "mongodb";
import { configDotenv } from "dotenv";
import { IdJob, Job, castToJob } from "../types.js";
import { jobSchema } from "./addJob.js";
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

export async function getFavicon(company: string): Promise<string> {
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
      return "";
    } else {
      const job = jobSchema.parse(findOneResult);
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
