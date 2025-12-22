import { drive_v3, google, sheets_v4 } from "googleapis";
import { JWT, OAuth2Client } from "google-auth-library";
import { configDotenv } from "dotenv";
import { createReadStream } from "fs";
configDotenv();

let auth: sheets_v4.Sheets | null = null;
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
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive",
        ],
      });
      try {
        auth = google.sheets({ version: "v4", auth: token });
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

let driveService: drive_v3.Drive | null;
const getOauth2 = () => {
  if (
    process.env.REFRESH_TOKEN &&
    process.env.CLIENT_ID &&
    process.env.CLIENT_SECRET
  ) {
    if (driveService) {
      return driveService;
    }
    try {
      const client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET
      );
      client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
      driveService = google.drive({ version: "v3", auth: client });
      return driveService;
    } catch (error) {
      console.error("Error initializing Drive client");
      throw new Error("Error initializing Drive client");
    }
  } else {
    throw new Error("Missing ENV");
  }
};

export async function appendSheet(
  spreadsheetId: string,
  range: string,
  values: string[][]
) {
  try {
    const service = await getAuth();
    spreadsheetId = process.env.SHEET_ID;
    const { data } = await service.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    return data;
  } catch (err) {
    console.error(
      "Error appending values to spreadsheet: " + JSON.stringify(err)
    );
    throw err;
  }
}

export async function writeSheet(
  spreadsheetId: string,
  range: string,
  values: string[][]
) {
  try {
    const service = await getAuth();
    const { data } = await service.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    return data.updatedData;
  } catch (err) {
    console.error(
      "Error writing values on spreadsheet: " + JSON.stringify(err)
    );
    throw err;
  }
}

export const createFolder = async (folderName: string) => {
  const driveService = getOauth2();
  return await driveService.files.create({
    requestBody: {
      mimeType: "application/vnd.google-apps.folder",
      name: folderName || "Research Results",
    },
    fields: "id, name, webViewLink",
  });
};

export async function createResearchDoc(
  title: string,
  filePath: string,
  folderID?: string
) {
  try {
    const driveService = getOauth2();
    const file_metadata: drive_v3.Schema$File = {
      name: title,
      mimeType: "application/vnd.google-apps.document",
      parents: [folderID],
    };

    const response = await driveService.files.create({
      requestBody: file_metadata,
      media: {
        mimeType: "text/markdown",
        body: createReadStream(filePath),
      },
    });
    return response;
  } catch (err) {
    console.error("Error uploading file to drive: " + JSON.stringify(err));
    throw err;
  }
}
