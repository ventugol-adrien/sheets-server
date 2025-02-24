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
