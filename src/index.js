// require("dotenv").config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB()















// 1 way to connect databse
/*
const app= express()
// Ways to connect DB

// 2 Things to always keep in mind while connecting to DB is that you should always wrap it in async and await function and in the try catch block because we are calling third party api or data from another server so it might throw error ,to be on the safer side you need to do 

// 1- function DBConnect() { }
// DBConnect()

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",()=>{
            console.log("Not able to talk to DB");
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.log(error);

    }
})()
    */