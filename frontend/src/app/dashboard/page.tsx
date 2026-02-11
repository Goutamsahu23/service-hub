"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { WORKSPACE_STATUSES } from "@/constants";
import { LoadingSpinner } from "@/components/ui";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const workspaceId = user?.workspace?.id;

  useEffect(() => {
    if (!workspaceId) return;
    api<DashboardData>(`/dashboard/${workspaceId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading || !data) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">What’s happening in your business right now.</p>
        </div>
      </div>

      {user?.workspace?.status === WORKSPACE_STATUSES[0] && (
        <Link
          href="/dashboard/onboarding"
          className="block rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-6 text-center text-sky-700 hover:border-sky-400"
        >
          Complete setup to activate your workspace →
        </Link>
      )}

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-medium text-slate-800">Alerts</h2>
          <ul className="space-y-2">
            {data.alerts.slice(0, 5).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                <span>{a.title}</span>
                {a.link_type && a.link_id && (
                  <Link
                    href={
                      a.link_type === "conversation"
                        ? `/dashboard/inbox?c=${a.link_id}`
                        : a.link_type === "booking"
                          ? `/dashboard/bookings?id=${a.link_id}`
                          : "#"
                    }
                    className="font-medium text-amber-700 hover:underline"
                  >
                    View
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <span className="text-2xl font-bold tabular-nums text-slate-800">{data.bookings.today.length}</span>
          </div>
          <h3 className="mt-3 text-sm font-medium text-slate-700">Today’s bookings</h3>
          <p className="mt-1 text-xs text-slate-500">
            {data.bookings.completedToday} completed, {data.bookings.noShowToday} no-show
          </p>
        </div>

        <Link href="/dashboard/inbox" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md no-underline">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <span className="text-2xl font-bold tabular-nums text-slate-800">{data.conversations.openCount}</span>
          </div>
          <h3 className="mt-3 text-sm font-medium text-slate-700">Open conversations</h3>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-600">
            Open Inbox
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tabular-nums text-slate-800">{data.forms.pending}</span>
          </div>
          <h3 className="mt-3 text-sm font-medium text-slate-700">Forms</h3>
          <p className="mt-1 text-xs text-slate-500">
            {data.forms.overdue} overdue · {data.forms.completed} completed
          </p>
        </div>

        <Link
          href="/dashboard/inventory"
          className={`rounded-xl border p-5 shadow-sm transition no-underline ${
            data.inventory.lowStock.length > 0
              ? "border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:shadow-md"
              : "border-slate-200 bg-white hover:border-sky-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              data.inventory.lowStock.length > 0 ? "bg-amber-200 text-amber-700" : "bg-slate-100 text-slate-600"
            }`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tabular-nums text-slate-800">{data.inventory.lowStock.length}</span>
          </div>
          <h3 className="mt-3 text-sm font-medium text-slate-700">Low stock</h3>
          {data.inventory.lowStock.length > 0 ? (
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
              View items
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          ) : (
            <p className="mt-1 text-xs text-slate-500">All good</p>
          )}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Today’s bookings</h2>
            {data.bookings.today.length > 0 && (
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">
                {data.bookings.today.length}
              </span>
            )}
          </div>
          <div className="p-4">
            {data.bookings.today.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No bookings today</p>
            ) : (
              <ul className="space-y-0 divide-y divide-slate-100">
                {data.bookings.today.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                      {(b.contact_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800">{b.contact_name}</p>
                      <p className="text-sm text-slate-500">
                        {b.booking_type_name} · {new Date(b.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/dashboard/bookings"
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-sky-600 transition hover:bg-sky-50 hover:border-sky-200"
            >
              View all bookings
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Upcoming</h2>
            {data.bookings.upcoming.length > 0 && (
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {data.bookings.upcoming.length}
              </span>
            )}
          </div>
          <div className="p-4">
            {data.bookings.upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No upcoming bookings</p>
            ) : (
              <ul className="space-y-0 divide-y divide-slate-100">
                {data.bookings.upcoming.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {(b.contact_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800">{b.contact_name}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(b.scheduled_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {b.booking_type_name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
