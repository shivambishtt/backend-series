import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
export const PORT = process.env.PORT || 5000

app.use(cors({
    origin: process.env.ORIGIN_URL,
    credentials: true,
}))

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Routes decalaration
import userRouter from './routes/user.routes.js';
app.use('/api/v1/users', userRouter) //https:localhost:9000/api/v1/users/register

export default app