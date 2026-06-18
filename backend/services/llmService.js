import axios from "axios";

const DEFAULT_LLM_MODEL = "gpt-4o-mini";

export async function generateInterviewQuestionWithLlm({
  candidate,
  transcript,
  currentQuestionIndex,
  lastAnswer,
  activeLanguage,
}) {
  if (!process.env.LLM_API_KEY || !process.env.LLM_BASE_URL) {
    return null;
  }

  const prompt = buildQuestionPrompt({
    candidate,
    transcript,
    currentQuestionIndex,
    lastAnswer,
    activeLanguage,
  });

  const { data } = await axios.post(
    `${process.env.LLM_BASE_URL.replace(/\/$/, "")}/chat/completions`,
    {
      model: process.env.LLM_MODEL || DEFAULT_LLM_MODEL,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a professional interviewer. Return only one interview question. Do not include numbering, scores, explanations, or markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return data.choices?.[0]?.message?.content?.trim() || null;
}

function buildQuestionPrompt({
  candidate,
  transcript,
  currentQuestionIndex,
  lastAnswer,
  activeLanguage,
}) {
  const askedQuestions = transcript
    .filter((entry) => entry.speaker === "AI")
    .map((entry) => entry.text)
    .join("\n");

  return `Candidate name: ${candidate.candidateName}
Experience: ${candidate.experience}
Role or skills: ${candidate.skills}
Preferred language: ${candidate.preferredLanguage}
Current response language: ${activeLanguage || candidate.preferredLanguage}
Question number to ask now: ${currentQuestionIndex + 1} of 3
Previously asked questions:
${askedQuestions || "None"}
Last candidate answer:
${lastAnswer || "None"}

Create the next single interview question.

Rules:
- Infer the actual job role from "Role or skills".
- If the role is software/IT, ask a technical software question.
- If the role is non-software, such as plumber, driver, nurse, cook, sales, support, electrician, labour, or any other job, ask a practical role-specific job question.
- Do not ask software concepts unless the role is clearly software/IT.
- Keep the question short and natural for a voice interview.
- Use Tamil if current response language is Tamil. Use English if it is English.
- For Tamil, natural Tamil-English mixed wording is allowed for job terms.
- Ask only one question.`;
}
