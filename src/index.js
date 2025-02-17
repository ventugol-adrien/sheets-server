import express from 'express';
import { getValuesREST, putValuesREST } from './services/getSheets.js';
import cors from 'cors';
const app = express();
const port = 8080;
app.use(cors());
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
app.put('/spreadsheet/update', async (req, res) => {
    try {
        const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
        const range = "Qs";
        const newValues = [[req.body.question, req.body.time, req.body.theme]];
        await putValuesREST(spreadsheetId, range, newValues);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update some of the spreadsheet data' });
    }
});
app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
