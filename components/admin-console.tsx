"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Card } from "./card";
import { LogoutButton } from "./logout-button";
import { StatusBadge } from "./status-badge";
import { apiRequest } from "../lib/client-api";

type AdminOverview = {
  stats: {
    totalUsers: number;
    pendingUsers: number;
    approvedUsers: number;
    totalCreditsUsed: number;
  };
  usageBreakdown: Record<string, number>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    approvalStatus: string;
    creditsBalance: number;
    subscription: { status: string; plan: { name: string } } | null;
    createdAt: string;
  }>;
  plans: Array<{
    id: string;
    name: string;
    slug: string;
    priceMonthly: number;
    creditsPerMonth: number;
    description: string;
    features: string[];
  }>;
};

export function AdminConsole() {
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [{ user }, overview] = await Promise.all([
        apiRequest<{ user: { role: string } }>("/auth/me"),
        apiRequest<AdminOverview>("/admin/overview"),
      ]);

      if (user.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }

      setData(overview);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin data.");
      router.push("/login");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function moderateUser(userId: string, action: "approve" | "reject") {
    await apiRequest(`/admin/users/${userId}/${action}`, { method: "POST" });
    await load();
  }

  if (error && !data) {
    return <p className="text-sm text-rose-200">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-slate-300">Loading admin console...</p>;
  }

  return (
    <main className="space-y-6 pb-12">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Registered users", value: data.stats.totalUsers },
          { label: "Pending approvals", value: data.stats.pendingUsers },
          { label: "Approved users", value: data.stats.approvedUsers },
          { label: "Credits consumed", value: data.stats.totalCreditsUsed },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-slate-300">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <div className="mb-5 flex items-start justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Admin Dashboard</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-white">User management and analytics</h1>
              <LogoutButton />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Approval</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Credits</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={user.approvalStatus} />
                    </td>
                    <td className="py-4">
                      <p>{user.subscription?.plan.name || "No plan"}</p>
                      <p className="text-xs text-slate-400">{user.subscription?.status || "n/a"}</p>
                    </td>
                    <td className="py-4">{user.creditsBalance}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => moderateUser(user.id, "approve")}>Approve</Button>
                        <Button variant="danger" onClick={() => moderateUser(user.id, "reject")}>
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Subscription plans</p>
            <div className="mt-4 space-y-4">
              {data.plans.map((plan) => (
                <div key={plan.id} className="rounded-3xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-white">{plan.name}</p>
                    <p className="text-sm text-slate-300">${plan.priceMonthly}/mo</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
                  <p className="mt-2 text-sm text-cyan-100">{plan.creditsPerMonth} credits</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Platform analytics</p>
            <div className="mt-4 space-y-3">
              {Object.entries(data.usageBreakdown).map(([action, total]) => (
                <div key={action} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
                  <span className="text-slate-300">{action}</span>
                  <span className="font-semibold text-white">{total} credits</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
