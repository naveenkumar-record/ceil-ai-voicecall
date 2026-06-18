import { getCallDetails, initiatePhoneCall } from "./callingService.js";

const batches = new Map();
let schedulerStarted = false;

export function startBatchScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  setInterval(processDueBatches, 15000).unref();
}

export async function createScheduledBatch({ candidates = [], mandate = {}, batchConfig = {} }) {
  validateBatchInput({ candidates, mandate });

  const batch = {
    id: createId("batch"),
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mandate,
    config: normalizeBatchConfig(batchConfig),
    contacts: candidates.map((candidate) => ({
      id: createId("contact"),
      candidate,
      status: "pending",
      attempts: 0,
      lastAttemptAt: null,
      nextAttemptAt: null,
      lastError: null,
      result: null,
    })),
    activeCalls: 0,
  };

  batches.set(batch.id, batch);
  await processBatch(batch);
  console.log(`Batch ${batch.id} created with status ${batch.status}.`);
  return summarizeBatch(batch);
}

export function getScheduledBatch(batchId) {
  const batch = batches.get(batchId);
  return batch ? summarizeBatch(batch) : null;
}

export function listScheduledBatches() {
  return Array.from(batches.values()).map(summarizeBatch);
}

export function updateBatchContactFromCallEvent(payload = {}) {
  const callId = getFirstValue(payload, [
    "call_id",
    "callId",
    "id",
    "call.id",
    "data.call_id",
    "data.id",
    "call.call_id",
    "conversation.call_id",
  ]);
  const phoneNumber = normalizePhone(getFirstValue(payload, [
    "phone_number",
    "phoneNumber",
    "to_number",
    "toNumber",
    "data.phone_number",
    "data.to_number",
    "contact.phoneNumber",
    "call.to_number",
    "call.phone_number",
    "conversation.to_number",
  ]));

  for (const batch of batches.values()) {
    const contact = batch.contacts.find((item) =>
      matchesCallId(item, callId) || matchesPhone(item, phoneNumber),
    );

    if (!contact) continue;

    applyCallEvent(contact, payload);
    batch.updatedAt = new Date().toISOString();
    batch.status = batch.contacts.every((item) => isTerminalStatus(item.status))
      ? "completed"
      : "waiting";

    return summarizeBatch(batch);
  }

  console.log("Raya call event did not match any batch contact.", {
    callId,
    phoneNumber,
    keys: Object.keys(payload || {}),
  });
  return null;
}

async function processDueBatches() {
  for (const batch of batches.values()) {
    await processBatch(batch);
  }
}

async function processBatch(batch) {
  if (batch.status === "completed" || batch.status === "paused") return;

  await refreshInitiatedCallStatuses(batch);

  if (!isWithinSchedule(batch.config)) {
    batch.status = "scheduled";
    batch.updatedAt = new Date().toISOString();
    return;
  }

  const maxConcurrentCalls = Number(batch.config.maxConcurrentCalls) || 1;
  const availableSlots = Math.max(0, maxConcurrentCalls - batch.activeCalls);
  if (availableSlots === 0) return;

  const dueContacts = batch.contacts
    .filter((contact) => isContactDue(contact, batch.config))
    .slice(0, availableSlots);

  if (dueContacts.length === 0) {
    batch.status = batch.contacts.every((contact) => isTerminalStatus(contact.status))
      ? "completed"
      : "waiting";
    batch.updatedAt = new Date().toISOString();
    return;
  }

  batch.status = "running";
  batch.updatedAt = new Date().toISOString();

  await Promise.all(dueContacts.map((contact) => callContact(batch, contact)));

  batch.status = batch.contacts.every((contact) => isTerminalStatus(contact.status))
    ? "completed"
    : "waiting";
  batch.updatedAt = new Date().toISOString();
}

async function callContact(batch, contact) {
  contact.status = "calling";
  contact.attempts += 1;
  contact.lastAttemptAt = new Date().toISOString();
  contact.lastError = null;
  batch.activeCalls += 1;

  try {
    contact.result = await initiatePhoneCall({
      phoneNumber: contact.candidate.phoneNumber,
      candidate: {
        ...contact.candidate,
        mandateName: batch.mandate.mandateName,
        role: batch.mandate.role,
        callLanguage: batch.mandate.callLanguage || "English",
      },
    });
    contact.status = "initiated";
    contact.callId = extractCallId(contact.result);
    console.log("Raya call initiated:", {
      name: contact.candidate?.candidateName || contact.candidate?.name || "Candidate",
      phone: contact.candidate?.phoneNumber,
      callId: contact.callId || "[missing call id]",
      responseKeys: Object.keys(contact.result || {}),
    });
    contact.nextAttemptAt = null;
  } catch (error) {
    contact.lastError = error.message;
    scheduleRetry(contact, batch.config);
  } finally {
    batch.activeCalls = Math.max(0, batch.activeCalls - 1);
  }
}

