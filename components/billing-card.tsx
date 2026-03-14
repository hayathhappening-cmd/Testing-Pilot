"use client";

import { Button } from "@/components/button";

type Plan = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  creditsPerMonth: number;
};

export function BillingCard({ plan }: { plan: Plan }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{plan.name}</p>
          <p className="text-sm text-slate-300">{plan.creditsPerMonth} credits / month</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">${plan.priceMonthly}/mo</p>
          <Button
            className="mt-3"
            onClick={async () => {
              const response = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ planSlug: plan.slug }),
              });
              const data = await response.json();
              if (data.url) {
                window.location.href = data.url;
                return;
              }
              window.location.reload();
            }}
          >
            Choose plan
          </Button>
        </div>
      </div>
    </div>
  );
}

