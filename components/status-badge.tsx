import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  APPROVED: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
  PENDING: "bg-amber-500/15 text-amber-100 border-amber-400/20",
  REJECTED: "bg-rose-500/15 text-rose-100 border-rose-400/20",
  TERMINATED: "bg-rose-500/15 text-rose-100 border-rose-400/20",
  active: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
  trialing: "bg-sky-500/15 text-sky-100 border-sky-400/20",
  pending_approval: "bg-amber-500/15 text-amber-100 border-amber-400/20",
  rejected: "bg-rose-500/15 text-rose-100 border-rose-400/20",
  terminated: "bg-rose-500/15 text-rose-100 border-rose-400/20",
};

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        styles[status] || "border-white/15 bg-white/5 text-slate-200",
      )}
    >
      {status.toString().replaceAll("_", " ")}
    </span>
  );
}
