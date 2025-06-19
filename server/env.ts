import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

interface EnvVariables {
  DATABASE_URL: string;
  SESSION_SECRET: string;
  BREVO_API_KEY: string;
  PORT: string;
}

// Load and export environment variables
const env: EnvVariables = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "",
  BREVO_API_KEY: process.env.BREVO_API_KEY || "",
  PORT: process.env.PORT || "5000",
};

export default env;
export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
