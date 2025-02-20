# Sheets Server

This project provides a server that retrieves and updates data in Google Sheets using the Google Sheets API. It exposes several API endpoints for accessing and manipulating spreadsheet data.

## Technologies Used

*   **Node.js:** JavaScript runtime environment
*   **Express:** Web application framework for Node.js
*   **TypeScript:** Superset of JavaScript that adds static typing
*   **Google Sheets API:** API for interacting with Google Sheets
*   **googleapis:** Node.js client library for accessing Google APIs
*   **google-auth-library:** Library for authenticating with Google APIs
*   **cors:** Middleware for enabling Cross-Origin Resource Sharing (CORS)
*   **dotenv:** Module for loading environment variables from a `.env` file
*   **uuid:** Library for generating unique identifiers
*   **gcloud CLI:** Google Cloud command-line interface for deployment

## Project Structure
sheets-server/
├── .git/               # Git repository
├── .github/            # GitHub configuration (e.g., workflows)
├── src/                # Source code
│   ├── assets/         # Static assets (e.g., job data)
│   │   └── jobs.ts     # Job data definitions
│   ├── services/       # Service modules
│   │   ├── getJobs.ts  # Job retrieval logic
│   │   └── getSheets.ts# Google Sheets API interaction
│   ├── types.ts        # TypeScript type definitions
│   ├── index.ts        # Main application entry point
│   └── index.js        # Compiled JavaScript output
├── .env                # Environment variables (API keys, etc.)
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── fix-imports.js      # Script to fix import statements
├── README.md           # This file
└── LICENSE             # License information

## Scripts

The following scripts are defined in the `package.json` file:

*   `newId`: Generates a new UUID v4 using `npx uuid v4`.
*   `test`: Placeholder for running tests (currently does nothing).
*   `compile`: Compiles the TypeScript code using `tsc` and fixes import statements using `node fix-imports.js`.
*   `deploy`: Deploys the server to Google Cloud Run using `gcloud run deploy`.
*   `start`: Starts the server using `node src/index.js`.

## API Endpoints

The server exposes the following API endpoints:

*   **`GET /spreadsheet/range`**: Retrieves data from a specified range in a Google Sheet.
    *   **Query Parameters:** None
    *   **Response:** JSON array containing the data from the specified range.
    *   **Example:** `/spreadsheet/range`
*   **`GET /job`**: Retrieves job data based on the provided ID.
    *   **Query Parameters:**
        *   `id` (string): The ID of the job to retrieve.
    *   **Response:** JSON object containing the job data.
    *   **Example:** `/job?id=3c7a8979-a7b6-492f-a636-825e203663c1`
*   **`GET /company`**: Retrieves company data (name and favicon) based on the provided job ID.
    *   **Query Parameters:**
        *   `id` (string): The ID of the job to retrieve the company data from.
    *   **Response:** JSON object containing the company name and favicon.
    *   **Example:** `/company?id=3c7a8979-a7b6-492f-a636-825e203663c1`
*   **`PUT /spreadsheet/update/:asker`**: Updates a row in the spreadsheet.
    *   **URL Parameters:**
        *   `asker` (string): The ID of the person asking the question.
    *   **Request Body:** JSON object containing the question, time, and theme.
        ```json
        {
            "question": "What is the meaning of life?",
            "time": "10:00 AM",
            "theme": "Philosophy",
            "asker": "some-asker-id"
        }
        ```
    *   **Response:** JSON object with a success message.
    *   **Example:** `/spreadsheet/update/some-asker-id`

## Environment Variables

The following environment variables must be set for the server to function correctly:

*   [GOOGLE_SERVICE_ACCOUNT_EMAIL](http://_vscodecontentref_/10): The email address of the Google service account.
*   [GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY](http://_vscodecontentref_/11): The private key of the Google service account.

These environment variables are loaded from the [.env](http://_vscodecontentref_/12) file using the `dotenv` module.  **Note:** Never commit your [.env](http://_vscodecontentref_/13) file to a public repository.

## Deployment

The server is designed to be deployed to Google Cloud Run. The `deploy` script in [package.json](http://_vscodecontentref_/14) automates the deployment process.

1.  **Configure the gcloud CLI:**

    *   Install the gcloud CLI:  Follow the instructions on the [Google Cloud documentation](https://cloud.google.com/sdk/docs/install).
    *   Authenticate with your Google Cloud account:

        ```bash
        gcloud auth login
        ```

    *   Set the project and region:

        ```bash
        gcloud config set core/project your-project-id
        gcloud config set compute/region your-region
        ```

        Replace `your-project-id` and `your-region` with your actual project ID and region.
    *   Activate the Cloud Run configuration:

        ```bash
        gcloud config configurations activate sheets-server
        ```

2.  **Deploy the server:**

    Run the following command:

    ```bash
    npm run deploy
    ```

    This will compile the TypeScript code, fix the import statements, and deploy the server to Google Cloud Run.

## Running Locally

To run the server locally, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Create a [.env](http://_vscodecontentref_/15) file:**

    Create a [.env](http://_vscodecontentref_/16) file in the root directory of the project and set the required environment variables.

3.  **Compile the TypeScript code:**

    ```bash
    npm run compile
    ```

4.  **Start the server:**

    ```bash
    npm start
    ```

    The server will start listening on port 8080.

## License

This project is licensed under the MIT License - see the [LICENSE](http://_vscodecontentref_/17) file for details.
