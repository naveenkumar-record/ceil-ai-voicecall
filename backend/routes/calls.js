import express from "express";
import {
  createScheduledBatch,
  getScheduledBatch,
  listScheduledBatches,
  updateBatchContactFromCallEvent,
} from "../services/batchSchedulerService.js";
import { initiatePhoneCall, listCallingAgents } from "../services/callingService.js";

const router = express.Router();

router.get("/agents", async (_req, res, next) => {
  try {
    const result = await listCallingAgents();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/initiate", async (req, res, next) => {
  try {
    const result = await initiatePhoneCall(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/batch", async (req, res, next) => {
  try {
    const result = await createScheduledBatch(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/batch", (_req, res) => {
  res.json(listScheduledBatches());
});

router.get("/batch/:id", (req, res, next) => {
  try {
    const result = getScheduledBatch(req.params.id);
    if (!result) {
      const error = new Error("Batch not found.");
      error.status = 404;
      throw error;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/webhook", (req, res, next) => {
  try {
    console.log("Raya webhook received.", {
      keys: Object.keys(req.body || {}),
      status: req.body?.status || req.body?.data?.status || req.body?.event || req.body?.type,
    });
    console.log("Raya webhook raw payload:", JSON.stringify(req.body || {}).slice(0, 4000));
    const result = updateBatchContactFromCallEvent(req.body);
    res.json({
      received: true,
      matched: Boolean(result),
      batch: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/batch/status", (req, res, next) => {
  try {
    const result = updateBatchContactFromCallEvent(req.body);
    if (!result) {
      const error = new Error("No matching batch contact found for this call event.");
      error.status = 404;
      throw error;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
