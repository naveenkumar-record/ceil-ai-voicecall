import express from "express";
import {
  handleControlledTurn,
  startControlledInterview,
} from "../services/controlledInterviewService.js";

const router = express.Router();

router.post("/start", (req, res, next) => {
  try {
    res.json(startControlledInterview(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/turn", async (req, res, next) => {
  try {
    res.json(await handleControlledTurn(req.body));
  } catch (error) {
    next(error);
  }
});

export default router;
