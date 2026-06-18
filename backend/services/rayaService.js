import axios from "axios";

const DEFAULT_BASE_URL = "https://hub.getraya.app";
const DEFAULT_TTS_VOICE_ID = "fed6231c-7e35-4fbe-bbca-254f566e5dd5";
const DEFAULT_ENGLISH_TTS_VOICE_ID = "0f24fb66-e495-4781-9e84-1224aa7dacde";

const rayaClient = axios.create({
  baseURL: process.env.RAYA_BASE_URL || DEFAULT_BASE_URL,
  timeout: 30000,
});

export async function speechToText({ audioBuffer, mimeType, language }) {
  if (!process.env.RAYA_API_KEY) {
    return {
      transcript: "",
      language: language || "auto",
      isPlaceholder: true,
      message: "Raya STT is not configured. Enter transcript manually or connect Raya credentials.",
    };
  }

  const formData = new FormData();
  const fileName = mimeType?.includes("wav") ? "candidate-audio.wav" : "candidate-audio.webm";
  formData.append("file", new Blob([audioBuffer], { type: mimeType }), fileName);
  formData.append("language", mapSpeechLanguage(language));

  try {
    const { data } = await rayaClient.post("/transcribe", formData, {
      headers: getRayaHeaders(),
    });

    return {
      transcript: data.transcript || data.text || "",
      language: data.language || language || "auto",
    };
  } catch (error) {
    return {
      transcript: "",
      language: language || "auto",
      isPlaceholder: true,
      message: getRayaErrorMessage(error, "Raya STT failed. Please try again or type the answer manually."),
    };
  }
}

export async function textToSpeech({ text, language }) {
  if (!text) {
    const error = new Error("Text is required for TTS");
    error.status = 400;
    throw error;
  }

  if (!process.env.RAYA_API_KEY) {
    return {
      audioBase64: null,
      mimeType: "audio/mpeg",
      isPlaceholder: true,
    };
  }

  try {
    const { data, headers } = await rayaClient.post(
      "/v1/text-to-speech",
      {
        text,
        voice_id: getVoiceId(language),
        model: process.env.RAYA_TTS_MODEL || "standard",
        language: mapTtsLanguage(language),
        codec: "mp3",
        sample_rate: 24000,
        speed: 1,
      },
      {
        headers: getRayaHeaders(),
        responseType: "arraybuffer",
      },
    );

    return {
      audioBase64: Buffer.from(data).toString("base64"),
      mimeType: headers["content-type"] || "audio/mpeg",
    };
  } catch (error) {
    return {
      audioBase64: null,
      mimeType: "audio/mpeg",
      isPlaceholder: true,
      message: getRayaErrorMessage(error, "Raya TTS failed. Falling back to browser speech."),
    };
  }
}

function getRayaHeaders() {
  return {
    "X-API-Key": process.env.RAYA_API_KEY,
  };
}

function getRayaErrorMessage(error, fallback) {
  if (error.response?.status === 401) {
    return "Raya rejected the API key. Check RAYA_API_KEY and service access.";
  }

  return error.response?.data?.detail || error.response?.data?.message || fallback;
}

function getVoiceId(language = "") {
  const normalized = language.toLowerCase();

  if (normalized.includes("english")) {
    return process.env.RAYA_ENGLISH_TTS_VOICE_ID || DEFAULT_ENGLISH_TTS_VOICE_ID;
  }

  return process.env.RAYA_TTS_VOICE_ID || DEFAULT_TTS_VOICE_ID;
}

function mapSpeechLanguage(language = "") {
  const normalized = language.toLowerCase();
  if (normalized.includes("tamil")) return "ta";
  if (normalized.includes("english")) return "en";
  return "auto";
}

function mapTtsLanguage(language = "") {
  const normalized = language.toLowerCase();

  if (normalized.includes("tamil")) return "ta";
  if (normalized.includes("english")) return "en-in";

  return "ta";
}
