import { useState } from "react";

const languages = ["Tamil", "Tamil-English Mixed", "English"];

export default function CandidateForm({ candidate, isLocked, onSubmit }) {
  const [formData, setFormData] = useState(candidate);
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    ["candidateName", "phoneNumber", "experience", "skills", "preferredLanguage"].forEach((field) => {
      if (!String(formData[field] || "").trim()) {
        nextErrors[field] = "Required";
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Candidate Information</h2>
          <p className="mt-1 text-sm text-slate-500">Profile used for dynamic questions.</p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          Setup
        </span>
      </div>

      <div className="space-y-4">
        <FieldError label="Candidate Name" error={errors.candidateName}>
          <input
            value={formData.candidateName}
            disabled={isLocked}
            onChange={(event) => updateField("candidateName", event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
            placeholder="Example: Priya Raman"
          />
        </FieldError>

        <FieldError label="Phone Number" error={errors.phoneNumber}>
          <input
            value={formData.phoneNumber}
            disabled={isLocked}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
            placeholder="Example: 6374811669"
          />
        </FieldError>

        <FieldError label="Experience" error={errors.experience}>
          <input
            value={formData.experience}
            disabled={isLocked}
            onChange={(event) => updateField("experience", event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
            placeholder="Example: 3 years"
          />
        </FieldError>

        <FieldError label="Skills" error={errors.skills}>
          <textarea
            value={formData.skills}
            disabled={isLocked}
            onChange={(event) => updateField("skills", event.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
            placeholder="React, Angular, Node.js, JavaScript"
          />
        </FieldError>

        <FieldError label="Preferred Language" error={errors.preferredLanguage}>
          <select
            value={formData.preferredLanguage}
            disabled={isLocked}
            onChange={(event) => updateField("preferredLanguage", event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </FieldError>
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isLocked}
      >
        Save Candidate
      </button>
    </form>
  );
}

function FieldError({ label, error, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        {error && <span className="text-xs font-semibold text-rose-600">{error}</span>}
      </div>
      {children}
    </label>
  );
}
