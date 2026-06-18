import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 45000,
});

export async function startInterview(candidate) {
  const { data } = await api.post("/interview/start", candidate);
  return data;
}

export async function generateQuestion(payload) {
  const { data } = await api.post("/interview/question", payload);
  return data;
}

export async function speechToText(audioBlob, language) {
  const formData = new FormData();
  const fileName = audioBlob.type.includes("wav") ? "candidate-response.wav" : "candidate-response.webm";
  formData.append("audio", audioBlob, fileName);
  formData.append("language", language || "auto");

  const { data } = await api.post("/stt", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function textToSpeech(text, language) {
  const { data } = await api.post("/tts", { text, language });
  return data;
}

export async function evaluateCandidate(payload) {
  const { data } = await api.post("/interview/evaluate", payload);
  return data;
}

export async function initiateCall(payload) {
  const { data } = await api.post("/calls/initiate", payload);
  return data;
}

export async function initiateBatchCalls(payload) {
  const { data } = await api.post("/calls/batch", payload);
  return data;
}

export async function getBatchStatus(batchId) {
  const { data } = await api.get(`/calls/batch/${batchId}`);
  return data;
}
