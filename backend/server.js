import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import controlledInterviewRoutes from "./routes/controlledInterview.js";
import interviewRoutes from "./routes/interview.js";
import callRoutes from "./routes/calls.js";
import sttRoutes from "./routes/stt.js";
import ttsRoutes from "./routes/tts.js";
import { startBatchScheduler } from "./services/batchSchedulerService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
startBatchScheduler();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-interview-demo" });
});

app.use("/api/interview", interviewRoutes);
app.use("/api/controlled-interview", controlledInterviewRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/stt", sttRoutes);
app.use("/api/tts", ttsRoutes);

app.use((err, _req, res, _next) => {
  console.error({
    message: err.message,
    status: err.status || err.response?.status || 500,
    detail: err.response?.data?.detail || err.response?.data?.message,
  });
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`AI Interview backend running on http://localhost:${PORT}`);
});
