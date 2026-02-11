"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Booking } from "@/types";
import { BOOKING_STATUSES } from "@/constants";
import { LoadingSpinner, EmptyState } from "@/components/ui";

export default function BookingsPage() {
  const { user } = useAuth();
  const workspaceId = user?.workspace?.id;
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (!workspaceId) return;
    const params = statusFilter ? `?status=${statusFilter}` : "";
    api<Booking[]>(`/bookings/${workspaceId}/bookings${params}`)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [workspaceId, statusFilter]);

  async function updateStatus(bookingId: string, status: string) {
    if (!workspaceId) return;
    await api(`/bookings/${workspaceId}/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dashboard:refresh-nav-counts"));
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Bookings</h1>
          <p className="mt-0.5 text-sm text-slate-500">View and manage appointments. Mark complete, no-show, or cancel.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={`min-h-[40px] rounded-lg px-4 py-2 text-sm font-medium ${!statusFilter ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-700"}`}
        >
          All
        </button>
        {BOOKING_STATUSES.filter((s) => s === "confirmed" || s === "completed").map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`min-h-[40px] rounded-lg px-4 py-2 text-sm font-medium ${statusFilter === s ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-700"}`}
          >
            {s === "no_show" ? "No-show" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState message="No bookings yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-medium text-slate-700">Date & time</th>
                <th className="px-4 py-3 font-medium text-slate-700">Contact</th>
                <th className="px-4 py-3 font-medium text-slate-700">Service</th>
                <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(b.scheduled_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{b.contact_name}</td>
                  <td className="px-4 py-3">{b.booking_type_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      b.status === BOOKING_STATUSES[1] ? "bg-emerald-100 text-emerald-800" :
                      b.status === "no_show" ? "bg-red-100 text-red-800" :
                      b.status === BOOKING_STATUSES[3] ? "bg-slate-200 text-slate-600" :
                      "bg-sky-100 text-sky-800"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === BOOKING_STATUSES[0] ? (
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateStatus(b.id, BOOKING_STATUSES[1])}
                          className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-200"
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(b.id, "no_show")}
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 transition hover:bg-red-200"
                        >
                          No-show
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(b.id, BOOKING_STATUSES[3])}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
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
