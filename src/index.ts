import express, { Request, Response } from "express";
import { getValuesREST, putValuesREST } from "./services/getSheets.js";
import cors from "cors";
import { Question } from "./types.js";
import { getJob } from "./services/getJobs.js";
import { configDotenv } from "dotenv";
import { z } from "zod";
import { Job, prefillJob, PromptSchema, putJob } from "./services/addJob.js";
import bodyParser from "body-parser";
configDotenv();
const app = express();
const port = 8080;
enum Action {
  query = "query",
  update = "update",
  op = "operate",
}
interface AppContext {
  action: Action;
  data?: string;
}
const context: AppContext = {
  action: Action.op,
};

const PromptSchemaArray = z.array(PromptSchema);
type PromptArray = z.infer<typeof PromptSchemaArray>;
app.use(
  cors({
    origin: [process.env.WEB_URL, "https://adriens-resume-tailor.org/"],
  })
);
app.use(express.json());

app.get(
  "/spreadsheet/range",
  async (req: Request<{}, {}, Question>, res: Response) => {
    try {
      const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
      const range = "Qs!A1:C2";
      const data = await getValuesREST(spreadsheetId, range);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch spreadsheet data on the spreadsheet.",
      });
    }
  }
);

app.get("/job", (req: Request<{}, {}, {}, { id: string }>, res: Response) => {
  console.log("request for job received with id", req.query.id);
  app.locals;
  try {
    if (req.query.id) {
      getJob(req.query.id).then((job) => {
        console.log(job);
        res.json(job);
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch spreadsheet data on the job" });
  }
});

app.get(
  "/company",
  (req: Request<{}, {}, {}, { id: string }>, res: Response) => {
    try {
      getJob(req.query.id).then((job) => {
        const data = { company: job.company, favicon: job.favicon };
        res.json(data);
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data on the company" });
    }
  }
);

app.post(
  "/newJob",
  async (
    req: Request<{}, {}, { job_posting: string }>,
    res: Response<PromptArray | { error: string }>
  ) => {
    console.log("request for new job received", req);
    try {
      context.action = Action.query;
      console.log("set context to query", context);
      const jobDescription = z.string().parse(req.body.job_posting);
      console.log("parsed job description", jobDescription);
      try {
        const prompts = PromptSchemaArray.parse(
          await prefillJob(jobDescription)
        );
        console.log("parsed prompts", prompts);
        context.data = JSON.stringify(prompts);
        console.log("set context data to prompts", context.data);
        res.json(prompts);
      } catch (error) {
        console.log("Error parsing prompts", error);
        res.status(500).json({ error: "Failed to parse prompts" });
        return;
      }
    } catch (error) {
      res.status(500).json({ error: "Error posting new job." });
    }
  }
);

app.put("/newJob", async (req: Request<{}, {}, Job>, res: Response) => {
  try {
    await putJob(req.body).then((link) => {
      res.json({ message: "Job added successfully.", link: link });
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update some of the spreadsheet data" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
