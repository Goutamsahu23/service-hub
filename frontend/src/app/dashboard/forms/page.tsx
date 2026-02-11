"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Submission } from "@/types";
import { FORM_SUBMISSION_STATUSES } from "@/constants";
import { LoadingSpinner, EmptyState } from "@/components/ui";

export default function FormsPage() {
  const { user } = useAuth();
  const workspaceId = user?.workspace?.id;
  const [list, setList] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    api<Submission[]>(`/forms/${workspaceId}/submissions`)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Form submissions</h1>
          <p className="mt-0.5 text-sm text-slate-500">Post-booking forms sent to customers.</p>
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState message="No form submissions yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-medium text-slate-700">Contact</th>
                <th className="px-4 py-3 font-medium text-slate-700">Form</th>
                <th className="px-4 py-3 font-medium text-slate-700">Booking</th>
                <th className="px-4 py-3 font-medium text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{s.contact_name}</td>
                  <td className="px-4 py-3">{s.form_name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(s.booking_scheduled_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-sm ${
                      s.status === FORM_SUBMISSION_STATUSES[2] ? "bg-green-100 text-green-800" :
                      s.status === FORM_SUBMISSION_STATUSES[1] ? "bg-amber-100 text-amber-800" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
