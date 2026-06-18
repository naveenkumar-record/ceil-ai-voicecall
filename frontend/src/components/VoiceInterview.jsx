import { useEffect, useRef, useState } from "react";
import {
  evaluateCandidate,
  generateQuestion,
  speechToText,
  startInterview,
  textToSpeech,
} from "../services/api.js";

const TOTAL_QUESTIONS = 3;
const SILENCE_LIMIT_MS = 1800;
const MIN_RECORDING_MS = 1200;
const MAX_RECORDING_MS = 30000;
const VOICE_THRESHOLD = 0.025;
const MAX_STT_RETRIES = 2;

export default function VoiceInterview({
  candidate,
  disabled,
  transcript,
  setTranscript,
  setEvaluation,
}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activityMessage, setActivityMessage] = useState("Ready to start.");

  const pcmChunksRef = useRef([]);
  const audioSourceRef = useRef(null);
  const audioProcessorRef = useRef(null);
  const sampleRateRef = useRef(44100);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const silenceFrameRef = useRef(null);
  const shouldProcessRecordingRef = useRef(true);
  const transcriptRef = useRef(transcript);
  const questionNumberRef = useRef(questionNumber);
  const speechLanguageRef = useRef(candidate.preferredLanguage);
  const sttRetryCountRef = useRef(0);

  const isFinished = status === "completed";

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    questionNumberRef.current = questionNumber;
  }, [questionNumber]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      stopStream();
    };
  }, []);

  async function handleStart() {
    setError("");
    setIsLoading(true);
    setEvaluation(null);
    setTranscript([]);
    setQuestionNumber(0);
    setActivityMessage("Preparing interview.");
    speechLanguageRef.current = candidate.preferredLanguage;
    sttRetryCountRef.current = 0;

    try {
      const started = await startInterview(candidate);
      const greetingEntry = makeTranscriptEntry("AI", started.greeting);
      setTranscript([greetingEntry]);
      setStatus("active");
      await speak(started.greeting);
      await askNextQuestion([greetingEntry], 0, "");
    } catch (startError) {
      setStatus("idle");
      setError(getErrorMessage(startError));
      setIsLoading(false);
    }
  }

  async function askNextQuestion(currentTranscript, currentIndex, lastAnswer) {
    setActivityMessage("Preparing next question.");
    const response = await generateQuestion({
      candidate,
      transcript: currentTranscript,
      currentQuestionIndex: currentIndex,
      lastAnswer,
      activeLanguage: speechLanguageRef.current,
    });

    if (response.isComplete || !response.question) {
      await completeInterview(currentTranscript);
      return;
    }

    const aiEntry = makeTranscriptEntry("AI", response.question);
    const updatedTranscript = [...currentTranscript, aiEntry];
    setTranscript(updatedTranscript);
    setQuestionNumber(response.questionNumber);
    sttRetryCountRef.current = 0;
    await speak(response.question);
    await startAutoRecording();
  }

  async function startAutoRecording() {
    setError("");
    setIsLoading(false);
    setActivityMessage("Listening. Answer naturally, then pause when finished.");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      pcmChunksRef.current = [];
      shouldProcessRecordingRef.current = true;

      setIsRecording(true);
      startAudioCapture(stream);
    } catch {
      setError("Microphone permission is required to record the answer.");
      setIsLoading(false);
    }
  }

  function stopCurrentRecording(processRecording = true) {
    shouldProcessRecordingRef.current = processRecording;
    void handleRecordStop();
    stopStream();
  }

  async function handleRecordStop() {
    setIsRecording(false);
    setIsLoading(true);
    setActivityMessage("Transcribing candidate answer.");
    stopStream();

    if (!shouldProcessRecordingRef.current) {
      setIsLoading(false);
      return;
    }

    try {
      const audioBlob = encodeWav(pcmChunksRef.current, sampleRateRef.current);
      const sttResult = await speechToText(audioBlob, getSttLanguage(speechLanguageRef.current));
      const transcriptText = sttResult.transcript?.trim();

      if (!transcriptText) {
        await retryListening();
        return;
      }

      sttRetryCountRef.current = 0;
      updateSpeechLanguage(sttResult.language, transcriptText);
      await handleCandidateAnswer(transcriptText);
    } catch (recordError) {
      await retryListening();
    } finally {
      setIsLoading(false);
    }
  }

  async function retryListening() {
    sttRetryCountRef.current += 1;

    if (sttRetryCountRef.current > MAX_STT_RETRIES) {
      setActivityMessage("I could not hear the answer clearly. Please start again when ready.");
      setStatus("stopped");
      return;
    }

    const retryPrompt = speechLanguageRef.current.toLowerCase().includes("tamil")
      ? "மன்னிக்கவும், உங்கள் பதில் தெளிவாக கேட்கவில்லை. தயவுசெய்து மீண்டும் சொல்லுங்கள்."
      : "Sorry, I could not hear your answer clearly. Please say it again.";

    setActivityMessage("Listening again.");
    await speak(retryPrompt);
    await startAutoRecording();
  }

  async function handleCandidateAnswer(answer) {
    const candidateEntry = makeTranscriptEntry("Candidate", answer);
    const updatedTranscript = [...transcriptRef.current, candidateEntry];
    setTranscript(updatedTranscript);

    if (questionNumberRef.current >= TOTAL_QUESTIONS) {
      await completeInterview(updatedTranscript);
      return;
    }

    await askNextQuestion(updatedTranscript, questionNumberRef.current, answer);
  }

  async function completeInterview(finalTranscript) {
    setStatus("completed");
    setIsLoading(true);
    setActivityMessage("Generating final evaluation.");

    const result = await evaluateCandidate({
      candidate,
      transcript: finalTranscript,
    });

    setEvaluation(result);

    const closing = speechLanguageRef.current.toLowerCase().includes("tamil")
      ? `நன்றி ${candidate.candidateName}. Interview முடிந்துவிட்டது. உங்கள் evaluation summary ready ஆகிவிட்டது.`
      : `Thank you ${candidate.candidateName}. The interview is complete. Your evaluation summary is ready.`;
    setTranscript((current) => [...current, makeTranscriptEntry("AI", closing)]);
    await speak(closing);
    setIsLoading(false);
  }

  function handleStop() {
    stopCurrentRecording(false);
    window.speechSynthesis?.cancel();
    setIsRecording(false);
    setIsLoading(false);
    setStatus("stopped");
    setActivityMessage("Interview stopped.");
  }

  async function speak(text) {
    setActivityMessage("AI is speaking.");
    try {
      const result = await textToSpeech(text, speechLanguageRef.current);

      if (result.audioBase64) {
        await playBase64Audio(result.audioBase64, result.mimeType);
        setActivityMessage("AI finished speaking.");
        return;
      }

      await speakWithBrowser(text);
    } catch {
      await speakWithBrowser(text);
    }
    setActivityMessage("AI finished speaking.");
  }

  function speakWithBrowser(text) {
    if (!("speechSynthesis" in window)) return Promise.resolve();

    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLanguageRef.current.toLowerCase().includes("tamil")
        ? "ta-IN"
        : "en-IN";
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }

  function updateSpeechLanguage(detectedLanguage, answerText) {
    const nextLanguage = normalizeDetectedLanguage(detectedLanguage, answerText);

    if (nextLanguage) {
      speechLanguageRef.current = nextLanguage;
    }
  }

  function startAudioCapture(stream) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      window.setTimeout(() => stopCurrentRecording(true), MAX_RECORDING_MS);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const data = new Uint8Array(analyser.fftSize);
    const startedAt = Date.now();
    let hasDetectedSpeech = false;
    let lastVoiceAt = Date.now();

    audioContextRef.current = audioContext;
    audioSourceRef.current = source;
    audioProcessorRef.current = processor;
    sampleRateRef.current = audioContext.sampleRate;
    source.connect(analyser);
    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (event) => {
      if (!shouldProcessRecordingRef.current) return;
      const input = event.inputBuffer.getChannelData(0);
      pcmChunksRef.current.push(new Float32Array(input));
    };

    function detect() {
      analyser.getByteTimeDomainData(data);
      const volume = getRmsVolume(data);
      const now = Date.now();

      if (volume > VOICE_THRESHOLD) {
        hasDetectedSpeech = true;
        lastVoiceAt = now;
      }

      const hasTimedOut = now - startedAt > MAX_RECORDING_MS;
      const hasFinishedSpeaking =
        hasDetectedSpeech && now - lastVoiceAt > SILENCE_LIMIT_MS && now - startedAt > MIN_RECORDING_MS;

      if (hasTimedOut || hasFinishedSpeaking) {
        stopCurrentRecording(true);
        return;
      }

      silenceFrameRef.current = window.requestAnimationFrame(detect);
    }

    silenceFrameRef.current = window.requestAnimationFrame(detect);
  }

  function stopStream() {
    if (silenceFrameRef.current) {
      window.cancelAnimationFrame(silenceFrameRef.current);
      silenceFrameRef.current = null;
    }

    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current.onaudioprocess = null;
      audioProcessorRef.current = null;
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }
    audioContextRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Interview Console</h2>
            <p className="mt-1 text-sm text-slate-500">
              Question {Math.min(questionNumber, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}
            </p>
          </div>
          <StatusBadge status={status} isLoading={isLoading} isRecording={isRecording} />
        </div>
      </div>

      <div className="space-y-6 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Candidate" value={candidate.candidateName || "Not set"} />
          <Metric label="Language" value={candidate.preferredLanguage || "Not set"} />
          <Metric label="Mode" value="Voice" />
        </div>

        <AudioVisualizer active={isRecording || isLoading} />

        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          {activityMessage}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStart}
            disabled={disabled || isLoading || status === "active"}
            className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Start Interview
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={status !== "active" && !isRecording}
            className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            Stop Interview
          </button>
        </div>

        {disabled && (
          <p className="text-sm text-slate-500">Save candidate information before starting.</p>
        )}
        {isFinished && (
          <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Interview completed successfully.
          </p>
        )}
      </div>
    </section>
  );
}

