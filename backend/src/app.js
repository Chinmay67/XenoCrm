import express from "express";


const app=express()


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:'true',limit:"16kb"}))
app.use(express.static("public"))


import ingestionRouter from "./routes/data_ingestion.routes.js";

app.use("/api/ingest",ingestionRouter)



export {app}