declare namespace NodeJS {
    interface ProcessEnv {
      readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
      readonly GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;
      readonly MONGODB_PWD: string
      readonly SHEET_ID:string
      readonly WEB_URL:string
    }
  }