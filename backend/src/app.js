import express from "express";
import { config } from "./config/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { verifyToken } from "./middlewares/auth.middleware.js";

const app = express()

const whitelist = [
  'https://xeno-crm-git-main-chinmays-projects-3cbd74a3.vercel.app',
  'https://xeno-crm-smoky.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

app.use(cookieParser());


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:'true',limit:"16kb"}))
app.use(express.static("public"))

import authRouter from "./routes/auth.routes.js";
import ingestionRouter from "./routes/data_ingestion.routes.js";
import campaignRouter from "./routes/campaign.routes.js";
import audienceRouter from "./routes/audience.routes.js";

// Public routes
app.use("/auth", authRouter)
app.use("/api/ingest", ingestionRouter)

// Protected routes
app.use("/api/campaigns", verifyToken, campaignRouter)
app.use("/api/audience", verifyToken, audienceRouter)

export {app}