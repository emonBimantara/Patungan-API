import express from "express"
import { connectDB, disconnectDB } from "./config/db.js"
import { config } from "dotenv"
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js"
import groupRouter from "./routes/groupRoutes.js";

config()
connectDB()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use("/auth", authRouter)
app.use("/groups", groupRouter);

const port = 5001
const server = app.listen(port, () => {
    console.log(`Server running on PORT ${port}`)
})

// Handle unhandle promise rejection (DB Connection Errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection: ", err)
    server.close(async () => {
        await disconnectDB()
        process.exit(1)
    })
})

// Handle uncaught exception
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception: ", err)
    await disconnectDB()
    process.exit(1)
})


// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM Received, shutting down gracefully")
    server.close(async () => {
        await disconnectDB()
        process.exit(1)
    })
})