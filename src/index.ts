import express, {Request,Response} from 'express';
import { getValuesREST, putValuesREST } from './services/getSheets';
import cors from 'cors';
import { Job, Question } from './types';
import { getJob } from './services/getJobs';

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
      const data = getJob(req.query.id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
  });

  app.get('/company', (req: Request<{},{},{},{id:string}>, res:Response) => {
    try {
      const job = getJob(req.query.id) as Job
      const data = { company: job.company, favicon: job.favicon }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
  });

app.put('/spreadsheet/update/:asker', async (req: Request<{asker:string},{},Question>, res:Response) => {
    try {
        const job = getJob(req.params.asker) as Job | null;
        const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
        const range = "Qs";
        const newValues = [[req.body.question, req.body.time, req.body.theme, req.body.asker ?? '', job?.company ?? '', job?.link ?? '', job?.description ?? '']];
        await putValuesREST(spreadsheetId, range, newValues);

    } catch (error){
        res.status(500).json({ error: 'Failed to update some of the spreadsheet data' });
    }

});
  
  app.listen(port, () => {
    console.log(`Server listening at ${port}`);
  });