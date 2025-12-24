import { config as configDotenv } from "dotenv";
import express, { Request, Response } from "express";
import geoip from "geoip-lite";
import {
  appendSheet,
  createGoogleDriveFolder,
  uploadToGoogleDoc,
  writeSheet,
} from "./services/google.js";
import { unlinkSync } from "fs";
import cors from "cors";
import { JobInput, OriginsSchema, Question } from "./types.js";
import { generateJob, getJob, getLinkedResume } from "./services/jobs.js";
import { askQuestion, inferTheme } from "./services/question.js";
import { postResearch, startChat } from "./services/model.js";
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
  async (req: Request<{}, {}, { jobId: string }>, res: Response) => {
    const job = await getJob(req.body.jobId);

    const { company, id } = job;
    const range = "Links (Dublin)!A1:C2";
    const row = [
      [company, `https://adriens-interactive-resume.org/${id}`, "❓"],
    ];
    const appendJobToSheetResponse = await appendSheet(
      spreadsheetId,
      range,
      row
    );
    res.status(201).json(appendJobToSheetResponse);

    const createFolderResponse = await createGoogleDriveFolder(
      `${job.company} Intelligence`
    );
    const dueDiligence: ResearchTask[] = [
      {
        title: `${job.company} Moment`,
        topic: `Here is a job description: ${job.description} for a ${job.title} at ${job.company}. Deep dive into the company, and describe what moment it finds itself in, and how this job relates (if it does). Include the following: Primary business and revenue streams, Advertised core values and north stars, main competitors and business rivals, primary technology stack. Also include any information that may help an applicant pass the HR screen and hiring manager interview.`,
      },
      {
        title: `${job.company} Technical Screen`,
        topic: `Here is a job description: ${job.description} for a ${job.title} at ${job.company}. Deep dive into its hiring process, focusing on any and all technical screens employed to assess candidates for the role. Search and assemble a list of specific exercises which candidates to this role (or a closely related one) have gone through. Return a final report highlighting how a candidate may best prepare for those technical screens.`,
      },
    ];

    const researchTasks = dueDiligence.map(
      async ({ title, topic, folderOverride }) => {
        //const id = logResearchStart("./logs/log.log");
        const filePath = await postResearch(topic, title);
        if (filePath) {
          const createDocResponse = await uploadToGoogleDoc(
            title,
            filePath,
            "text/markdown",
            folderOverride ? folderOverride : createFolderResponse.data.id
          );
          unlinkSync(filePath);
          //logResearchEnd("../logs/log.log", id);
          console.log(`Reasearch task ${title} completed.`);
          return createDocResponse.data.id;
        } else {
          throw new Error("Research failed to generate output.");
        }
      }
    );
    await Promise.all([...researchTasks]);
    return;
  }
);

app.post(
  "/spreadsheet/question/",
  async (req: Request<{}, {}, Question>, res: Response) => {
    const ip = req.socket?.remoteAddress;
    const { asker, question, time } = req.body;
    const { chat } = await startChat();
    const referenceRange = "Qs!A1:C2";
    const appendResponse = await appendSheet(spreadsheetId, referenceRange, [
      new Array(8).fill(""),
    ]);
    const updateRange = appendResponse.updates.updatedRange;
    const [rowNumber, ..._] = updateRange.match(/\d+/);
    try {
      //  we can log the question, time and asker immediately:
      await writeSheet(spreadsheetId, `Qs!A${rowNumber}:D${rowNumber}`, [
        [question, time, "", asker],
      ]);
      if (asker && asker !== "") {
        //job id found in request, we need to fetch context (job + linked resume) before we can answer the question,
        //use .then to write the data to the sheet inside Promise.all
        const [job, resume] = await Promise.all([
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
      const createFolderResponse = await createGoogleDriveFolder(
        parentFolderName
      );
      console.log("Folder created:", createFolderResponse.data);
      const researchTasks = tasks.map(
        async ({ title, topic, folderOverride }) => {
          // const id = logResearchStart("./logs/log.log");
          const filePath = await postResearch(topic, title);
          if (filePath) {
            const createDocResponse = await uploadToGoogleDoc(
              title,
              filePath,
              "text/markdown",
              folderOverride ? folderOverride : createFolderResponse.data.id
            );
            unlinkSync(filePath);
            // logResearchEnd("../logs/log.log", id);
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
