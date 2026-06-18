import axios from "axios";
import {
  buildQuestionScript,
  buildStaticOutputFields,
  buildStaticOutputInstructions,
  getVerificationFlowLabel,
} from "./verificationFlows.js";

const DEFAULT_CALLING_BASE_URL = "https://v1.getraya.app/api";
const DEFAULT_TIMEZONE = "Asia/Kolkata";

const callingClient = axios.create({
  baseURL: process.env.RAYA_CALLING_BASE_URL || DEFAULT_CALLING_BASE_URL,
  timeout: 30000,
});

const LANGUAGE_TO_RAYA_UUID = {
  english: "14b8d8a0-5c56-450d-877d-cd3d7d922a00",
  hindi: "38695ff2-ee6f-4a1c-837b-27ab241377f7",
  tamil: "8892e25b-a9df-4669-8312-7d28e457819a",
  kannada: "f727e061-0217-4446-8b23-c13d7a65515f",
  telugu: "100912e7-cf45-46f8-af36-713699e1deff",
};

export async function listCallingAgents() {
  ensureApiKey();

  const { data } = await requestCallingApi(() =>
    callingClient.get("/agent", {
      headers: getRayaHeaders(),
    }),
  );

  return data;
}

export async function initiatePhoneCall({
  phoneNumber,
  candidate,
  agentId = getAgentIdForLanguage(candidate?.callLanguage),
  countryCode = process.env.RAYA_CALL_COUNTRY_CODE || "91",
  timezone = process.env.RAYA_CALL_TIMEZONE || DEFAULT_TIMEZONE,
}) {
  ensureApiKey();

  if (!agentId) {
    const error = new Error("RAYA_CALL_AGENT_ID is required to initiate a call.");
    error.status = 400;
    throw error;
  }

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  if (!normalizedPhoneNumber) {
    const error = new Error("A valid phone number is required.");
    error.status = 400;
    throw error;
  }

  console.log(`Initiating Raya call with agent ${agentId} for ${candidate?.callLanguage || "English"} / ${candidate?.role || "role not set"}.`);

  await patchAgentForCall({
    agentId,
    candidate,
  });

  const { data } = await requestCallingApi(() =>
    callingClient.post(
      "/call",
      buildCallPayload({
        agentId,
        phoneNumber: normalizedPhoneNumber,
        countryCode,
        timezone,
        candidate,
      }),
      {
        headers: getRayaHeaders(),
      },
    ),
  );

  return data;
}

async function patchAgentForCall({ agentId, candidate = {} }) {
  const role = getVerificationFlowLabel(candidate.role) || candidate.role || "General";
  const callLanguage = candidate.callLanguage || "English";
  const instructions = buildRecruitmentCoordinatorInstructions(candidate);

  if (!instructions) {
    console.log("Skipping Raya agent patch because no static instructions were found.", {
      role: candidate.role,
      callLanguage,
    });
    return;
  }

  const payload = {
    instructions,
    output_fields: buildStaticOutputFields(candidate.role),
    output_instructions: buildStaticOutputInstructions(candidate.role),
    webhook_url: getWebhookUrl(),
    say_hello: true,
    max_call_duration_mins: Number(process.env.RAYA_MAX_CALL_DURATION_MINS || 5),
    language_id: getRayaLanguageId(callLanguage),
    required_silence_after_speech: Number(process.env.RAYA_REQUIRED_SILENCE_AFTER_SPEECH || 1.5),
    allow_interruption: parseBoolean(process.env.RAYA_ALLOW_INTERRUPTION, true),
    min_user_speech_to_interrupt: Number(process.env.RAYA_MIN_USER_SPEECH_TO_INTERRUPT || 3),
    call_duration_exceed_message: "Thank you for your time. We will get back to you soon. Goodbye.",
  };

  if (!payload.webhook_url) {
    delete payload.webhook_url;
  }

  await requestCallingApi(() =>
    callingClient.patch(`/agent/${agentId}`, payload, {
      headers: getRayaHeaders(),
    }),
  );

  console.log("Raya agent patched for call.", {
    agentId,
    role,
    callLanguage,
    languageId: payload.language_id,
    outputFields: payload.output_fields.length,
  });
}

