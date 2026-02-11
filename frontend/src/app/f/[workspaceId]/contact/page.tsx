"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import type { FormConfig } from "@/types";

export default function PublicContactPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!workspaceId) return;
    publicApi<FormConfig>(`/public/contact-form/${workspaceId}`)
      .then(setConfig)
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await publicApi(`/public/contact-form/${workspaceId}/submit`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-xl">
          <p className="text-slate-600">This form is not available.</p>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-slate-800">Message sent</h1>
          <p className="mt-3 text-slate-600">
            Thanks for reaching out. We&apos;ll get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:py-16">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-8 text-white">
            <h1 className="text-2xl font-bold tracking-tight">{config.formName}</h1>
            <p className="mt-1 text-teal-100">{config.workspaceName}</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-6">
              {config.fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {f.label || f.name}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
                      rows={4}
                      placeholder={`Your ${(f.label || f.name).toLowerCase()}...`}
                    />
                  ) : (
                    <input
                      type={f.type === "email" ? "email" : "text"}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
                      placeholder={f.type === "email" ? "you@example.com" : ""}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-8 w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition"
            >
              Send message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
