import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_JWT_EXPIRES_IN } from "../constants/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";
const jwtSecret = process.env.JWT_SECRET;
if (isProduction && !jwtSecret) {
  throw new Error("JWT_SECRET must be set in production");
}

export const config = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  nodeEnv,
  isProduction,
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://localhost:5432/ops_platform",
  jwtSecret: jwtSecret ?? "dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? DEFAULT_JWT_EXPIRES_IN,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN ?? "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER ?? "",
  },
};
