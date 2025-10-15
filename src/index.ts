import express, { Request, Response } from "express";
import { putValuesREST } from "./services/sheets.js";
import cors from "cors";
import { JobInput, Question } from "./types.js";
import { configDotenv } from "dotenv";
import { generateJob, getJob } from "./services/jobs.js";
import { sheets_v4 } from "googleapis";
configDotenv();
const app = express();
const port = process.env.PORT;

const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
app.use(
  cors({
    origin: [
      process.env.WEB_URL,
      "https://adriens-resume-tailor.org",
      "http://localhost:8080",
      "http://localhost:3000",
    ],
  })
);
app.use(express.json());

// Goal: Take a job description and use AI to extract relevant data
app.post(
  "/spreadsheet/jobs",
  async (
    req: Request<{}, {}, { jobDescription: string }>,
    res: Response<JobInput>
  ) => {
    const { jobDescription } = req.body;
    const generatedJob = await generateJob(jobDescription);
    res.status(201).json(generatedJob);
  }
);

app.put(
  "/spreadsheet/jobs",
  async (
    req: Request<{}, {}, { jobId: string }>,
    res: Response<sheets_v4.Schema$AppendValuesResponse>
  ) => {
    const { company, id } = await getJob(req.body.jobId);
    const range = "Links (Dublin)!A1:C2";
    const row = [
      [company, `https://adriens-interactive-resume.org/${id}`, "❓"],
    ];
    const data = await putValuesREST(spreadsheetId, range, row);
    res.status(201).json(data);
  }
);

app.post(
  "/spreadsheet/question",
  async (req: Request<{}, {}, Question>, res: Response) => {
    const { asker, response, question, time, theme } = req.body;
    const range = "Qs!A1:C2";

    const job = asker ? await getJob(asker) : undefined;
    const jobData = job
      ? [job.company, job.link, job.description]
      : ["N/A", "N/A", "N/A", "N/A"];

    const row = [question, time, theme, asker, ...jobData, response];

    try {
      const data = await putValuesREST(spreadsheetId, range, [row]);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch spreadsheet data on the spreadsheet.",
      });
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
