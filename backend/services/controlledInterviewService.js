import { detectCandidateLanguage } from "./openAiLanguageService.js";
import {
  getStaticQuestionCount,
  getStaticQuestionText,
  getVerificationFlowLabel,
} from "./verificationFlows.js";

const DEFAULT_LANGUAGE = "English";

export function startControlledInterview({ role }) {
  const roleLabel = getVerificationFlowLabel(role);
  if (!roleLabel) {
    const error = new Error("A valid role is required to start the controlled interview.");
    error.status = 400;
    throw error;
  }

  return {
    role,
    roleLabel,
    lockedLanguage: DEFAULT_LANGUAGE,
    currentQuestionIndex: 0,
    status: "awaiting_consent",
    aiText: "This call is from Record. Can we continue?",
  };
}

export async function handleControlledTurn({
  role,
  transcript,
  currentQuestionIndex = 0,
  lockedLanguage = DEFAULT_LANGUAGE,
}) {
  const roleLabel = getVerificationFlowLabel(role);
  if (!roleLabel) {
    const error = new Error("A valid role is required.");
    error.status = 400;
    throw error;
  }

  if (!transcript?.trim()) {
    const error = new Error("Candidate transcript is required.");
    error.status = 400;
    throw error;
  }

  const detection = await detectCandidateLanguage({
    transcript,
    lockedLanguage,
  });

  const nextLanguage = detection.lockedLanguage === "Unknown"
    ? DEFAULT_LANGUAGE
    : detection.lockedLanguage;
  const totalQuestions = getStaticQuestionCount(role);

  if (currentQuestionIndex >= totalQuestions) {
    return {
      role,
      roleLabel,
      lockedLanguage: nextLanguage,
      currentQuestionIndex,
      status: "completed",
      languageDetection: detection,
      aiText: getClosingText(nextLanguage),
    };
  }

  const question = getStaticQuestionText(role, currentQuestionIndex, nextLanguage);

  return {
    role,
    roleLabel,
    lockedLanguage: nextLanguage,
    currentQuestionIndex: currentQuestionIndex + 1,
    status: currentQuestionIndex + 1 >= totalQuestions ? "last_question_asked" : "in_progress",
    languageDetection: detection,
    aiText: question,
  };
}

function getClosingText(language) {
  if (language === "Tamil") {
    return "நன்றி. உங்கள் பதில்களை பதிவு செய்துள்ளோம். எங்கள் குழு பார்த்து பின்னர் தொடர்பு கொள்வார்கள். Goodbye.";
  }

  if (language === "Hindi") {
    return "Dhanyavaad. Humne aapke responses record kar liye hain. Hamari team review karke aapse contact karegi. Goodbye.";
  }

  return "Thank you. We have recorded your responses. Our team will review and get back to you. Goodbye.";
}
