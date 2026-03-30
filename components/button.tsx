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
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-[1px]",
        variant === "primary" &&
          "bg-[var(--accent-gradient)] text-[var(--accent-foreground)] shadow-[var(--shadow-button)] hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[var(--shadow-button-hover)]",
        variant === "secondary" &&
          "border border-[var(--surface-border)] bg-[var(--surface-muted)] text-[var(--foreground)] shadow-sm hover:-translate-y-0.5 hover:bg-[var(--surface-elevated)] hover:shadow-[var(--shadow-soft)]",
        variant === "ghost" && "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
        variant === "danger" &&
          "border border-rose-400/30 bg-rose-500/12 text-rose-100 shadow-sm hover:-translate-y-0.5 hover:bg-rose-500/20 hover:shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    />
  );
}