async function playBase64Audio(audioBase64, mimeType = "audio/mpeg") {
  const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
  const ended = waitForAudioEnd(audio);
  await audio.play();
  await ended;
}

function waitForAudioEnd(audio) {
  return new Promise((resolve) => {
    audio.onended = resolve;
    audio.onerror = resolve;
  });
}

function getRmsVolume(data) {
  let sum = 0;

  for (const value of data) {
    const centered = (value - 128) / 128;
    sum += centered * centered;
  }

  return Math.sqrt(sum / data.length);
}

function encodeWav(chunks, sampleRate) {
  const samples = mergeFloat32Chunks(chunks);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function mergeFloat32Chunks(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

function writeAscii(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function normalizeDetectedLanguage(detectedLanguage, answerText = "") {
  const detected = String(detectedLanguage || "").toLowerCase();

  if (detected.includes("ta") || detected.includes("tamil")) return "Tamil";
  if (detected.includes("en") || detected.includes("english")) return "English";
  if (containsTamilText(answerText)) return "Tamil";

  return null;
}

function containsTamilText(text) {
  return /[\u0B80-\u0BFF]/.test(text);
}

function getSttLanguage(currentLanguage = "") {
  return currentLanguage.toLowerCase().includes("tamil") ? "Tamil" : "English";
}

function AudioVisualizer({ active }) {
  const bars = [35, 72, 48, 88, 55, 95, 42, 68, 38, 80, 50, 74];

  return (
    <div className="flex h-28 items-end justify-center gap-2 rounded-lg border border-slate-200 bg-slate-950 px-5 py-6">
      {bars.map((height, index) => (
        <span
          key={height + index}
          className={`visualizer-bar w-2 rounded-full ${
            active ? "bg-teal-300" : "bg-slate-600"
          }`}
          style={{
            height: `${height}%`,
            animationDelay: `${index * 70}ms`,
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status, isLoading, isRecording }) {
  const label = isRecording ? "Recording" : isLoading ? "Processing" : status;
  const color = {
    active: "bg-teal-50 text-teal-700",
    completed: "bg-emerald-50 text-emerald-700",
    idle: "bg-slate-100 text-slate-600",
    stopped: "bg-amber-50 text-amber-700",
    Recording: "bg-rose-50 text-rose-700",
    Processing: "bg-indigo-50 text-indigo-700",
  }[label] || "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${color}`}>
      {label}
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function makeTranscriptEntry(speaker, text) {
  return {
    id: `${speaker}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    speaker,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Request failed. Please try again.";
}
