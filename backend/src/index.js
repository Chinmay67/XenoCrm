// require('dotenv').config({path:'./env'})




import { app } from "./app.js";

import { config } from "./config/index.js";
import mongoose from "mongoose";
import { logger } from "./utils/logger.js";
const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${config.mongo_url}/${config.db_name}`)
        logger.info(`MONGODB CONNECTION SUCCESFULL - ${connectionInstance.connection.host}`);
        
    } catch (error) {
        logger.error(`MONGODB connection error - ${error}`)
        process.exit(1)
    }
}



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        logger.info(`server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    logger.error(`Mongodb connection failed -  ${err}`);
})















// (async ( )=>{
//     try{
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERRR",error);
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log("App is listening on port ",process.env.PORT);
//         })
//     }
//     catch(error){
//         console.error("ERROR: ",error)
//         throw err
//     }
// })