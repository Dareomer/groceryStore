import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import session from "express-session"
import MongoStore from "connect-mongo"
import loginRouter from "./routers/loginRouter"
import userRouter from "./routers/userRouter"

const app = express()

const PORT = 4000
const mongoURI = "mongodb://127.0.0.1:27017/GroceryStore"
const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret || Buffer.byteLength(sessionSecret, "utf8") < 32) {
    throw new Error("SESSION_SECRET must be at least 32 bytes long")
}

// Middleware
app.use(cors({
    origin: "http://localhost:4200",
    credentials: true
}))

app.use(express.json())

// Sessions
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoURI
    }),
    cookie: {
        httpOnly: true,
        secure: false, // Local development only
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    }
}))

// Test route
app.get("/", (req, res) => {res.send("Backend is working")})


app.use("/",loginRouter)
app.use("/user",userRouter)

// Database connection and server startup
async function startServer() {
    try 
    {
        await mongoose.connect(mongoURI)
        console.log("DB connected")

        app.listen(PORT, () => {console.log(`Express running on port ${PORT}`)})

    } 
    catch (error) 
    {
        console.error("MongoDB connection failed:", error)
        process.exit(1)
    }
}

startServer()