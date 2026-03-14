import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

