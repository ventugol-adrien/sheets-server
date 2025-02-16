import express, {Request,Response} from 'express';
import { configDotenv } from 'dotenv';
import { getValuesREST, putValuesREST } from './services/getSheets';
import cors from 'cors';
import { Question } from './types';

configDotenv();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json())

app.get('/spreadsheet/range', async (req: Request<{},{},Question>, res:Response) => {
    try {
      const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
      const range = "Qs!A1:C2";
      const data = await getValuesREST(spreadsheetId, range);
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
  });

app.put('/spreadsheet/update', async (req: Request<{},{},Question>, res:Response) => {
    console.log('Updating spreadsheet data...', );
    try {
        const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
        const range = "Qs";
        const newValues = [[req.body.question, req.body.time, req.body.theme]];
        await putValuesREST(spreadsheetId, range, newValues);
        console.log('Spreadsheet data updated.');

    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Failed to update spreadsheet data' });
    }

});
  
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });