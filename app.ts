import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middlewere/error";
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({ origin: process.env.ORIGIN }));

// Test Route
app.get("/test", (req, res) => {
  res.status(200).json({ success: true, message: "API is working" });
});

// Handle unknown routes
app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  next(err);
});
app.use(ErrorMiddleware)

export default app;