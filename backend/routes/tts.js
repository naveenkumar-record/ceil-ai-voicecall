import express from "express";
import { textToSpeech } from "../services/rayaService.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const result = await textToSpeech(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
