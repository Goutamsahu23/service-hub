"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { StaffMember } from "@/types";
import { ROLES, WORKSPACE_STATUSES } from "@/constants";
import { ErrorMessage } from "@/components/ui";

export default function SettingsPage() {
  const { user } = useAuth();
  const workspaceId = user?.workspace?.id;
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const isOwner = user?.role === ROLES[0];

  useEffect(() => {
    if (!workspaceId || !isOwner) return;
    api<StaffMember[]>(`/workspaces/${workspaceId}/staff`)
      .then(setStaff)
      .catch(() => setStaff([]));
  }, [workspaceId, isOwner]);

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId || !email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    setAdding(true);
    try {
      await api(`/workspaces/${workspaceId}/staff`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password, fullName: fullName.trim() || undefined }),
      });
      setEmail("");
      setPassword("");
      setFullName("");
      const list = await api<StaffMember[]>(`/workspaces/${workspaceId}/staff`);
      setStaff(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setAdding(false);
    }
  }

  const contactUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${user?.workspace?.id}/contact` : "";
  const bookingUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${user?.workspace?.id}/book` : "";

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your account, workspace, and team.</p>
        </div>
      </div>

      {/* Your account */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your account</h2>
        </div>
        <div className="p-6 flex flex-wrap items-center gap-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold text-lg">
            {(user?.fullName || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Email</p>
            <p className="mt-0.5 font-medium text-slate-800 truncate">{user?.email}</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
              {user?.role}
            </span>
          </div>
        </div>
      </section>

      {!isOwner && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-6 py-4 text-sm text-amber-800">
          You are signed in as <strong>Staff</strong>. You can use Inbox, Bookings, Forms, and Inventory. Only the owner can change workspace settings, integrations, and add staff.
        </div>
      )}

      {isOwner && (
        <>
          {/* Workspace */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Workspace</h2>
            </div>
            <div className="p-6 flex flex-wrap items-center gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008H17.25v-.008zm0 3h.008v.008H17.25v-.008z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">Workspace name</p>
                <p className="mt-0.5 font-semibold text-slate-800">{user?.workspace?.name}</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 capitalize">
                  {user?.workspace?.status}
                </span>
              </div>
            </div>
          </section>

          {/* Staff */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Team</h2>
              <p className="mt-1 text-sm text-slate-500">Add staff to use Inbox, Bookings, Forms, and Inventory. Share the login URL and credentials you set below.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-800">Invite new staff</h3>
                  <p className="mt-0.5 text-sm text-slate-500">They’ll use the same login URL with the email and password you set here.</p>
                </div>
              </div>
              <form onSubmit={handleAddStaff} className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      placeholder="staff@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      placeholder="Set a password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Name (optional)</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      placeholder="Full name"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={adding}
                      className="w-full rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
                    >
                      {adding ? "Adding…" : "Add staff"}
                    </button>
                  </div>
                </div>
                <ErrorMessage message={error} />
              </form>
              {staff.length > 0 && (
                <ul className="mt-6 space-y-0 border-t border-slate-100 pt-5">
                  {staff.map((s) => (
                    <li key={s.id} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-medium">
                        {(s.full_name || s.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800">{s.full_name || s.email}</p>
                        {s.full_name && <p className="text-sm text-slate-500">{s.email}</p>}
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{s.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Public links */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Public links</h2>
              <p className="mt-1 text-sm text-slate-500">Share these with customers. No login required.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Contact form</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={contactUrl}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(contactUrl)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Booking page</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={bookingUrl}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bookingUrl)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
