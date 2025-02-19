import express from 'express';
import { getValuesREST, putValuesREST } from './services/getSheets.js';
import cors from 'cors';
import { getJob } from './services/getJobs.js';
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
app.put('/spreadsheet/update/:asker', async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const job = getJob(req.params.asker);
        const spreadsheetId = "122LIKJ4G8KSomRhotHoRuOGK5ep0-V5tm0OEoM5Kv9w";
        const range = "Qs";
        const newValues = [[req.body.question, req.body.time, req.body.theme, (_a = req.body.asker) !== null && _a !== void 0 ? _a : '', (_b = job === null || job === void 0 ? void 0 : job.company) !== null && _b !== void 0 ? _b : '', (_c = job === null || job === void 0 ? void 0 : job.link) !== null && _c !== void 0 ? _c : '', (_d = job === null || job === void 0 ? void 0 : job.description) !== null && _d !== void 0 ? _d : '']];
        await putValuesREST(spreadsheetId, range, newValues);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update some of the spreadsheet data' });
    }
});
app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
