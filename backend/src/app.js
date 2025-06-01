import express from "express";
import { config } from "./config/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
  origin: config.frontend_url || 'http://localhost:5173',
  credentials: true,
}));

app.use(cookieParser());


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:'true',limit:"16kb"}))
app.use(express.static("public"))

import authRouter from "./routes/auth.routes.js";
import ingestionRouter from "./routes/data_ingestion.routes.js";


app.use("/auth",authRouter)
app.use("/api/ingest",ingestionRouter)



export {app}