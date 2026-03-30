import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Logo } from "../components/logo";
import { NavbarAuth } from "../components/navbar-auth";
import { ThemeToggle } from "../components/theme-toggle";
import { THEME_INIT_SCRIPT } from "../lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA Copilot - AI Co-Pilot for Test Engineers",
  description: "Production-ready AI SaaS for test generation, bug analysis, release risk, and QA automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body>
        <div className="mx-auto min-h-screen max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
          <header className="relative z-50 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-5 py-4">
            <Logo />

            <nav className="flex items-center gap-2">
              <Link className="rounded-full px-4 py-2 text-sm text-[var(--foreground)]/85 transition duration-200 hover:bg-[var(--surface-muted)]" href="/#features">
                Features
              </Link>
              <Link className="rounded-full px-4 py-2 text-sm text-[var(--foreground)]/85 transition duration-200 hover:bg-[var(--surface-muted)]" href="/#pricing">
                Pricing
              </Link>
              <NavbarAuth />
            </nav>
          </header>
          {children}
        </div>
        <ThemeToggle />
      </body>
    </html>
  );
}
