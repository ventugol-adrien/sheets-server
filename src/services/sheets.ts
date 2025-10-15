import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { configDotenv } from "dotenv";
configDotenv();

export async function putValuesREST(
  spreadsheetId: string,
  range: string,
  values: string[][]
) {
  if (
    !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    !process.env.SHEET_ID
  ) {
    throw new Error("Missing environment variables for Google service account");
  } else {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const service = google.sheets({ version: "v4", auth });
    spreadsheetId = process.env.SHEET_ID;
    try {
      const result = await service.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values },
      });
      return result.data;
    } catch (err) {
      console.error("Error appending company + link to spreadsheet:", err);
      throw err;
    }
  }
}
