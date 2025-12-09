import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { configDotenv } from "dotenv";
configDotenv();

let auth: JWT | null = null;
const getAuth = async () => {
  if (
    !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    !process.env.SHEET_ID
  ) {
    throw new Error("Missing environment variables for Google service account");
  } else {
    if (auth) {
      return auth;
    } else {
      const token = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        ),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      try {
        auth = token;
        await auth.authorize();
        console.log("Successfully authenticated to Google Sheets.");
        return auth;
      } catch (err) {
        console.error(
          "Error authenticating to Google Sheets: " + JSON.stringify(err)
        );
        throw new Error(
          "Error authenticating to Google Sheets: " + JSON.stringify(err)
        );
      }
    }
  }
};

export async function putValuesREST(
  spreadsheetId: string,
  range: string,
  values: string[][]
) {
  try {
    const service = google.sheets({ version: "v4", auth: await getAuth() });
    spreadsheetId = process.env.SHEET_ID;
    const { data } = await service.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    return data.updates.updatedCells;
  } catch (err) {
    console.error(
      "Error appending values to spreadsheet: " + JSON.stringify(err)
    );
    throw err;
  }
}
