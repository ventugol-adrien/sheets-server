import express, {Request,Response} from 'express';
import { getValuesREST, putValuesREST } from './services/getSheets.js';
import cors from 'cors';
import { Question } from './types.js';
import { getJob } from './services/getJobs.js';
import { configDotenv } from 'dotenv';
configDotenv();
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json())

app.get('/spreadsheet/range', async (req: Request<{},{},Question>, res:Response) => {
    try {
      const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
      const range = "Qs!A1:C2";
      const data = await getValuesREST(spreadsheetId, range);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
  });

  app.get('/job', (req: Request<{},{},{},{id:string}>, res:Response) => {
    console.log("request for job received with id", req.query.id)
    try {
      if (req.query.id) {
        getJob(req.query.id).then((job)=>{
          console.log(job)
          res.json(job);
        })
      } 
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
  });

  app.get('/company', (req: Request<{},{},{},{id:string}>, res:Response) => {
    try {
      getJob(req.query.id).then((job)=>{
        const data = { company: job.company, favicon: job.favicon }
        res.json(data);
      })
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
  });

app.put('/spreadsheet/update/:asker', async (req: Request<{asker:string},{},Question>, res:Response) => {
    try {
        getJob(req.params.asker).then((job)=>{
          const range = "Qs";
          const newValues = [[req.body.question, req.body.time, req.body.theme, req.body.asker ?? '', job?.company ?? '', job?.link ?? '', job?.description ?? '']];
          putValuesREST(process.env.SHEET_ID ?? "", range, newValues);
        })

    } catch (error){
        res.status(500).json({ error: 'Failed to update some of the spreadsheet data' });
    }

});
  
  app.listen(port, () => {
    console.log(`Server listening at ${port}`);
  });