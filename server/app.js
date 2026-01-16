import { configDotenv } from "dotenv";
configDotenv({quiet: true});

import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

import notesRoute from "./src/routes/notes.route.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']   
}))

app.use(cookieParser()); 

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static('public'));

app.use('/api/notes', notesRoute);
export default app;