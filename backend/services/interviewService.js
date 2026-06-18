import { generateInterviewQuestionWithLlm } from "./llmService.js";

const TOTAL_QUESTIONS = 3;

export async function startInterview(candidate) {
  validateCandidate(candidate);

  return {
    greeting: buildGreeting(candidate),
    totalQuestions: TOTAL_QUESTIONS,
    prompt: buildInterviewPrompt(candidate),
  };
}

export async function generateQuestion({
  candidate,
  transcript = [],
  currentQuestionIndex = 0,
  lastAnswer = "",
  activeLanguage,
}) {
  validateCandidate(candidate);

  if (currentQuestionIndex >= TOTAL_QUESTIONS) {
    return {
      isComplete: true,
      question: null,
      questionNumber: TOTAL_QUESTIONS,
    };
  }

  const responseLanguage = activeLanguage || candidate.preferredLanguage;
  const llmQuestion = await generateInterviewQuestionWithLlm({
    candidate,
    transcript,
    currentQuestionIndex,
    lastAnswer,
    activeLanguage: responseLanguage,
  });

  return {
    question: llmQuestion || buildFallbackQuestion(candidate, currentQuestionIndex, responseLanguage),
    questionNumber: currentQuestionIndex + 1,
    isComplete: false,
    source: llmQuestion ? "llm" : "fallback",
  };
}

export async function evaluateCandidate({ candidate, transcript = [] }) {
  validateCandidate(candidate);

  const candidateTurns = transcript.filter((entry) => entry.speaker === "Candidate");
  const combinedAnswers = candidateTurns.map((entry) => entry.text).join(" ");
  const wordCount = combinedAnswers.split(/\s+/).filter(Boolean).length;
  const skillMentions = normalizeSkills(candidate.skills).filter((skill) =>
    combinedAnswers.toLowerCase().includes(skill),
  ).length;

  const technicalKnowledge = clampScore(5 + skillMentions + Math.floor(wordCount / 80));
  const communication = clampScore(5 + Math.min(3, Math.floor(wordCount / 60)));
  const confidence = clampScore(candidateTurns.every((turn) => turn.text.length > 30) ? 8 : 6);
  const problemSolving = clampScore(5 + Math.min(3, countProblemSolvingSignals(combinedAnswers)));

  return {
    technicalKnowledge,
    communication,
    confidence,
    problemSolving,
    summary: buildSummary(candidate, {
      technicalKnowledge,
      communication,
      confidence,
      problemSolving,
      wordCount,
    }),
  };
}

function buildGreeting(candidate) {
  if (isTamilLanguage(candidate.preferredLanguage)) {
    return `வணக்கம் ${candidate.candidateName}. உங்கள் interview-க்கு வரவேற்கிறேன். உங்கள் role அல்லது skills: ${candidate.skills} அடிப்படையில் நான் சரியாக மூன்று கேள்விகள் கேட்பேன். நீங்கள் தமிழ் அல்லது Tamil-English mix-ல் இயல்பாக பதில் சொல்லலாம்.`;
  }

  return `Hello ${candidate.candidateName}. Welcome to your interview. I will ask exactly three questions based on your role or skills: ${candidate.skills}. Please answer naturally in ${candidate.preferredLanguage}, English, Tamil, or a mix of both.`;
}

function buildInterviewPrompt(candidate) {
  return `You are an AI Interviewer.

Candidate Name: ${candidate.candidateName}
Experience: ${candidate.experience}
Role or Skills: ${candidate.skills}

Responsibilities:
- Generate exactly 3 interview questions.
- Infer the candidate role from the role or skills.
- Ask one question at a time.
- Questions must match the actual role.
- If the role is software/IT, ask software technical questions.
- If the role is non-software, ask practical job-specific questions.
- Wait for candidate response.
- Detect candidate language automatically.
- If candidate switches between English and Tamil, continue naturally.
- Be professional and friendly.
- Do not reveal scores during interview.
- At the end generate an evaluation summary.`;
}

function buildFallbackQuestion(candidate, index, language) {
  const roleOrSkill = candidate.skills || "this role";
  const tamilQuestions = [
    `${roleOrSkill} வேலையில் உங்களுடைய previous experience பற்றி சொல்லுங்கள்.`,
    `${roleOrSkill} work site-ல் ஒரு problem வந்தால் நீங்கள் step by step எப்படி handle செய்வீர்கள்?`,
    `${roleOrSkill} வேலையில் safety, quality, customer satisfaction maintain செய்ய என்ன steps எடுப்பீர்கள்?`,
  ];
  const englishQuestions = [
    `Tell me about your previous experience related to ${roleOrSkill}.`,
    `If a problem happens while doing ${roleOrSkill} work, how would you handle it step by step?`,
    `How do you maintain safety, quality, and customer satisfaction in ${roleOrSkill} work?`,
  ];
  const questions = isTamilLanguage(language) ? tamilQuestions : englishQuestions;

  return questions[index] || questions[0];
}

function validateCandidate(candidate = {}) {
  const requiredFields = ["candidateName", "experience", "skills", "preferredLanguage"];
  const missing = requiredFields.filter((field) => !String(candidate[field] || "").trim());

  if (missing.length > 0) {
    const error = new Error(`Missing candidate fields: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
}

function normalizeSkills(skills = "") {
  return skills
    .toLowerCase()
    .split(/[,/|]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function isTamilLanguage(language = "") {
  return language.toLowerCase().includes("tamil") || language.toLowerCase().includes("ta");
}

function countProblemSolvingSignals(text) {
  const signals = [
    "debug",
    "tradeoff",
    "root cause",
    "tested",
    "optimized",
    "designed",
    "resolved",
    "safety",
    "repair",
    "fixed",
    "quality",
    "customer",
  ];
  return signals.filter((signal) => text.toLowerCase().includes(signal)).length;
}

function clampScore(score) {
  return Math.max(1, Math.min(10, score));
}

function buildSummary(candidate, scores) {
  if (scores.wordCount === 0) {
    return `${candidate.candidateName} completed the interview flow, but no candidate transcript was available for a detailed evaluation.`;
  }

  return `${candidate.candidateName} demonstrated ${scores.technicalKnowledge >= 7 ? "solid" : "developing"} knowledge in ${candidate.skills}. Communication was ${scores.communication >= 7 ? "clear" : "adequate"}, with ${scores.problemSolving >= 7 ? "good" : "some"} practical problem-solving evidence across the answers.`;
}
