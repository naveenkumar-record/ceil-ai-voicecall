import { useState } from "react";
import { initiateCall } from "../services/api.js";

export default function PhoneInterview({ candidate, disabled, setTranscript }) {
  const [status, setStatus] = useState("idle");
  const [activityMessage, setActivityMessage] = useState("Ready to initiate phone interview.");
  const [callResponse, setCallResponse] = useState(null);

  const isLoading = status === "initiating";

  async function handleStartCall() {
    setStatus("initiating");
    setCallResponse(null);
    setActivityMessage("Initiating Raya phone call.");

    try {
      const result = await initiateCall({
        phoneNumber: candidate.phoneNumber,
        candidate,
      });

      setCallResponse(result);
      setStatus("initiated");
      setActivityMessage("Phone call initiated. Candidate should receive the call shortly.");
      setTranscript([
        makeTranscriptEntry(
          "AI",
          `Raya phone interview initiated for ${candidate.candidateName} at ${candidate.phoneNumber}.`,
        ),
      ]);
    } catch (error) {
      setStatus("blocked");
      setActivityMessage(getCallMessage(error));
      setTranscript([
        makeTranscriptEntry(
          "AI",
          `Phone call could not be initiated for ${candidate.candidateName}. Check Raya calling setup.`,
        ),
      ]);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Phone Interview Console</h2>
            <p className="mt-1 text-sm text-slate-500">Raya outbound calling mode</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="space-y-6 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Candidate" value={candidate.candidateName || "Not set"} />
          <Metric label="Phone" value={candidate.phoneNumber || "Not set"} />
          <Metric label="Language" value={candidate.preferredLanguage || "Not set"} />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-950 px-5 py-8">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 text-2xl font-bold text-white">
              CALL
            </div>
            <p className="text-sm font-medium text-slate-200">{activityMessage}</p>
          </div>
        </div>

        {callResponse && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Call request accepted by Raya.
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStartCall}
            disabled={disabled || isLoading}
            className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? "Initiating Call" : "Start Phone Interview"}
          </button>
        </div>

        {disabled && (
          <p className="text-sm text-slate-500">Save candidate information before starting.</p>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }) {
  const color = {
    idle: "bg-slate-100 text-slate-600",
    initiating: "bg-indigo-50 text-indigo-700",
    initiated: "bg-emerald-50 text-emerald-700",
    blocked: "bg-amber-50 text-amber-700",
  }[status] || "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${color}`}>
      {status}
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

function getCallMessage(error) {
  return error?.response?.data?.message || "Raya call setup is incomplete. Check API key and agent ID.";
}
