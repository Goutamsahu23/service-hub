"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Item } from "@/types";
import { ROLES } from "@/constants";
import { LoadingSpinner, EmptyState } from "@/components/ui";

export default function InventoryPage() {
  const { user } = useAuth();
  const workspaceId = user?.workspace?.id;
  const [list, setList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(10);
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    if (!workspaceId) return;
    api<Item[]>(`/inventory/${workspaceId}/items`)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId || !name.trim()) return;
    await api(`/inventory/${workspaceId}/items`, {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        quantity_available: qty,
        low_stock_threshold: threshold,
      }),
    });
    const next = await api<Item[]>(`/inventory/${workspaceId}/items`);
    setList(next);
    setName("");
    setQty(10);
    setThreshold(5);
  }

  async function updateQty(itemId: string, newQty: number) {
    if (!workspaceId) return;
    await api(`/inventory/${workspaceId}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity_available: newQty }),
    });
    setList((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity_available: newQty } : i)));
  }

  if (loading) return <LoadingSpinner />;

  const lowStockCount = list.filter((i) => i.quantity_available <= i.low_stock_threshold).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Inventory</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track items and get low-stock alerts.</p>
        </div>
      </div>

      {user?.role === ROLES[0] && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Add item</p>
          </div>
          <form onSubmit={addItem} className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[160px]">
                <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shampoo"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs font-medium text-slate-500">Qty</label>
                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="w-28">
                <label className="mb-1 block text-xs font-medium text-slate-500">Alert below</label>
                <input
                  type="number"
                  min={0}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Add item
              </button>
            </div>
          </form>
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-slate-800">No inventory items</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {user?.role === ROLES[0] ? "Add an item above to start tracking stock and get low-stock alerts." : "The owner can add items to track here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {list.length} item{list.length !== 1 ? "s" : ""}
            </p>
            {lowStockCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                {lowStockCount} low stock
              </span>
            )}
          </div>
          <ul className="divide-y divide-slate-100">
            {list.map((i) => {
              const isLow = i.quantity_available <= i.low_stock_threshold;
              return (
                <li
                  key={i.id}
                  className={`flex items-center gap-4 px-4 py-3 sm:px-5 ${isLow ? "bg-amber-50/50" : ""}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isLow ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">{i.name}</p>
                    <p className="text-sm text-slate-500">
                      {i.quantity_available} {i.unit}
                      {isLow && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Low stock
                        </span>
                      )}
                    </p>
                  </div>
                  {user?.role === ROLES[0] && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQty(i.id, i.quantity_available - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:border-slate-300"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQty(i.id, i.quantity_available + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:border-slate-300"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