export async function getCallDetails(callId) {
  ensureApiKey();

  if (!callId) {
    const error = new Error("Call id is required to fetch Raya call details.");
    error.status = 400;
    throw error;
  }

  const { data } = await requestCallingApi(() =>
    callingClient.get(`/call/${callId}`, {
      headers: getRayaHeaders(),
    }),
  );

  return data;
}

export async function initiateBatchCalls({ candidates = [], mandate = {} }) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    const error = new Error("At least one candidate is required to start calling.");
    error.status = 400;
    throw error;
  }

  if (!mandate.role) {
    const error = new Error("Select a role before starting static interview calls.");
    error.status = 400;
    throw error;
  }

  const results = [];

  for (const candidate of candidates) {
    try {
      const result = await initiatePhoneCall({
        phoneNumber: candidate.phoneNumber,
        candidate: {
          ...candidate,
          mandateName: mandate.mandateName,
          role: mandate.role,
          callLanguage: mandate.callLanguage || "English",
        },
      });

      results.push({
        candidate,
        status: "initiated",
        result,
      });
    } catch (error) {
      results.push({
        candidate,
        status: "failed",
        message: error.message,
      });
    }
  }

  return {
    total: candidates.length,
    initiated: results.filter((result) => result.status === "initiated").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  };
}

function getAgentIdForLanguage(language = "English") {
  const normalizedLanguage = normalizeLanguageKey(language);

  const explicitAgentId = process.env[`RAYA_CALL_AGENT_ID_${normalizedLanguage.toUpperCase()}`];
  if (explicitAgentId) return explicitAgentId;

  if (["kannada", "telugu"].includes(normalizedLanguage)) {
    return process.env.RAYA_CALL_AGENT_ID_TE_KA_EN
      || process.env.RAYA_CALL_AGENT_ID_KANNADA_TELUGU_ENGLISH
      || process.env.RAYA_CALL_AGENT_ID;
  }

  return process.env.RAYA_CALL_AGENT_ID_TA_HI_EN
    || process.env.RAYA_CALL_AGENT_ID_TAMIL_HINDI_ENGLISH
    || process.env.RAYA_CALL_AGENT_ID;
}

function normalizeLanguageKey(language = "English") {
  const normalized = String(language).trim().toLowerCase();
  if (normalized === "kanada") return "kannada";
  return normalized || "english";
}

function buildCallPayload({ agentId, phoneNumber, countryCode, timezone, candidate = {} }) {
  const contactName = candidate.candidateName || candidate.name || candidate.Name || "Candidate";
  const role = getVerificationFlowLabel(candidate.role) || candidate.role || "";
  const callLanguage = candidate.callLanguage || "English";

  const payload = {
    agent_id: agentId,
    to_number: phoneNumber,
    country_code: countryCode,
    timezone,
    contact_name: contactName,
    agent_args: {
      contact_name: contactName,
      mandate_name: candidate.mandateName || "",
      role,
      call_language: callLanguage,
      time_now: new Date().toISOString(),
      day_of_week: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    },
  };

  if (process.env.RAYA_OUT_DID) {
    payload.out_did = process.env.RAYA_OUT_DID;
  }

  return payload;
}

