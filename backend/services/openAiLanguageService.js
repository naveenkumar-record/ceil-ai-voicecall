import axios from "axios";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_LANGUAGE_MODEL = "gpt-4o-mini";

export async function detectCandidateLanguage({
  transcript,
  lockedLanguage = "English",
}) {
  const fallback = detectLanguageLocally(transcript, lockedLanguage);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const { data } = await axios.post(
      `${getOpenAiBaseUrl()}/chat/completions`,
      {
        model: process.env.OPENAI_LANGUAGE_MODEL || DEFAULT_LANGUAGE_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "You classify the candidate's spoken language for a voice interview.",
              "Return only JSON with keys: detectedLanguage, switchLanguage, lockedLanguage, reason.",
              "Allowed languages: English, Tamil, Hindi, Unknown.",
              "If the candidate asks to speak Tamil, says Tamil la pesunga, Tamil la pesa mudiyuma, or uses Tamil script/phrasing, detectedLanguage is Tamil.",
              "If the candidate asks to speak Hindi or uses Hindi/Devanagari/Hinglish phrasing, detectedLanguage is Hindi.",
              "If the current lockedLanguage is Tamil or Hindi, keep that lockedLanguage even if the candidate switches later.",
              "If current lockedLanguage is English and detectedLanguage is Tamil or Hindi, switchLanguage is true and lockedLanguage becomes that language.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              currentLockedLanguage: lockedLanguage,
              candidateTranscript: transcript,
            }),
          },
        ],
      },
      {
        timeout: 15000,
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return normalizeDetection(JSON.parse(data.choices?.[0]?.message?.content || "{}"), fallback);
  } catch (error) {
    console.warn("OpenAI language detection failed; using local fallback.", error.message);
    return fallback;
  }
}

function getOpenAiBaseUrl() {
  return (process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/$/, "");
}

function normalizeDetection(result, fallback) {
  const detectedLanguage = normalizeLanguage(result.detectedLanguage || fallback.detectedLanguage);
  const lockedLanguage = normalizeLanguage(result.lockedLanguage || fallback.lockedLanguage);

  return {
    detectedLanguage,
    switchLanguage: Boolean(result.switchLanguage ?? fallback.switchLanguage),
    lockedLanguage,
    reason: result.reason || fallback.reason,
  };
}

function detectLanguageLocally(transcript = "", lockedLanguage = "English") {
  const currentLock = normalizeLanguage(lockedLanguage);
  const text = String(transcript).trim();
  const lowerText = text.toLowerCase();

  if (currentLock === "Tamil" || currentLock === "Hindi") {
    return {
      detectedLanguage: currentLock,
      switchLanguage: false,
      lockedLanguage: currentLock,
      reason: `${currentLock} is already locked.`,
    };
  }

  if (containsTamil(text) || lowerText.includes("tamil") || lowerText.includes("tamizh")) {
    return {
      detectedLanguage: "Tamil",
      switchLanguage: true,
      lockedLanguage: "Tamil",
      reason: "Candidate used Tamil or requested Tamil.",
    };
  }

  if (containsHindi(text) || lowerText.includes("hindi") || lowerText.includes("hindhi")) {
    return {
      detectedLanguage: "Hindi",
      switchLanguage: true,
      lockedLanguage: "Hindi",
      reason: "Candidate used Hindi or requested Hindi.",
    };
  }

  return {
    detectedLanguage: "English",
    switchLanguage: false,
    lockedLanguage: "English",
    reason: "No non-English language switch detected.",
  };
}

function containsTamil(text) {
  return /[\u0B80-\u0BFF]/.test(text);
}

function containsHindi(text) {
  return /[\u0900-\u097F]/.test(text);
}

function normalizeLanguage(language = "English") {
  const normalized = String(language).trim().toLowerCase();
  if (normalized === "ta" || normalized === "tamil") return "Tamil";
  if (normalized === "hi" || normalized === "hindi") return "Hindi";
  if (normalized === "unknown") return "Unknown";
  return "English";
}
