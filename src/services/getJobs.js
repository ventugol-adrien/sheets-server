import { ashbyJob, everstoxJob, frankaRoboticsJob, konuxJob, openAIJob, personioJob_1, personioJob_2, shapeInJob, understandRecruitmentJob } from "../assets/jobs.js";
const matchJob = {
    "3c7a8979-a7b6-492f-a636-825e203663c1": openAIJob,
    "7c01ff39-ed7a-4b4e-9c1f-54c13efa20ce": frankaRoboticsJob,
    "1c12803e-4353-4359-b4ff-f1ddb69e8e07": ashbyJob,
    "a35383f2-241d-4b13-9b2d-3af43550c45f": shapeInJob,
    "b12fe041-3f7f-4f43-8006-c945a0a467ff": personioJob_1,
    "496559b5-a164-43cb-8d48-71963400ff68": personioJob_2,
    "146968c4-0022-4f51-b789-5227d62c307e": understandRecruitmentJob,
    "4bc3d7b0-3b01-48ef-b993-189b112396a6": everstoxJob,
    "97c4129a-d49c-4262-8293-9dd756b73477": konuxJob,
};
export const getJob = (id) => {
    return matchJob[id]();
};
import * as mongo from 'mongodb';
import { configDotenv } from 'dotenv';
import { castToJob } from '../types.js';
configDotenv();
const uri = `mongodb+srv://admin:${process.env.MONGODB_PWD}@cluster0.akpza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new mongo.MongoClient(uri, {
    serverApi: {
        version: mongo.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const [dbName, collectionName] = ['interactive-resume', 'jobs'];
const database = client.db(dbName);
const collection = database.collection(collectionName);
export async function getJob(JobId) {
    const findJobQuery = { id: JobId };
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const findOneResult = await collection.findOne(findJobQuery);
        return castToJob(findOneResult);
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
