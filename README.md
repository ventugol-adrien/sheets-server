# Sheets Server

This project provides a server that retrieves and updates data in Google Sheets using the Google Sheets API. It exposes several API endpoints for accessing and manipulating spreadsheet data.

## Technologies Used

- **Node.js:** JavaScript runtime environment
- **Express:** Web application framework for Node.js
- **TypeScript:** Superset of JavaScript that adds static typing
- **Google Sheets API:** API for interacting with Google Sheets
- **googleapis:** Node.js client library for accessing Google APIs
- **google-auth-library:** Library for authenticating with Google APIs
- **Google Generative AI (Gemini):** AI service for extracting job information from descriptions
- **axios:** HTTP client for making API requests
- **cors:** Middleware for enabling Cross-Origin Resource Sharing (CORS)
- **dotenv:** Module for loading environment variables from a `.env` file
- **uuid:** Library for generating unique identifiers
- **zod:** TypeScript-first schema validation library
- **Docker:** Containerization platform for deployment
- **Google Cloud Run:** Serverless platform for deployment

## Project Structure

sheets-server/
├── .git/ # Git repository
├── .github/ # GitHub configuration (e.g., workflows)
├── src/ # Source code
│ ├── services/ # Service modules
│ │ ├── getJobs.ts # Job retrieval logic (legacy functions)
│ │ ├── jobs.ts # AI-powered job generation and processing
│ │ └── sheets.ts # Google Sheets API interaction
│ ├── types.ts # TypeScript type definitions and Zod schemas
│ └── index.ts # Main application entry point
├── dist/ # Compiled JavaScript output
├── .env # Environment variables (API keys, etc.)
├── dockerfile # Docker configuration for deployment
├── package.json # Project dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── README.md # This file
└── LICENSE # License information

## Scripts

The following scripts are defined in the `package.json` file:

- `newId`: Generates a new UUID v4 using `npx uuid v4`.
- `test`: Placeholder for running tests (currently does nothing).
- `compile`: Compiles the TypeScript code using `tsc -b`.
- `deploy`: Builds and deploys the server to Google Cloud Run using Docker.
- `redeploy`: Rebuilds without cache and deploys the server.
- `start`: Starts the server using `node ./dist/index.js`.
- `dev`: Starts the server in development mode with environment variables.
- `restart`: Compiles TypeScript and starts in development mode.

## API Endpoints

The server exposes the following API endpoints:

- **`POST /spreadsheet/job`**: Processes a job description using AI to extract relevant information.

  - **Request Body:** JSON object containing the job description.
    ```json
    {
      "jobDescription": "Full job posting text here..."
    }
    ```
  - **Response:** Array of prompt objects for user input validation.
  - **Example:** Creates interactive prompts for company name, job title, etc.

- **`PUT /spreadsheet/job`**: Adds a processed job to the spreadsheet with a generated link.

  - **Request Body:** JSON object containing the job ID.
    ```json
    {
      "jobId": "3c7a8979-a7b6-492f-a636-825e203663c1"
    }
    ```
  - **Response:** Google Sheets API response confirming the update.
  - **Example:** Adds company name and resume link to the tracking spreadsheet.

- **`POST /spreadsheet/question`**: Logs interview questions and responses to the spreadsheet.
  - **Request Body:** JSON object containing question details.
    ```json
    {
      "question": "What is your experience with React?",
      "time": "10:00 AM",
      "theme": "Technical",
      "asker": "3c7a8979-a7b6-492f-a636-825e203663c1",
      "response": "I have 3 years of experience..."
    }
    ```
  - **Response:** JSON object with a success message.
  - **Example:** Logs the question along with associated job and company information.

## Environment Variables

The following environment variables must be set for the server to function correctly:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The email address of the Google service account.
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: The private key of the Google service account.
- `SHEET_ID`: The ID of the Google Spreadsheet to interact with.
- `GEMINI_API_KEY`: API key for Google's Generative AI service (Gemini).
- `WEB_URL`: Base URL for the web application.
- `NODE_ENV`: Environment setting (DEV for development).
- `PORT`: Port number for the server (defaults to 8080).

These environment variables are loaded from the `.env` file using the `dotenv` module. **Note:** Never commit your `.env` file to a public repository.

## Deployment

The server is designed to be deployed to Google Cloud Run using Docker. The `deploy` script in `package.json` automates the deployment process.

1.  **Configure Docker and Google Cloud:**

    - Install Docker: Follow the instructions on the [Docker documentation](https://docs.docker.com/get-docker/).
    - Install the gcloud CLI: Follow the instructions on the [Google Cloud documentation](https://cloud.google.com/sdk/docs/install).
    - Authenticate with your Google Cloud account:

      ```bash
      gcloud auth login
      ```

    - Set the project and region:

      ```bash
      gcloud config set core/project your-project-id
      gcloud config set compute/region your-region
      ```

      Replace `your-project-id` and `your-region` with your actual project ID and region.

    - Activate the Cloud Run configuration:

      ```bash
      gcloud config configurations activate sheets-server
      ```

2.  **Deploy the server:**

    Run the following command:

    ```bash
    npm run deploy
    ```

    This will build a Docker image, push it to the container registry, and deploy the server to Google Cloud Run.

3.  **For development deployment (no cache):**

    ```bash
    npm run redeploy
    ```

## Running Locally

To run the server locally, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Create a `.env` file:**

    Create a `.env` file in the root directory of the project and set the required environment variables (see Environment Variables section above).

3.  **Compile the TypeScript code:**

    ```bash
    npm run compile
    ```

4.  **Start the server:**

    For production:

    ```bash
    npm start
    ```

    For development:

    ```bash
    npm run dev
    ```

    The development server will start on port 54337, while production defaults to port 8080.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Recent Updates

- **AI-Powered Job Processing**: Added integration with Google's Gemini AI to automatically extract job information from job descriptions
- **Streamlined API**: Simplified API endpoints focused on job processing and question logging
- **Docker Deployment**: Migrated from direct gcloud deployment to Docker-based deployment
- **Enhanced Type Safety**: Updated to Zod v4 for improved schema validation
- **Axios Integration**: Added axios for external API communication
- **External Job Service**: Jobs are now managed through an external API service
