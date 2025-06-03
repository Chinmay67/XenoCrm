import express from "express";
import { config } from "./config/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { verifyToken } from "./middlewares/auth.middleware.js";

const app = express()

app.use(cors({
  origin: config.frontend_url || 'http://localhost:5173',
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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