import { google } from "googleapis";
import { JWT } from 'google-auth-library';
import { configDotenv } from 'dotenv';
configDotenv();
export async function getValuesREST(spreadsheetId, range) {
    var _a;
    const auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: (_a = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const service = google.sheets({ version: 'v4', auth });
    try {
        const result = await service.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        const numRows = result.data.values ? result.data.values.length : 0;
        return result.data.values;
    }
    catch (err) {
        // TODO (developer) - Handle exception
        throw err;
    }
}
export async function putValuesREST(spreadsheetId, range, values) {
    var _a;
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
        throw new Error('Missing environment variables for Google service account');
    }
    else {
        const auth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: (_a = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const service = google.sheets({ version: 'v4', auth });
        try {
            const result = await service.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                requestBody: { values },
            });
            return result.data;
        }
        catch (err) {
            // TODO (developer) - Handle exception
            throw err;
        }
    }
}
