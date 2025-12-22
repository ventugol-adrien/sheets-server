import { config as configDotenv } from "dotenv";
import express, { Request, Response } from "express";
import geoip from "geoip-lite";
import {
  appendSheet,
  createFolder,
  createResearchDoc,
  writeSheet,
} from "./services/sheets.js";
import { unlinkSync } from "fs";
import cors from "cors";
import { Job, JobInput, OriginsSchema, Question } from "./types.js";
import { generateJob, getJob, getLinkedResume } from "./services/jobs.js";
import { askQuestion, inferTheme } from "./services/question.js";
import { postResearch, startChat } from "./utils/model.js";
import { logResearchEnd, logResearchStart } from "./utils/log.js";
configDotenv();
const app = express();
const port = process.env.PORT;

const spreadsheetId = process.env.SHEET_ID;
const allowedOrigins = OriginsSchema.parse(JSON.parse(process.env.WEB_URL));
app.use(
  cors({
    origin: [...allowedOrigins, "https://adriens-resume-tailor.org"],
    credentials: true,
  })
);
app.use(express.json());
app.post(
  "/spreadsheet/jobs",
  async (
    req: Request<{}, {}, { jobDescription: string }>,
    res: Response<JobInput>
  ) => {
    const { jobDescription } = req.body;
    const generatedJob = await generateJob(req.headers, jobDescription);
    res.status(201).json(generatedJob);
  }
);

app.put(
  "/spreadsheet/jobs",
  async (req: Request<{}, {}, { jobId: string }>, res: Response<Job>) => {
    const job = await getJob(req.body.jobId);
    const { company, id } = job;
    const range = "Links (Dublin)!A1:C2";
    const row = [
      [company, `https://adriens-interactive-resume.org/${id}`, "❓"],
    ];
    await appendSheet(spreadsheetId, range, row);
    res.status(201).json({ ...job });
  }
);

app.post(
  "/spreadsheet/research/",
  async (
    req: Request<{}, {}, { topic: string; title: string; folder }>,
    res: Response
  ) => {
    try {
      const { topic, title } = req.body;
      const id = logResearchStart("./logs/log.log");
      const filePath = await postResearch(topic, title);
      if (filePath) {
        await createResearchDoc(title, filePath);
        unlinkSync(filePath);
        res.json("Research uploaded.");
        logResearchEnd("../logs/log.log", id);
      } else {
        throw new Error("Research failed to generate output.");
      }
    } catch (err) {
      console.error("Error researching the following topic:", err);
      res.status(500).json("Sorry, unable to research this topic.");
    }
  }
);

app.post(
  "/spreadsheet/question/",
  async (req: Request<{}, {}, Question>, res: Response) => {
    const ip = req.socket?.remoteAddress;
    const loc = geoip.lookup(ip);
    console.log(loc);
    const { asker, question, time } = req.body;
    const { chat } = await startChat();
    const referenceRange = "Qs!A1:C2";
    const appendResponse = await appendSheet(spreadsheetId, referenceRange, [
      new Array(8).fill(""),
    ]);
    const updateRange = appendResponse.updates.updatedRange;
    const [rowNumber, ...othermatches] = updateRange.match(/\d+/);
    try {
      //  we can log the question, time and asker immediately:
      await writeSheet(spreadsheetId, `Qs!A${rowNumber}:D${rowNumber}`, [
        [question, time, "", asker],
      ]);
      if (asker && asker !== "") {
        //job id found in request, we need to fetch context (job + linked resume) before we can answer the question,

        //use .then to write the data to the sheet inside Promise.all
        const [job, resume, theme] = await Promise.all([
          getJob(asker).then((job) => {
            //Write Job data:
            const { company, link, description } = job;
            writeSheet(spreadsheetId, `Qs!E${rowNumber}:G${rowNumber}`, [
              [company, link, description],
            ]);
            return job;
          }),

          //No Resume data gets written to the spreadsheet. Next!
          getLinkedResume(asker),

          inferTheme(question, chat).then(({ theme }) => {
            //Write theme. We've written C${rownumber} to "" above, we're now overwriting that.
            writeSheet(spreadsheetId, `Qs!C${rowNumber}:C${rowNumber}`, [
              [theme],
            ]);
            return theme;
          }),
        ]);
        const { title, company, link, description } = job;

        //Now we have all the data, answer the question
        const response = await askQuestion(
          question,
          title,
          company,
          description,
          resume
        );
        //return the response.
        res.status(201).json(response);
        // Write the answer to the question in the sheet:
        await writeSheet(spreadsheetId, `Qs!H${rowNumber}:H${rowNumber}`, [
          [response.answer],
        ]);
        return;
      } else {
        //No job id found, the question was asked from the generic page. infer the theme and ask the question in parallel.
        const [_, response] = await Promise.all([
          inferTheme(question, chat).then(({ theme }) => {
            //Write the theme:
            writeSheet(spreadsheetId, `Qs!C${rowNumber}:C${rowNumber}`, [
              [theme],
            ]);
            return theme;
          }),
          askQuestion(question).then((response) => {
            //Write the answer on the spreadsheet:
            writeSheet(spreadsheetId, `Qs!H${rowNumber}:H${rowNumber}`, [
              [response.answer],
            ]);
            return response;
          }),
        ]);
        res.status(201).json(response);
        return;
      }
    } catch (error: any) {
      console.error("Error Answering question: " + JSON.stringify(error));
      res.status(error.status || 500).json({
        answer:
          "Sorry, I couldn't quite answer that, please ask again at a later time.",
      });
    }
  }
);
interface ResearchTask {
  topic: string;
  title: string;
  folderOverride?: string;
}
interface IntelligenceRequest {
  parentFolderName?: string;
  tasks: ResearchTask[];
}
app.post(
  "/drive/research/",
  async (req: Request<{}, {}, IntelligenceRequest>, res: Response) => {
    try {
      const { parentFolderName, tasks } = req.body;
      console.log("Received request body:", JSON.stringify(req.body, null, 2));
      const createFolderResponse = await createFolder(parentFolderName);
      console.log("Folder created:", createFolderResponse.data);
      const researchTasks = tasks.map(
        async ({ title, topic, folderOverride }) => {
          const id = logResearchStart("./logs/log.log");
          const filePath = await postResearch(topic, title);
          if (filePath) {
            const createDocResponse = await createResearchDoc(
              title,
              filePath,
              folderOverride ? folderOverride : createFolderResponse.data.id
            );
            unlinkSync(filePath);
            logResearchEnd("../logs/log.log", id);
            console.log(`Reasearch task ${title} completed.`);
            return createDocResponse.data.id;
          } else {
            throw new Error("Research failed to generate output.");
          }
        }
      );
      const docIds = await Promise.all(researchTasks);
      res
        .status(201)
        .json(docIds.map((id) => `https://docs.google.com/document/d/${id}`));
    } catch (err) {
      console.error("Error researching tasks:", err);
      res.status(500).json("Sorry, unable to research these topics.");
    }
  }
);

app.listen(port, () => {
  console.log(
    `Server listening at ${
      process.env.NODE_ENV == "DEV" ? "http://localhost:" + port : port
    }`
  );
});
