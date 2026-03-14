import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-slate-950">
                QA
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">QA Copilot</p>
                <p className="text-sm text-slate-300">AI Co-Pilot for Test Engineers</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              <Link className="rounded-full px-4 py-2 text-sm text-slate-200 hover:bg-white/5" href="/#features">
                Features
              </Link>
              <Link className="rounded-full px-4 py-2 text-sm text-slate-200 hover:bg-white/5" href="/#pricing">
                Pricing
              </Link>
              <Link className="rounded-full px-4 py-2 text-sm text-slate-200 hover:bg-white/5" href="/login">
                Login
              </Link>
              <Link className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" href="/register">
                Register
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