async function refreshInitiatedCallStatuses(batch) {
  const initiatedContacts = batch.contacts.filter((contact) =>
    ["initiated", "answered"].includes(contact.status)
      && contact.callId
      && shouldPollCallStatus(contact),
  );

  for (const contact of initiatedContacts) {
    contact.lastStatusPollAt = new Date().toISOString();

    try {
      const details = await getCallDetails(contact.callId);
      console.log("Raya call details fetched:", {
        name: contact.candidate?.candidateName || contact.candidate?.name || "Candidate",
        phone: contact.candidate?.phoneNumber,
        callId: contact.callId,
        keys: Object.keys(details || {}),
      });
      applyCallEvent(contact, details);
      batch.updatedAt = new Date().toISOString();
    } catch (error) {
      console.log("Could not fetch Raya call details:", {
        phone: contact.candidate?.phoneNumber,
        callId: contact.callId,
        message: error.message,
      });
    }
  }
}

function shouldPollCallStatus(contact) {
  if (!contact.lastStatusPollAt) return true;
  return Date.now() - new Date(contact.lastStatusPollAt).getTime() >= 20000;
}

function scheduleRetry(contact, config) {
  const maxRetries = Number(config.maxRetries) || 0;

  if (contact.attempts <= maxRetries) {
    const retryAfterMinutes = Number(config.retryAfterMinutes ?? config.retryAfterHours) || 2;
    contact.status = "pending";
    contact.nextAttemptAt = new Date(Date.now() + retryAfterMinutes * 60 * 1000).toISOString();
    return;
  }

  contact.status = "failed";
  contact.nextAttemptAt = null;
}

function isContactDue(contact, config) {
  if (!config.statusFilters.includes("Pending") && contact.status === "pending") return false;
  if (!config.statusFilters.includes("Unanswered") && contact.status === "unanswered") return false;
  if (!["pending", "unanswered"].includes(contact.status)) return false;
  if (!contact.nextAttemptAt) return true;
  return new Date(contact.nextAttemptAt).getTime() <= Date.now();
}

function isTerminalStatus(status) {
  return ["interested", "not_interested", "completed", "failed", "unanswered"].includes(status);
}

function isWithinSchedule(config) {
  const now = getZonedNow(config.timezone);
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];

  if (!config.days.includes(day)) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(config.startTime);
  const endMinutes = timeToMinutes(config.endTime);

  if (startMinutes <= endMinutes) {
    return minutesNow >= startMinutes && minutesNow <= endMinutes;
  }

  return minutesNow >= startMinutes || minutesNow <= endMinutes;
}

function getZonedNow(timezone = "Asia/Kolkata (IST)") {
  const timeZone = timezone.includes("Asia/Kolkata") ? "Asia/Kolkata" : "UTC";
  return new Date(new Date().toLocaleString("en-US", { timeZone }));
}

function timeToMinutes(time = "00:00") {
  const [hours, minutes] = String(time).split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function normalizeBatchConfig(config = {}) {
  return {
    startTime: config.startTime || "00:00",
    endTime: config.endTime || "23:59",
    days: Array.isArray(config.days) && config.days.length > 0
      ? config.days
      : ["Mon", "Tue", "Wed", "Thu", "Fri"],
    timezone: config.timezone || "Asia/Kolkata (IST)",
    statusFilters: Array.isArray(config.statusFilters) && config.statusFilters.length > 0
      ? config.statusFilters
      : ["Pending"],
    maxRetries: String(config.maxRetries ?? "0"),
    retryAfterMinutes: String(config.retryAfterMinutes ?? config.retryAfterHours ?? "2"),
    concurrencyMode: config.concurrencyMode || "Shared",
    maxConcurrentCalls: String(config.maxConcurrentCalls ?? "1"),
  };
}

function validateBatchInput({ candidates, mandate }) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    const error = new Error("At least one candidate is required to start a batch.");
    error.status = 400;
    throw error;
  }

  if (!mandate.role) {
    const error = new Error("Select a role before starting a batch.");
    error.status = 400;
    throw error;
  }
}

