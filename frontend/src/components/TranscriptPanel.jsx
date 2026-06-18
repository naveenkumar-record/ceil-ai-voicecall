export default function TranscriptPanel({ transcript }) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Live Transcript</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {transcript.length} turns
          </span>
        </div>
      </div>

      <div className="max-h-[680px] space-y-3 overflow-y-auto p-5">
        {transcript.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Conversation will appear here.
          </div>
        ) : (
          transcript.map((entry) => (
            <article
              key={entry.id}
              className={`rounded-md border p-3 ${
                entry.speaker === "AI"
                  ? "border-teal-100 bg-teal-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <span
                  className={`text-xs font-bold uppercase tracking-[0.14em] ${
                    entry.speaker === "AI" ? "text-teal-700" : "text-slate-600"
                  }`}
                >
                  {entry.speaker}
                </span>
                <time className="text-xs text-slate-400">{entry.time}</time>
              </div>
              <p className="text-sm leading-6 text-slate-700">{entry.text}</p>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
