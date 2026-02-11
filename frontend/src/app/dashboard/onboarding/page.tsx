"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const STEPS = [
  { id: "workspace", title: "Workspace", done: true },
  { id: "emailOrSms", title: "Email or SMS" },
  { id: "contactForm", title: "Contact form" },
  { id: "bookingTypes", title: "Booking types" },
  { id: "postBookingForms", title: "Post-booking forms" },
  { id: "inventory", title: "Inventory" },
  { id: "staff", title: "Staff" },
  { id: "active", title: "Activate" },
];

export interface OnboardingStatus {
  steps: Record<string, boolean> & { hasAvailability?: boolean };
  canActivate?: boolean;
  workspace?: { name: string; status: string };
}

export default function OnboardingPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const workspaceId = user?.workspace?.id;
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    api<OnboardingStatus>(`/workspaces/${workspaceId}/onboarding`)
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [workspaceId]);

  // Refetch onboarding status when reaching Activate step so canActivate is up to date
  useEffect(() => {
    if (!workspaceId || currentStep !== STEPS.length - 1) return;
    api<OnboardingStatus>(`/workspaces/${workspaceId}/onboarding`)
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [workspaceId, currentStep]);

  if (!user) return null;

  const stepId = STEPS[currentStep]?.id ?? "workspace";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm font-medium text-sky-600 hover:underline">
          ← Back to dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Setup your workspace</h1>
            <p className="mt-0.5 text-sm text-slate-500">Complete these steps to go live.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentStep(i)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
              currentStep === i ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {stepId === "emailOrSms" && (
          <EmailSmsStep
            workspaceId={workspaceId!}
            onDone={() => {
              setStatus(null);
              api<OnboardingStatus>(`/workspaces/${workspaceId}/onboarding`).then(setStatus);
              setCurrentStep(2);
            }}
            saving={saving}
            setSaving={setSaving}
            error={error}
            setError={setError}
          />
        )}
        {stepId === "contactForm" && (
          <ContactFormStep
            workspaceId={workspaceId!}
            onDone={() => setCurrentStep(3)}
            saving={saving}
            setSaving={setSaving}
          />
        )}
        {stepId === "bookingTypes" && (
          <BookingTypesStep workspaceId={workspaceId!} onDone={() => setCurrentStep(4)} />
        )}
        {stepId === "postBookingForms" && (
          <PostBookingFormsStep workspaceId={workspaceId!} onDone={() => setCurrentStep(5)} />
        )}
        {stepId === "inventory" && (
          <InventoryStep workspaceId={workspaceId!} onDone={() => setCurrentStep(6)} />
        )}
        {stepId === "staff" && (
          <StaffStep workspaceId={workspaceId!} onDone={() => setCurrentStep(7)} />
        )}
        {stepId === "active" && (
          <ActivateStep
            workspaceId={workspaceId!}
            canActivate={status?.canActivate}
            onDone={async () => {
              await refresh();
              router.push("/dashboard");
            }}
            setError={setError}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

function EmailSmsStep({
  workspaceId,
  onDone,
  saving,
  setSaving,
  error,
  setError,
}: {
  workspaceId: string;
  onDone: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  error: string;
  setError: (v: string) => void;
}) {
  const [provider, setProvider] = useState<"email" | "sms">("email");
  const [mock, setMock] = useState(true);
  const [apiKey, setApiKey] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (provider === "email") {
        await api(`/workspaces/${workspaceId}/integrations/email`, {
          method: "POST",
          body: JSON.stringify(
            mock ? { provider: "mock" } : { provider: "resend", apiKey, fromEmail: "noreply@example.com" }
          ),
        });
      } else {
        await api(`/workspaces/${workspaceId}/integrations/sms`, {
          method: "POST",
          body: JSON.stringify(mock ? { provider: "mock" } : { provider: "twilio", accountSid: "", authToken: "", phoneNumber: "" }),
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h2 className="text-lg font-medium text-slate-800">Connect Email or SMS</h2>
      <p className="mt-1 text-sm text-slate-500">At least one channel is required. You can use mock for testing.</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" checked={provider === "email"} onChange={() => setProvider("email")} />
            Email
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={provider === "sms"} onChange={() => setProvider("sms")} />
            SMS
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={mock} onChange={(e) => setMock(e.target.checked)} />
          Use mock (no real emails/SMS sent)
        </label>
        {!mock && provider === "email" && (
          <input
            type="text"
            placeholder="Resend API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        )}
        <button type="submit" disabled={saving} className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50">
          Save and continue
        </button>
      </form>
    </>
  );
}

function ContactFormStep({
  workspaceId,
  onDone,
  saving,
  setSaving,
}: {
  workspaceId: string;
  onDone: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api(`/workspaces/${workspaceId}/contact-form`, {
        method: "PUT",
        body: JSON.stringify({
          name: "Contact",
          fields: [
            { name: "name", type: "text", label: "Name" },
            { name: "email", type: "email", label: "Email" },
            { name: "message", type: "textarea", label: "Message" },
          ],
          welcome_message_template: "Thanks for reaching out, {name}! We'll get back to you soon.",
        }),
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h2 className="text-lg font-medium text-slate-800">Contact form</h2>
      <p className="mt-1 text-sm text-slate-500">A default form will be created. You can customize it later in Settings.</p>
      <form onSubmit={handleSubmit} className="mt-4">
        <button type="submit" disabled={saving} className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50">
          Create contact form and continue
        </button>
      </form>
    </>
  );
}

function BookingTypesStep({ workspaceId, onDone }: { workspaceId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(60);
  const [list, setList] = useState<{ id: string; name: string; duration_minutes: number }[]>([]);
  const [slots, setSlots] = useState<{ day_of_week: number; start_time: string; end_time: string }[]>([]);

  useEffect(() => {
    api<typeof list>(`/bookings/${workspaceId}/booking-types`).then(setList).catch(() => {});
    api<{ day_of_week: number; start_time: string; end_time: string }[]>(`/bookings/${workspaceId}/availability`).then(setSlots).catch(() => setSlots([]));
  }, [workspaceId]);

  async function addType(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api(`/bookings/${workspaceId}/booking-types`, {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), duration_minutes: duration }),
    });
    const next = await api<typeof list>(`/bookings/${workspaceId}/booking-types`);
    setList(next);
    setName("");
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [availDay, setAvailDay] = useState(1);
  const [availStart, setAvailStart] = useState("09:00");
  const [availEnd, setAvailEnd] = useState("17:00");

  async function addAvailability(e: React.FormEvent) {
    e.preventDefault();
    const newSlots = [...slots, { day_of_week: availDay, start_time: availStart, end_time: availEnd }];
    await api(`/bookings/${workspaceId}/availability`, {
      method: "PUT",
      body: JSON.stringify({ slots: newSlots }),
    });
    setSlots(newSlots);
  }

  return (
    <>
      <h2 className="text-lg font-medium text-slate-800">Booking types & availability</h2>
      <p className="mt-1 text-sm text-slate-500">Add at least one service and set weekly availability.</p>
      <form onSubmit={addType} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Service name"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min={15}
          className="w-24 rounded-lg border border-slate-300 px-3 py-2"
        />
        <span className="flex items-center text-slate-500">min</span>
        <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">Add</button>
      </form>
      <ul className="mt-2 space-y-1">
        {list.map((t) => (
          <li key={t.id} className="text-sm text-slate-600">{t.name} — {t.duration_minutes} min</li>
        ))}
      </ul>
      <div className="mt-6">
        <h3 className="font-medium text-slate-700">Availability</h3>
        <form onSubmit={addAvailability} className="mt-2 flex flex-wrap gap-2 items-center">
          <select value={availDay} onChange={(e) => setAvailDay(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1">
            {days.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
          <input type="time" value={availStart} onChange={(e) => setAvailStart(e.target.value)} className="rounded border px-2 py-1" />
          <span className="text-slate-500">to</span>
          <input type="time" value={availEnd} onChange={(e) => setAvailEnd(e.target.value)} className="rounded border px-2 py-1" />
          <button type="submit" className="rounded-lg bg-slate-600 px-3 py-1 text-white text-sm hover:bg-slate-700">Add slot</button>
        </form>
        <ul className="mt-2 text-sm text-slate-500">
          {slots.map((s, i) => (
            <li key={i}>{days[s.day_of_week]} {s.start_time}–{s.end_time}</li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={onDone} className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
        Continue
      </button>
    </>
  );
}

function PostBookingFormsStep({ workspaceId, onDone }: { workspaceId: string; onDone: () => void }) {
  const [name, setName] = useState("Intake form");
  const [created, setCreated] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await api(`/forms/${workspaceId}/templates`, {
      method: "POST",
      body: JSON.stringify({ name, fields: [{ name: "notes", type: "textarea", label: "Notes" }] }),
    });
    setCreated(true);
  }

  return (
    <>
      <h2 className="text-lg font-medium text-slate-800">Post-booking forms</h2>
      <p className="mt-1 text-sm text-slate-500">Optional. Forms sent to customers after they book.</p>
      {!created ? (
        <form onSubmit={create} className="mt-4 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">Add form</button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-green-600">Form created.</p>
      )}
      <button type="button" onClick={onDone} className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
        Continue
      </button>
    </>
  );
}

function InventoryStep({ workspaceId, onDone }: { workspaceId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(10);
  const [threshold, setThreshold] = useState(5);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api(`/inventory/${workspaceId}/items`, {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), quantity_available: qty, low_stock_threshold: threshold }),
    });
    setName("");
  }

  return (
    <>
      <h2 className="text-lg font-medium text-slate-800">Inventory (optional)</h2>
      <p className="mt-1 text-sm text-slate-500">Track items and get low-stock alerts.</p>
      <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-20 rounded-lg border border-slate-300 px-2 py-2" />
        <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} placeholder="Alert below" className="w-24 rounded-lg border border-slate-300 px-2 py-2" />
        <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">Add item</button>
      </form>
      <button type="button" onClick={onDone} className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
        Continue
      </button>
    </>
  );
}

function StaffStep({ workspaceId, onDone }: { workspaceId: string; onDone: () => void }) {
  return (
    <>
      <h2 className="text-lg font-medium text-slate-800">Staff (optional)</h2>
      <p className="mt-1 text-sm text-slate-500">You can invite staff later from Settings.</p>
      <button type="button" onClick={onDone} className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
        Continue
      </button>
    </>
  );
}

function ActivateStep({
  workspaceId,
  canActivate,
  onDone,
  setError,
  error,
}: {
  workspaceId: string;
  canActivate?: boolean;
  onDone: () => Promise<void>;
  setError: (v: string) => void;
  error: string;
}) {
  const [loading, setLoading] = useState(false);

  async function activate() {
    setError("");
    setLoading(true);
    try {
      await api(`/workspaces/${workspaceId}/activate`, { method: "POST", body: "{}" });
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-lg font-medium text-slate-800">Activate workspace</h2>
      <p className="mt-1 text-sm text-slate-500">
        Once activated, your contact form and booking page will go live.
      </p>
      {!canActivate && (
        <p className="mt-2 text-sm text-amber-600">
          Complete: Email or SMS, Contact form, and Booking types + Availability (step 4).
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={activate}
        disabled={!canActivate || loading}
        className="mt-6 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Activating…" : "Activate workspace"}
      </button>
    </>
  );
}
