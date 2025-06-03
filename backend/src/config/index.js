import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: process.env.PORT,
  mongo_url: process.env.MONGO_URI,
  db_name: process.env.MONGO_DB_NAME,
  rabbit_mq_url: process.env.RABBITMQ_URI,
  google_clientID: process.env.GOOGLE_CLIENT_ID,
  google_clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  google_callbackURL: process.env.GOOGLE_CALLBACK_URL,
  jwt_secret: process.env.JWT_SECRET,
  frontend_url: process.env.FRONTEND_URL ,
  env: process.env.NODE_ENV || "development",
};
