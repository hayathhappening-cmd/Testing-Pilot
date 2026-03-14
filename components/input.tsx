import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-300/60",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-36 w-full rounded-3xl border border-white/12 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300/60",
        props.className,
      )}
    />
  );
}

