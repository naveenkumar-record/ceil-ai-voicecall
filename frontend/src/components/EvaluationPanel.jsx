const metrics = [
  ["technicalKnowledge", "Technical Knowledge"],
  ["communication", "Communication"],
  ["confidence", "Confidence"],
  ["problemSolving", "Problem Solving"],
];

export default function EvaluationPanel({ evaluation }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Evaluation</h2>
          <p className="mt-1 text-sm text-slate-500">Generated after question 3.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Final
        </span>
      </div>

      {!evaluation ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          Waiting for completed interview.
        </div>
      ) : (
        <div className="space-y-4">
          {metrics.map(([key, label]) => (
            <ScoreBar key={key} label={label} score={evaluation[key]} />
          ))}
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Summary</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{evaluation.summary}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function ScoreBar({ label, score = 0 }) {
  const width = `${Math.max(0, Math.min(10, score)) * 10}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-950">{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-teal-600" style={{ width }} />
      </div>
    </div>
  );
}