function summarizeBatch(batch) {
  const counts = batch.contacts.reduce((acc, contact) => {
    acc[contact.status] = (acc[contact.status] || 0) + 1;
    return acc;
  }, {});
  const called = batch.contacts.filter((contact) => contact.attempts > 0).length;
  const answered = batch.contacts.filter((contact) =>
    ["answered", "interested", "not_interested", "completed"].includes(contact.status)
      || contact.answered === true,
  ).length;
  const interested = batch.contacts.filter((contact) =>
    contact.status === "interested" || contact.interested === true,
  ).length;
  const notInterested = batch.contacts.filter((contact) =>
    contact.status === "not_interested" || contact.notInterested === true,
  ).length;

  return {
    id: batch.id,
    status: batch.status,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
    config: batch.config,
    total: batch.contacts.length,
    called,
    answered,
    interested,
    notInterested,
    initiated: counts.initiated || 0,
    failed: counts.failed || 0,
    pending: counts.pending || 0,
    calling: counts.calling || 0,
    unanswered: counts.unanswered || 0,
    activeCalls: batch.activeCalls,
    contacts: batch.contacts.map((contact) => ({
      id: contact.id,
      candidate: contact.candidate,
      status: contact.status,
      attempts: contact.attempts,
      callId: contact.callId,
      answered: contact.answered || false,
      interested: contact.interested || false,
      notInterested: contact.notInterested || false,
      transcript: contact.transcript || "",
      lastAttemptAt: contact.lastAttemptAt,
      nextAttemptAt: contact.nextAttemptAt,
      lastError: contact.lastError,
    })),
  };
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function applyCallEvent(contact, payload) {
  const normalizedStatus = normalizeCallStatus(getFirstValue(payload, [
    "status",
    "call_status",
    "callStatus",
    "event",
    "type",
    "data.status",
    "data.call_status",
    "call.status",
    "conversation.status",
  ]));
  const transcript = getTranscriptText(payload);
  const outputInterest = getOutputInterestSignal(payload);
  const outputNotInterested = getOutputNotInterestedSignal(payload);
  const notInterested = outputNotInterested || getNotInterestedSignal(payload, transcript);
  const interested = !notInterested && (outputInterest || getInterestSignal(payload, transcript));
  const answered = getAnsweredSignal(payload, normalizedStatus, transcript);

  console.log("Raya transcript extracted:", {
    name: contact.candidate?.candidateName || contact.candidate?.name || "Candidate",
    phone: contact.candidate?.phoneNumber,
    statusFromWebhook: normalizedStatus || "unknown",
    transcript: transcript || "[empty transcript]",
  });

  contact.status = notInterested
    ? "not_interested"
    : interested
    ? "interested"
    : normalizedStatus || contact.status;
  contact.answered = contact.answered || answered || interested || notInterested;
  contact.interested = notInterested ? false : contact.interested || interested;
  contact.notInterested = contact.notInterested || notInterested;
  contact.transcript = transcript || contact.transcript || "";
  contact.lastEventAt = new Date().toISOString();
  contact.lastEvent = payload;

  console.log("Candidate interest updated:", {
    name: contact.candidate?.candidateName || contact.candidate?.name || "Candidate",
    phone: contact.candidate?.phoneNumber,
    status: contact.status,
    answered: contact.answered,
    interested: contact.interested,
    notInterested: contact.notInterested,
    interest: contact.interested ? "YES" : contact.notInterested ? "NO" : "UNKNOWN",
    transcript: contact.transcript || "",
  });
}

function getTranscriptText(payload = {}) {
  const directTranscript = getFirstValue(payload, [
    "transcript",
    "summary",
    "data.transcript",
    "data.summary",
    "output.transcript",
    "outputs.transcript",
    "call.transcript",
    "conversation.transcript",
    "conversation.summary",
  ]);

  if (directTranscript) return String(directTranscript);

  return collectTextValues(payload, new Set(["transcript", "summary", "text", "content", "message"]))
    .join(" ")
    .slice(0, 5000);
}

function normalizeCallStatus(status = "") {
  const value = String(status).toLowerCase().replace(/[\s-]+/g, "_");
  if (["answered", "picked_up", "connected", "completed", "call_completed"].includes(value)) return "answered";
  if (["interested", "yes", "consent_yes"].includes(value)) return "interested";
  if (["not_interested", "no", "declined", "rejected"].includes(value)) return "not_interested";
  if (["failed", "busy", "no_answer", "unanswered"].includes(value)) return "unanswered";
  return "";
}

function getInterestSignal(payload, transcript = "") {
  const explicit = getFirstValue(payload, [
    "interested",
    "is_interested",
    "consent",
    "outputs.interested",
    "output.interested",
    "data.interested",
    "data.outputs.interested",
  ]);

  if (typeof explicit === "boolean") return explicit;
  if (["yes", "true", "accepted"].includes(String(explicit).toLowerCase())) return true;

  return /\b(yes|yeah|ok|okay|continue|ready)\b/i.test(transcript)
    || /(ஆம்|ஆமா|சரி|பேசலாம்|हाँ|ठीक|ಹೌದು|ಸರಿ|అవును|సరే)/i.test(transcript);
}

function getNotInterestedSignal(payload, transcript = "") {
  const explicit = getFirstValue(payload, [
    "not_interested",
    "is_not_interested",
    "declined",
    "outputs.not_interested",
    "output.not_interested",
    "data.not_interested",
    "data.outputs.not_interested",
  ]);

  if (typeof explicit === "boolean") return explicit;
  if (["yes", "true", "not_interested", "declined", "rejected", "no"].includes(String(explicit).toLowerCase())) return true;

  return /\b(no|not interested|decline|declined|reject|rejected|busy|later)\b/i.test(transcript)
    || /(வேண்டாம்|விருப்பம் இல்லை|இல்லை|नहीं|रुचि नहीं|ಬೇಡ|ಆಸಕ್ತಿ ಇಲ್ಲ|వద్దు|ఆసక్తి లేదు)/i.test(transcript);
}

function getOutputInterestSignal(payload = {}) {
  return getPositiveBooleanishValue(payload, [
    "interested",
    "is_interested",
    "consent",
    "outputs.interested",
    "output.interested",
    "data.interested",
    "data.outputs.interested",
    "analysis.interested",
  ]);
}

function getOutputNotInterestedSignal(payload = {}) {
  return getPositiveBooleanishValue(payload, [
    "not_interested",
    "is_not_interested",
    "declined",
    "outputs.not_interested",
    "output.not_interested",
    "data.not_interested",
    "data.outputs.not_interested",
    "analysis.not_interested",
  ]);
}

function getAnsweredSignal(payload, status, transcript = "") {
  const explicit = getFirstValue(payload, [
    "answered",
    "is_answered",
    "picked_up",
    "data.answered",
    "data.picked_up",
  ]);

  if (typeof explicit === "boolean") return explicit;
  if (["yes", "true", "answered", "picked_up"].includes(String(explicit).toLowerCase())) return true;
  return ["answered", "interested", "not_interested"].includes(status) || Boolean(transcript);
}

function extractCallId(result = {}) {
  return getFirstValue(result, [
    "uuid",
    "call_id",
    "callId",
    "id",
    "data.uuid",
    "data.call_id",
    "data.id",
    "call.uuid",
    "call.call_id",
    "call.id",
    "conversation.uuid",
    "conversation.call_id",
    "conversation.id",
  ]);
}

function matchesCallId(contact, callId) {
  if (!callId) return false;
  return String(contact.callId || extractCallId(contact.result)).trim() === String(callId).trim();
}

function matchesPhone(contact, phoneNumber) {
  if (!phoneNumber) return false;
  return normalizePhone(contact.candidate?.phoneNumber) === phoneNumber;
}

function normalizePhone(phone = "") {
  return String(phone).replace(/\D/g, "");
}

function getFirstValue(source, paths) {
  for (const path of paths) {
    const value = getPathValue(source, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function getPathValue(source, path) {
  return String(path).split(".").reduce((current, key) => {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) return current[key];
    return undefined;
  }, source);
}

function getPositiveBooleanishValue(source, paths) {
  const value = getFirstValue(source, paths);
  if (typeof value === "boolean") return value;
  if (["yes", "true", "accepted", "declined", "rejected", "not_interested"].includes(String(value).toLowerCase())) return true;
  if (["no", "false", "0"].includes(String(value).toLowerCase())) return false;
  return false;
}

function collectTextValues(value, allowedKeys, parentKey = "") {
  if (value === null || value === undefined) return [];

  if (typeof value === "string") {
    return allowedKeys.has(parentKey) ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextValues(item, allowedKeys, parentKey));
  }

  if (typeof value !== "object") return [];

  return Object.entries(value).flatMap(([key, childValue]) =>
    collectTextValues(childValue, allowedKeys, key),
  );
}