function buildRecruitmentCoordinatorInstructions(candidate = {}) {
  const contactName = candidate.candidateName || candidate.name || candidate.Name || "Candidate";
  const role = getVerificationFlowLabel(candidate.role) || candidate.role || "this role";
  const callLanguage = candidate.callLanguage || "English";
  const questionScript = buildQuestionScript(candidate.role, callLanguage);

  if (!questionScript) return "";

  return `You are Priya, a warm and friendly recruitment coordinator calling on behalf of Record Studio.

LANGUAGE: Listen carefully to how the person greets you. Immediately match and speak in their language for the entire call - Tamil, Kannada, Hindi, Telugu, English, Marathi, Punjabi, Bengali, or Malayalam. Never mix languages mid-sentence.

PERSONALITY: Speak like a real human. Be warm, natural, and conversational. Use natural reactions like:
- English: "Oh great!", "That's wonderful!", "Perfect!", "I see, no worries!", "Sure, absolutely!"
- Tamil: "Arumai!", "Sari sari!", "Nallathu!", "Oh, parava illai!"
- Kannada: "Olledu!", "Sari sari!", "Chennagide!"
- Hindi: "Bahut achcha!", "Are wah!", "Theek hai theek hai!", "Koi baat nahi!"
- Telugu: "Chaala baagundi!", "Sare sare!", "Alaage!"
- Marathi: "Chhan!", "Baram baram!", "Are wa!", "Theek aahe!"
- Punjabi: "Bahut vadhiya!", "Theek hai theek hai!", "Are wah!"
- Bengali: "Khub bhalo!", "Thik ache!", "Are bah!", "Kono shomossha nei!"
- Malayalam: "Nannayi!", "Sheri sheri!", "Athokke theek aanu!"

CONTACT CONTEXT:
- Candidate name from the UI/CSV: ${contactName}
- Role selected in the UI: ${role}

CONVERSATION FLOW:
1. Greet warmly - "Hello! Am I speaking with ${contactName}?"
2. Introduce yourself - "I'm Priya calling from Record Studio."
3. Say this is a short verification call for the ${role} role and ask whether you can continue.
4. If the candidate agrees, ask only the role-specific questions below, one at a time.
5. Do not ask whether they saw a message, and do not ask them to reply YES or NO anywhere else.
6. Do not create extra questions or follow-up questions. After each answer, briefly acknowledge and move to the next listed question.
7. After the final question, thank the candidate and end the call naturally.

ROLE-SPECIFIC QUESTIONS:
${questionScript}

Keep responses short and natural. Pause after each question. Listen actively. Sound like a real person, not a robot.`;
}

function getWebhookUrl() {
  const explicitWebhookUrl = normalizeHttpsUrl(process.env.RAYA_WEBHOOK_URL);
  if (explicitWebhookUrl) return explicitWebhookUrl;

  const publicBackendUrl = normalizeHttpsUrl(process.env.BACKEND_PUBLIC_URL);
  if (publicBackendUrl) return `${publicBackendUrl}/api/calls/webhook`;

  return "";
}

function normalizeHttpsUrl(value = "") {
  const trimmedValue = String(value || "").trim().replace(/\/$/, "");
  if (!trimmedValue) return "";

  try {
    const url = new URL(trimmedValue);
    return url.protocol === "https:" ? url.toString().replace(/\/$/, "") : "";
  } catch {
    return "";
  }
}

function getRayaLanguageId(language = "English") {
  if (process.env.RAYA_MULTILINGUAL_LANGUAGE_ID) return process.env.RAYA_MULTILINGUAL_LANGUAGE_ID;

  const key = normalizeLanguageKey(language);
  return process.env[`RAYA_LANGUAGE_ID_${key.toUpperCase()}`]
    || LANGUAGE_TO_RAYA_UUID[key]
    || LANGUAGE_TO_RAYA_UUID.english;
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

async function requestCallingApi(requestFn) {
  try {
    return await requestFn();
  } catch (error) {
    const status = error.response?.status || 500;
    const message = getCallingErrorMessage(error);
    const wrappedError = new Error(message);
    wrappedError.status = status;
    throw wrappedError;
  }
}

function getCallingErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Raya calling API rejected this key. Use a Voice AI Agents/calling-enabled RAYA_API_KEY.";
  }

  const responseData = normalizeErrorData(error.response?.data);

  return error.response?.data?.message
    || error.response?.data?.detail
    || responseData
    || "Raya calling API request failed.";
}

function normalizeErrorData(data) {
  if (!data) return "";
  if (typeof data === "string") return data;

  try {
    return JSON.stringify(data);
  } catch {
    return "";
  }
}

function ensureApiKey() {
  if (!process.env.RAYA_API_KEY) {
    const error = new Error("RAYA_API_KEY is required for Raya calling APIs.");
    error.status = 400;
    throw error;
  }
}

function getRayaHeaders() {
  return {
    "X-API-Key": process.env.RAYA_API_KEY,
    "Content-Type": "application/json",
  };
}

function normalizePhoneNumber(phoneNumber = "") {
  return String(phoneNumber).replace(/\D/g, "");
}
