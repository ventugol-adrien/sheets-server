import express, { Request, Response } from "express";
import { createResearchDoc, putValuesREST } from "./services/sheets.js";
import { unlinkSync } from "fs";
import cors from "cors";
import { Job, JobInput, OriginsSchema, Question } from "./types.js";
import { configDotenv } from "dotenv";
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
    await putValuesREST(spreadsheetId, range, row);
    res.status(201).json({ ...job });
  }
);

app.post(
  "/spreadsheet/question/",
  async (req: Request<{}, {}, Question>, res: Response) => {
    let row: string[] | null = null;
    const { asker, question, time } = req.body;
    try {
      const [job, resume, { theme }] = await Promise.all([
        getJob(asker),
        getLinkedResume(asker),
        inferTheme(question, await startChat()),
      ]);
      const { title, company, link, description } = job;
      const response = await askQuestion(
        question,
        title,
        company,
        description,
        resume
      );
      const jobData = [company, link, description];

      row = [question, time, theme, asker, ...jobData, response.answer];
      res.status(201).json(response);
    } catch (error: any) {
      console.error("Error Answering question: " + JSON.stringify(error));
      res.status(error.status).json({
        answer:
          "Sorry, I couldn't quite answer that, please ask again at a later time.",
      });
    }
    try {
      const range = "Qs!A1:C2";
      await putValuesREST(spreadsheetId, range, [row]);
      return;
    } catch (error) {
      console.error(
        "Error putting values in the sheet: " + JSON.stringify(error)
      );
      return;
    }
  }
);

app.post(
  "/spreadsheet/research/",
  async (
    req: Request<{}, {}, { topic: string; title: string }>,
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

app.listen(port, () => {
  if (process.env.NODE_ENV == "DEV") {
  }
  console.log(
    `Server listening at ${
      process.env.NODE_ENV == "DEV" ? "http://localhost:" + port : port
    }`
  );
});
