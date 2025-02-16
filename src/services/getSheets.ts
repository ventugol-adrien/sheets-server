import { google } from "googleapis";
import { JWT } from 'google-auth-library';

export async function getValuesREST(spreadsheetId:string, range:string) { 
    console.log(process.env);
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const service = google.sheets({version: 'v4', auth});
  try {
    const result = await service.spreadsheets.values.get({
    spreadsheetId,
    range,
    });
    const numRows = result.data.values ? result.data.values.length : 0;
    console.log(`${numRows} rows retrieved.`);
    return result.data.values;
  } catch (err) {
    // TODO (developer) - Handle exception
    throw err;
  }
  }

  export async function putValuesREST(spreadsheetId:string, range:string, values: string[][]) {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const service = google.sheets({version: 'v4', auth});
    try {
      const result = await service.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values },
      });
      console.log(`${result.data.updates} cells updated.`);
      return result.data;
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }