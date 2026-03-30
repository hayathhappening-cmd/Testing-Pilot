import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "../components/button";
import { Reveal } from "../components/reveal";

const trustIndicators = ["Teams shipping weekly", "QA leaders standardizing workflows", "Secure admin approval controls", "Built for production rollouts"];

const featureList = [
  {
    title: "Requirement-to-test generation",
    text: "Turn requirements into structured coverage in minutes.",
    icon: Sparkles,
  },
  {
    title: "Automation acceleration",
    text: "Generate Selenium, Playwright, Cypress, and API-ready assets fast.",
    icon: ClipboardCheck,
  },
  {
    title: "Release confidence",
    text: "Bring defects, risk signals, and outputs into one release view.",
    icon: Gauge,
  },
  {
    title: "Governed collaboration",
    text: "Keep approvals, workspaces, and teams aligned without sprawl.",
    icon: ShieldCheck,
  },
];

const useCases = [
  {
    title: "For QA Engineers",
    text: "Move from requirements to credible test coverage faster, without losing structure or depth.",
  },
  {
    title: "For QA Leads",
    text: "Standardize outputs, guide release readiness, and reduce review overhead across the team.",
  },
  {
    title: "For Teams",
    text: "Give product, engineering, and QA one operating system for quality decisions and artifacts.",
  },
];

const testimonials = [
  {
    quote: "QA Copilot gave our team a cleaner path from requirement review to release sign-off.",
    author: "Riya Malhotra",
    role: "QA Lead, Fintech Platform",
  },
  {
    quote: "We cut manual planning time and got more consistent outputs across engineers almost immediately.",
    author: "Daniel Brooks",
    role: "Head of Quality, B2B SaaS",
  },
];

