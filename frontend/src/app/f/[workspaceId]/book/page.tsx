"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi } from "@/lib/api";
import type { BookingType, PublicBookPageData } from "@/types";
import { PUBLIC_BOOK_STEPS } from "@/constants";

export default function PublicBookPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [data, setData] = useState<PublicBookPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"type" | "date" | "confirm">("type");
  const [selectedType, setSelectedType] = useState<BookingType | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    publicApi<PublicBookPageData>(`/public/booking/${workspaceId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId || !selectedType || !selectedDate) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    publicApi<{ slots: string[] }>(
      `/public/booking/${workspaceId}/slots?bookingTypeId=${selectedType.id}&date=${selectedDate}`
    )
      .then((r) => setSlots(r.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [workspaceId, selectedType, selectedDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !selectedType || !selectedSlot) return;
    setError("");
    setSubmitting(true);
    try {
      await publicApi(`/public/booking/${data.workspaceId}`, {
        method: "POST",
        body: JSON.stringify({
          booking_type_id: selectedType.id,
          scheduled_at: selectedSlot,
          name,
          email: email || undefined,
          phone: phone || undefined,
          notes: notes || undefined,
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = step === "type" ? 0 : step === "date" ? 1 : 2;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-xl">
          <p className="text-slate-600">Booking is not available.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-slate-800">You&apos;re all set</h1>
          <p className="mt-3 text-slate-600">
            Your appointment is confirmed. We&apos;ll send you a reminder by email or SMS.
          </p>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:py-16">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-8 text-white">
            <h1 className="text-2xl font-bold tracking-tight">Book an appointment</h1>
            <p className="mt-1 text-teal-100">{data.workspaceName}</p>
            <div className="mt-6 flex gap-2">
              {PUBLIC_BOOK_STEPS.map((label, i) => (
                <span
                  key={label}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    i <= stepIndex ? "bg-white/20 text-white" : "bg-white/10 text-teal-200"
                  }`}
                >
                  {i + 1}. {label}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8">
            {step === "type" && (
              <div>
                <p className="text-sm font-medium text-slate-500">Choose a service</p>
                <div className="mt-4 space-y-3">
                  {data.bookingTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(t);
                        setStep("date");
                      }}
                      className="flex w-full items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50/50 px-5 py-4 text-left transition hover:border-teal-300 hover:bg-teal-50/50"
                    >
                      <span className="font-medium text-slate-800">{t.name}</span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-sm font-medium text-slate-600">
                        {t.duration_minutes} min
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "date" && selectedType && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setStep("type")}
                  className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  <span>←</span> Change service
                </button>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">{selectedType.name}</p>
                  <p className="text-sm text-slate-500">{selectedType.duration_minutes} minutes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minDate}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                    {slotsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        No slots available on this day. Pick another date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {slots.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(s);
                              setStep("confirm");
                            }}
                            className="rounded-xl border-2 border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:border-teal-400 hover:bg-teal-50"
                          >
                            {new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === "confirm" && selectedType && selectedSlot && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <button
                  type="button"
                  onClick={() => setStep("date")}
                  className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  <span>←</span> Change date & time
                </button>
                <div className="rounded-xl bg-teal-50 p-4 ring-1 ring-teal-100">
                  <p className="font-medium text-slate-800">{selectedType.name}</p>
                  <p className="mt-1 text-slate-600">
                    {new Date(selectedSlot).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-slate-600">
                    {new Date(selectedSlot).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    rows={2}
                    placeholder="Anything we should know?"
                  />
                </div>
                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 transition"
                >
                  {submitting ? "Confirming…" : "Confirm booking"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
