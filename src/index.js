import express from 'express';
import { getValuesREST, putValuesREST } from './services/getSheets.js';
import cors from 'cors';
import { getJob } from './services/getJobs.js';
const app = express();
const port = 8080;
app.use(cors({
    origin: 'http://localhost:8080',
}));
app.use(express.json());
app.get('/spreadsheet/range', async (req, res) => {
    try {
        const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
        const range = "Qs!A1:C2";
        const data = await getValuesREST(spreadsheetId, range);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
});
app.get('/job', (req, res) => {
    console.log("request for job received with id", req.query.id);
    try {
        const data = getJob(req.query.id);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
});
app.put('/spreadsheet/update/', async (req, res) => {
    try {
        const job = getJob(req.body.asker);
        const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
        const range = "Qs";
        const newValues = [[req.body.question, req.body.time, req.body.theme, req.body.asker || '', job ? job.company : '', job ? job.description : '']];
        await putValuesREST(spreadsheetId, range, newValues);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update some of the spreadsheet data' });
    }
});
app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
