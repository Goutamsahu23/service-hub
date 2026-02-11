export function ErrorMessage({ message, className = "rounded-lg bg-red-50 p-3 text-sm text-red-700" }: { message: string; className?: string }) {
  if (!message) return null;
  return <div className={className}>{message}</div>;
}
