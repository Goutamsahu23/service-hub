export function EmptyState({ message, className = "rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500" }: { message: string; className?: string }) {
  return <div className={className}>{message}</div>;
}
