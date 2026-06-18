import express from "express";
import multer from "multer";
import { saveCandidateAudio } from "../services/audioStorageService.js";
import { speechToText } from "../services/rayaService.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.post("/", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const savedAudio = await saveCandidateAudio({
      audioBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    const result = await speechToText({
      audioBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      language: req.body.language,
    });

    res.json({
      ...result,
      savedAudio,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
