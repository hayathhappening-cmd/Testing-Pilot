"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--accent)] text-slate-950 shadow-lg shadow-cyan-950/20 hover:-translate-y-0.5 hover:bg-cyan-300",
        variant === "secondary" &&
          "border border-white/15 bg-white/6 text-white hover:bg-white/10",
        variant === "ghost" && "text-slate-300 hover:bg-white/5 hover:text-white",
        variant === "danger" &&
          "border border-rose-400/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25",
        className,
      )}
      {...props}
    />
  );
}

