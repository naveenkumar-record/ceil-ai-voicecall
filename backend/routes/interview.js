import express from "express";
import {
  evaluateCandidate,
  generateQuestion,
  startInterview,
} from "../services/interviewService.js";

const router = express.Router();

router.post("/start", async (req, res, next) => {
  try {
    const result = await startInterview(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/question", async (req, res, next) => {
  try {
    const result = await generateQuestion(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/evaluate", async (req, res, next) => {
  try {
    const result = await evaluateCandidate(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
