import Link from "next/link";
import { Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "../components/button";
import { Card } from "../components/card";

const plans = [
  {
    name: "Starter",
    price: "$29",
    credits: "250 credits",
    description: "For solo QA engineers validating requirements and writing better tests.",
    features: ["Requirement to test cases", "Bug analyzer", "Test data generation"],
  },
  {
    name: "Growth",
    price: "$79",
    credits: "1000 credits",
    description: "For QA teams accelerating automation and release confidence.",
    features: ["All Starter features", "API test generation", "Release risk analyzer"],
  },
  {
    name: "Scale",
    price: "$199",
    credits: "4000 credits",
    description: "For organizations managing multiple projects and QA programs at scale.",
    features: ["All Growth features", "Project workspaces", "Platform analytics"],
  },
];

const features = [
  {
    title: "AI requirement to test generation",
    text: "Upload PRDs, BRDs, PDF, DOCX, TXT, or paste text to generate functional, edge, negative, and security scenarios.",
    icon: Sparkles,
  },
  {
    title: "Automation and API acceleration",
    text: "Turn test ideas into Selenium, Cypress, Playwright, and API test assets with one workflow.",
    icon: Zap,
  },
  {
    title: "Risk-aware QA operations",
    text: "Use bug analysis, release risk scoring, project history, and admin analytics to guide ship decisions.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="space-y-12 pb-12">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100">
            Production-ready AI QA SaaS
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              QA Copilot helps test engineers turn requirements, bugs, and risk signals into action.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Generate structured test cases, automation scripts, test data, API suites, release risk analysis, and polished QA reports from a single AI-native platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <Button>Start Free Trial</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-3xl font-semibold text-white">8+</p>
              <p className="mt-2 text-sm text-slate-300">Core QA workflows with AI assistance</p>
            </Card>
            <Card>
              <p className="text-3xl font-semibold text-white">RBAC</p>
              <p className="mt-2 text-sm text-slate-300">JWT auth with admin approval and workspace controls</p>
            </Card>
            <Card>
              <p className="text-3xl font-semibold text-white">Docker</p>
              <p className="mt-2 text-sm text-slate-300">Deployment-ready with PostgreSQL, Express, and Next.js</p>
            </Card>
          </div>
        </div>

        <Card className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(45,212,191,0.15),rgba(15,23,42,0.7))]">
          <div className="space-y-4">
            {[
              "Generate AI test cases from uploaded PDF, DOCX, and TXT requirements",
              "Produce Selenium, Playwright, and Cypress scripts from plain English",
              "Analyze bugs, generate reports, and score release readiness",
              "Track projects, credits, subscriptions, and QA activity in one place",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <Check className="mt-1 h-4 w-4 text-cyan-300" />
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="features" className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <feature.icon className="h-10 w-10 rounded-2xl bg-cyan-300/10 p-2 text-cyan-200" />
            <h2 className="mt-5 text-2xl font-semibold text-white">{feature.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{feature.text}</p>
          </Card>
        ))}
      </section>

      <section id="pricing" className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Pricing</p>
          <h2 className="text-4xl font-semibold text-white">Plans built for modern QA teams.</h2>
          <p className="max-w-2xl text-slate-300">
            Every plan includes role-based access, project workspaces, usage tracking, and Stripe-ready subscriptions.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex h-full flex-col justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">{plan.name}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-semibold text-white">{plan.price}</span>
                  <span className="pb-2 text-sm text-slate-400">/ month</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{plan.description}</p>
                <p className="mt-4 text-sm text-slate-200">{plan.credits}</p>
                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                      <Check className="h-4 w-4 text-cyan-300" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/register" className="mt-8">
                <Button className="w-full" variant={plan.name === "Growth" ? "primary" : "secondary"}>
                  Choose {plan.name}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