const metrics = [
  { label: "Faster planning cycles", value: "3x" },
  { label: "Core QA workflows", value: "8+" },
  { label: "Shared team workspace", value: "1" },
];

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "For individual QA engineers building stronger coverage faster.",
    bullets: ["250 credits", "Test cases and bug analysis", "Essential QA workflows"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$79",
    description: "For teams who want speed, consistency, and better release confidence.",
    bullets: ["1000 credits", "Automation and API coverage", "Team-ready workflow standardization"],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "$199",
    description: "For organizations running quality operations across projects and teams.",
    bullets: ["4000 credits", "Admin controls and analytics", "Multi-project QA governance"],
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1100px] space-y-[128px] pb-24 pt-10">
      <section className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:pt-14">
        <div className="relative space-y-8">
          <div className="pointer-events-none absolute -left-10 top-6 h-44 w-44 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="hero-enter inline-flex rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
            AI operating system for modern QA
          </div>
          <div className="hero-enter hero-enter-delay-1 relative space-y-5">
            <h1 className="max-w-3xl text-[3.2rem] font-semibold leading-[0.96] tracking-[-0.055em] text-[var(--foreground)] sm:text-[4.1rem]">
              Quality work that feels fast, structured, and <span className="text-[var(--accent)]">ready to ship</span>.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
              QA Copilot turns requirements, bugs, and release signals into clear testing outputs so teams can move faster with confidence.
            </p>
          </div>
          <div className="hero-enter hero-enter-delay-2 flex flex-wrap gap-4">
            <Link href="/register">
              <div className="rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.18)]">
                <Button className="min-w-[210px]">
                  <Sparkles className="h-4 w-4" />
                  Start free trial
                </Button>
              </div>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="min-w-[160px]">
                Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6 pt-3">
          <div className="hero-visual relative overflow-hidden rounded-[28px] border border-[var(--surface-border)] bg-[linear-gradient(180deg,var(--surface-elevated),var(--surface-muted))] p-6 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--accent)]/12 blur-3xl" />
            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface-muted)] p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">Preview</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">Release view</h3>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Coverage</p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">92%</p>
                  </div>
                  <div className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Risk</p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">Low</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ["Structured outputs", "Reusable QA assets, not raw text."],
                  ["Release readiness", "Signals, actions, and progress in one view."],
                  ["Team controls", "Approvals and usage governance built in."],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-4 py-4 transition duration-300 hover:scale-[1.01]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/88">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-enter hero-enter-delay-2 space-y-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              What teams rely on
            </p>
            {[
              "Generate structured test cases from real requirement documents",
              "Accelerate automation and API coverage without losing QA rigor",
              "Track release readiness with clearer signals and less operational noise",
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3" style={{ animationDelay: `${index * 70}ms` }}>
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" />
                <p className="text-sm leading-7 text-[var(--foreground)]/88">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reveal>
        <section className="rounded-[32px] border border-[var(--surface-border)] bg-[linear-gradient(135deg,rgba(20,184,166,0.1),rgba(15,23,42,0.03))] px-8 py-14 text-center shadow-[0_0_0_1px_rgba(20,184,166,0.06),var(--shadow-soft)]">
          <p className="mx-auto max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
            Better QA does not come from more tools. It comes from a clearer operating system.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="space-y-6">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--muted-foreground)]">
          Trusted by quality-focused teams building serious products
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 border-y border-[var(--surface-border)] py-6 text-sm font-medium text-[var(--muted-foreground)]">
          {trustIndicators.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Core value</p>
          <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            One calm workspace for planning, execution, and release confidence.
          </h2>
          <p className="max-w-xl text-base leading-8 text-[var(--muted-foreground)]">
            Instead of jumping between test generators, spreadsheets, bug notes, and release docs, QA Copilot keeps the quality workflow in one place with stronger structure and clearer decisions.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-soft)] transition duration-300 hover:scale-[1.01]">
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-muted)] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Live workspace</p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Release readiness at a glance</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                Quality teams see credits, actions, recent outputs, and workflow status without hunting across disconnected tools.
              </p>
            </div>
            <div className="space-y-4">
              {[
                ["Coverage quality", "Structured, reusable outputs"],
                ["Operations", "Admin approvals and usage controls"],
                ["Team speed", "Less manual planning overhead"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-4 transition duration-300 hover:scale-[1.01]">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-2 text-base font-medium text-[var(--foreground)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="space-y-8" id="features">
        <div className="space-y-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Features</p>
          <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Built for the parts of QA that actually slow teams down.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featureList.map((feature, index) => (
            <div key={feature.title} className="group flex items-start gap-4 rounded-[20px] border border-transparent px-2 py-2 transition duration-300 hover:border-[var(--surface-border)] hover:bg-[var(--surface-muted)]/55" style={{ transitionDelay: `${index * 45}ms` }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] text-[var(--accent)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-soft)]">
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{feature.title}</h3>
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="grid gap-8 lg:grid-cols-3">
        {useCases.map((item, index) => (
          <div key={item.title} className="space-y-3" style={{ transitionDelay: `${index * 60}ms` }}>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--muted-foreground)]">{item.title}</p>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {item.title === "For QA Engineers"
                ? "Create better coverage with less setup."
                : item.title === "For QA Leads"
                  ? "Drive consistency without slowing the team down."
                  : "Keep quality operations aligned as you scale."}
            </p>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">{item.text}</p>
          </div>
        ))}
        </section>
      </Reveal>

      <Reveal>
        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Social proof</p>
          <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Clearer workflows create faster, more confident teams.
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <p className="text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{metric.value}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {testimonials.map((item, index) => (
            <div key={item.author} className="border-l-2 border-[var(--surface-border)] pl-5" style={{ transitionDelay: `${index * 70}ms` }}>
              <p className="text-lg leading-8 text-[var(--foreground)]">"{item.quote}"</p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">{item.author}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="pricing" className="space-y-10">
        <div className="space-y-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Pricing</p>
          <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Three plans. One disciplined QA platform.
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              style={{ transitionDelay: `${index * 60}ms` }}
              className={`rounded-[24px] border p-6 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:scale-[1.015] ${
                plan.highlighted
                  ? "scale-[1.02] border-[var(--accent)] bg-[var(--surface-elevated)] ring-1 ring-[var(--accent)]/45 shadow-[0_0_0_1px_rgba(20,184,166,0.1),0_22px_54px_rgba(20,184,166,0.18)]"
                  : "border-[var(--surface-border)] bg-[var(--surface-elevated)]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--muted-foreground)]">{plan.name}</p>
                  {plan.highlighted ? (
                    <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{plan.price}</span>
                  <span className="pb-2 text-sm text-[var(--muted-foreground)]">/ month</span>
                </div>
                <p className="text-sm leading-7 text-[var(--muted-foreground)]">{plan.description}</p>
                <div className="space-y-3 pt-2">
                  {plan.bullets.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                      <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/register" className="mt-8 block">
                <Button variant={plan.highlighted ? "primary" : "secondary"} className="w-full">
                  Choose {plan.name}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="rounded-[32px] border border-[var(--surface-border)] bg-[linear-gradient(180deg,var(--surface-elevated),var(--surface-muted))] px-8 py-14 text-center shadow-[var(--shadow-soft)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Ready to upgrade QA operations?</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          Give your team a faster path from quality signals to confident releases.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button className="min-w-[230px]">
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        </section>
      </Reveal>
    </main>
  );
}
