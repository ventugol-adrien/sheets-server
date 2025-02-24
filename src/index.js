import express from 'express';
import { getValuesREST, putValuesREST } from './services/getSheets.js';
import cors from 'cors';
import { getJob } from './services/getJobs.js';
import { configDotenv } from 'dotenv';
configDotenv();
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
        if (req.query.id) {
            getJob(req.query.id).then((job) => {
                console.log(job);
                res.json(job);
            });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
});
app.get('/company', (req, res) => {
    try {
        getJob(req.query.id).then((job) => {
            const data = { company: job.company, favicon: job.favicon };
            res.json(data);
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch spreadsheet data' });
    }
});
app.put('/spreadsheet/update/:asker', async (req, res) => {
    try {
        getJob(req.params.asker).then((job) => {
            var _a, _b, _c, _d, _e;
            const range = "Qs";
            const newValues = [[req.body.question, req.body.time, req.body.theme, (_a = req.body.asker) !== null && _a !== void 0 ? _a : '', (_b = job === null || job === void 0 ? void 0 : job.company) !== null && _b !== void 0 ? _b : '', (_c = job === null || job === void 0 ? void 0 : job.link) !== null && _c !== void 0 ? _c : '', (_d = job === null || job === void 0 ? void 0 : job.description) !== null && _d !== void 0 ? _d : '']];
            putValuesREST((_e = process.env.SHEET_ID) !== null && _e !== void 0 ? _e : "", range, newValues);
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update some of the spreadsheet data' });
    }
});
app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
