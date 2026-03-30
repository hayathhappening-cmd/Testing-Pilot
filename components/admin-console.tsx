"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Clock3, CreditCard, Search, ShieldCheck, Users } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { StatusBadge } from "./status-badge";
import { apiRequest } from "../lib/client-api";
import { formatNumber } from "../lib/utils";

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
    usageEvents: Array<{
      id: string;
      action: string;
      creditsUsed: number;
      createdAt: string;
    }>;
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

type AdminUser = AdminOverview["users"][number];

type UsageLeader = AdminUser & {
  totalCreditsUsed: number;
  usageCount: number;
  lastUsageAt: string | null;
};

type SelectedAdminUser = AdminUser & {
  creditsUsed: number;
  actions: number;
  totalCreditsUsed: number;
  usageCount: number;
  lastUsageAt: string | null;
};

type OpenAiUsage = {
  usedTokens: number;
  remainingTokens: number | null;
  limit: number | null;
  usagePercent: number | null;
  requestCount: number;
  periodStart: string;
  periodEnd: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminConsole() {
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const [submittingUserId, setSubmittingUserId] = useState("");
  const [operationsUserId, setOperationsUserId] = useState("");
  const [operationsSearch, setOperationsSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<SelectedAdminUser | null>(null);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [openAiUsage, setOpenAiUsage] = useState<OpenAiUsage | null>(null);
  const [openAiUsageMessage, setOpenAiUsageMessage] = useState("");

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
      setCreditInputs((current) => {
        const next = { ...current };

        for (const userEntry of overview.users) {
          if (!(userEntry.id in next)) {
            next[userEntry.id] = "";
          }
        }

        return next;
      });
      const firstUserId = overview.users[0]?.id || "";
      setOperationsUserId((current) => current || firstUserId);

      try {
        const usageResponse = await apiRequest<{ usage: OpenAiUsage | null; message?: string }>("/admin/openai-usage");
        setOpenAiUsage(usageResponse.usage);
        setOpenAiUsageMessage(usageResponse.message || "");
      } catch (usageError) {
        setOpenAiUsage(null);
        setOpenAiUsageMessage(usageError instanceof Error ? usageError.message : "Failed to load OpenAI usage.");
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin data.");
      router.push("/login");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function moderateUser(userId: string, action: "approve" | "terminate") {
    await apiRequest(`/admin/users/${userId}/${action}`, { method: "POST" });
    await load();
  }

  async function assignCredits(event: FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();

    const creditsToAdd = Number(creditInputs[userId]);
    if (!Number.isInteger(creditsToAdd) || creditsToAdd <= 0) {
      setError("Enter a positive whole number of credits before assigning them.");
      return;
    }

    setSubmittingUserId(userId);
    setError("");

    try {
      await apiRequest(`/admin/users/${userId}/credits`, {
        method: "POST",
        body: JSON.stringify({ creditsToAdd }),
      });
      setCreditInputs((current) => ({ ...current, [userId]: "" }));
      await load();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Failed to assign credits.");
    } finally {
      setSubmittingUserId("");
    }
  }

  const usageLeaders = useMemo<UsageLeader[]>(() => {
    if (!data) {
      return [];
    }

    return [...data.users]
      .map((user) => {
        const totalCreditsUsed = user.usageEvents.reduce((sum, event) => sum + event.creditsUsed, 0);
        const lastUsageAt = user.usageEvents[0]?.createdAt ?? null;

        return {
          ...user,
          totalCreditsUsed,
          usageCount: user.usageEvents.length,
          lastUsageAt,
        };
      })
      .sort((left, right) => right.totalCreditsUsed - left.totalCreditsUsed);
  }, [data]);

  const filteredOperationsUsers = useMemo(() => {
    const query = operationsSearch.trim().toLowerCase();
    if (!query) {
      return usageLeaders;
    }

    return usageLeaders.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    );
  }, [operationsSearch, usageLeaders]);

  useEffect(() => {
    if (!filteredOperationsUsers.length) {
      setOperationsUserId("");
      return;
    }

    if (!filteredOperationsUsers.some((user) => user.id === operationsUserId)) {
      setOperationsUserId(filteredOperationsUsers[0].id);
    }
  }, [filteredOperationsUsers, operationsUserId]);

  useEffect(() => {
    let cancelled = false;

    if (!operationsUserId) {
      setSelectedUser(null);
      return;
    }

    setOperationsLoading(true);

    async function loadSelectedUser() {
      try {
        const response = await apiRequest<{
          user: AdminUser & {
            creditsUsed: number;
            actions: number;
          };
        }>(`/admin/users/${operationsUserId}`);

        if (cancelled) {
          return;
        }

        setSelectedUser({
          ...response.user,
          totalCreditsUsed: response.user.creditsUsed,
          usageCount: response.user.actions,
          lastUsageAt: response.user.usageEvents[0]?.createdAt ?? null,
        });
      } catch (loadSelectedUserError) {
        if (!cancelled) {
          setError(loadSelectedUserError instanceof Error ? loadSelectedUserError.message : "Failed to load selected user.");
          setSelectedUser(null);
        }
      } finally {
        if (!cancelled) {
          setOperationsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(() => {
      void loadSelectedUser();
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [operationsUserId]);

  if (error && !data) {
    return <p className="text-sm text-rose-200">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-slate-300">Loading admin console...</p>;
  }

  const statCards = [
    { label: "Registered users", value: data.stats.totalUsers, icon: Users },
    { label: "Pending approvals", value: data.stats.pendingUsers, icon: Activity },
    { label: "Approved users", value: data.stats.approvedUsers, icon: ShieldCheck },
    { label: "Credits consumed", value: data.stats.totalCreditsUsed, icon: CreditCard },
  ];

  return (
    <main className="space-y-8 pb-12">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.label} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.label}</p>
                <p className="mt-4 text-5xl font-semibold tracking-tight text-[var(--foreground)]">{formatNumber(item.value)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-3 text-[var(--accent)]">
                <item.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-6">
        <Card>
          <div className="flex flex-col gap-3 border-b border-[var(--surface-border)] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">User Operations</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">Approvals and credits</h2>
            </div>
            <div className="grid w-full max-w-3xl gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <label className="block flex-1">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Select User</span>
                <select
                  value={operationsUserId}
                  onChange={(event) => setOperationsUserId(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-[var(--surface-border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-cyan-300/50"
                >
                  {filteredOperationsUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Search user by name or email</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input
                    value={operationsSearch}
                    onChange={(event) => setOperationsSearch(event.target.value)}
                    placeholder="Search user by name or email"
                    className="h-11 pl-11 pr-4"
                  />
                </div>
              </label>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <div className="hidden grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.05fr)] gap-8 px-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted-foreground)] xl:grid">
              <span>User info</span>
              <span>Plan and credits</span>
              <span>Usage and actions</span>
            </div>

            {operationsLoading ? (
              <div className="grid gap-6 rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-muted)] p-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-8">
                <div className="space-y-4 xl:border-r xl:border-[var(--surface-border)] xl:pr-8">
                  <div className="h-8 w-48 animate-pulse rounded-xl bg-black/5 dark:bg-white/10" />
                  <div className="h-5 w-56 animate-pulse rounded-xl bg-black/5 dark:bg-white/10" />
                  <div className="h-24 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                </div>
                <div className="h-[176px] animate-pulse rounded-[22px] bg-black/5 dark:bg-white/10" />
                <div className="space-y-5 xl:border-l xl:border-[var(--surface-border)] xl:pl-8">
                  <div className="h-[132px] animate-pulse rounded-[22px] bg-black/5 dark:bg-white/10" />
                  <div className="h-11 w-60 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                </div>
              </div>
            ) : selectedUser ? (
              <div
                key={selectedUser.id}
                className="rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface-muted)] p-6 transition duration-300 ease-out"
              >
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-8">
                  <div className="min-w-0 xl:border-r xl:border-[var(--surface-border)] xl:pr-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[1.35rem] font-bold leading-tight text-[var(--foreground)]">{selectedUser.name}</p>
                        <p className="mt-2 truncate text-sm text-[var(--muted-foreground)]">{selectedUser.email}</p>
                      </div>
                      <StatusBadge status={selectedUser.approvalStatus === "REJECTED" ? "terminated" : selectedUser.approvalStatus} />
                    </div>
                    <div className="mt-5 space-y-2 text-sm text-[var(--muted-foreground)]">
                      <p>
                        Joined <span className="ml-2 text-[var(--foreground)]">{formatDate(selectedUser.createdAt)}</span>
                      </p>
                      <p>
                        Status <span className="ml-2 text-[var(--foreground)]">{selectedUser.approvalStatus === "REJECTED" ? "terminated" : selectedUser.approvalStatus.replaceAll("_", " ").toLowerCase()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-5 py-5 xl:min-h-[176px]">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      <CreditCard className="h-4 w-4 text-[var(--accent)]" />
                      <span>Plan and credits</span>
                    </div>
                    <div className="mt-5">
                      <p className="text-sm text-[var(--foreground)]">{selectedUser.subscription?.plan.name || "No plan"}</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{selectedUser.subscription?.status || "No subscription status"}</p>
                    </div>
                    <div className="mt-6">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Available balance</p>
                      <p className="mt-2 text-5xl font-bold leading-none tracking-tight text-[var(--foreground)]">{formatNumber(selectedUser.creditsBalance)}</p>
                    </div>
                    <form
                      id={`assign-credits-${selectedUser.id}`}
                      className="mt-6 space-y-3"
                      onSubmit={(event) => void assignCredits(event, selectedUser.id)}
                    >
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={creditInputs[selectedUser.id] ?? ""}
                        onChange={(event) =>
                          setCreditInputs((current) => ({
                            ...current,
                            [selectedUser.id]: event.target.value,
                          }))
                        }
                        placeholder="Add credits"
                        className="h-11 px-4 py-2"
                      />
                      <Button
                        type="submit"
                        disabled={submittingUserId === selectedUser.id}
                        variant="secondary"
                        className="h-11 w-full justify-center px-5"
                      >
                        {submittingUserId === selectedUser.id ? "Saving..." : "Assign"}
                      </Button>
                    </form>
                  </div>

                  <div className="min-w-0 space-y-5 xl:border-l xl:border-[var(--surface-border)] xl:pl-8">
                    <div className="rounded-[20px] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-5 py-5">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                        <Activity className="h-4 w-4 text-[var(--accent)]" />
                        <span>Usage</span>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-[var(--muted-foreground)]">Used</p>
                          <p className="mt-2 text-4xl font-bold leading-none tracking-tight text-[var(--foreground)]">{formatNumber(selectedUser.totalCreditsUsed)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[var(--muted-foreground)]">Actions</p>
                          <p className="mt-2 text-4xl font-bold leading-none tracking-tight text-[var(--foreground)]">{formatNumber(selectedUser.usageCount)}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                        <span>{selectedUser.lastUsageAt ? formatDate(selectedUser.lastUsageAt) : "No activity yet"}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {selectedUser.approvalStatus === "APPROVED" ? (
                        <Button
                          variant="danger"
                          onClick={() => moderateUser(selectedUser.id, "terminate")}
                          className="h-11 min-w-[132px] px-5"
                        >
                          Terminate
                        </Button>
                      ) : (
                        <Button onClick={() => moderateUser(selectedUser.id, "approve")} className="h-11 min-w-[132px] px-5">
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredOperationsUsers.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-white/10 bg-white/[0.025] px-6 py-10 text-center">
                <p className="text-base font-medium text-white">No users match your search.</p>
                <p className="mt-2 text-sm text-slate-400">Try a different name or email to load a user profile.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No users available.</p>
            )}
          </div>
        </Card>

        <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(15,23,42,0.94))]">
          <div className="border-b border-white/6 pb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">OpenAI Usage</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">API token telemetry</h2>
          </div>

          {openAiUsage ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.7fr))]">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Usage overview</p>
                <p className="mt-3 text-3xl font-bold text-white">{formatNumber(openAiUsage.usedTokens)} tokens used</p>
                <p className="mt-2 text-sm text-slate-400">
                  Period: {new Date(openAiUsage.periodStart).toLocaleString("en-IN", { month: "short", year: "numeric" })}
                </p>
                {openAiUsage.limit ? (
                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>{formatNumber(openAiUsage.remainingTokens ?? 0)} remaining</span>
                      <span>{formatNumber(openAiUsage.limit)} limit</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(103,232,249,0.9),rgba(45,212,191,0.9))] transition-[width] duration-300 ease-out"
                        style={{ width: `${openAiUsage.usagePercent ?? 0}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{openAiUsage.usagePercent ?? 0}% of configured token capacity used</p>
                  </div>
                ) : (
                  <p className="mt-5 text-xs leading-5 text-slate-400">
                    Add `OPENAI_USAGE_TOKEN_LIMIT` if you also want remaining capacity and progress tracking.
                  </p>
                )}
              </div>

              <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Used</p>
                <p className="mt-3 text-3xl font-bold text-white">{formatNumber(openAiUsage.usedTokens)}</p>
              </div>

              <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Requests</p>
                <p className="mt-3 text-3xl font-bold text-white">{formatNumber(openAiUsage.requestCount)}</p>
              </div>

              <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Configured limit</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {openAiUsage.limit ? formatNumber(openAiUsage.limit) : "N/A"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[22px] border border-dashed border-white/10 bg-white/[0.025] px-6 py-10">
              <p className="text-base font-medium text-white">OpenAI usage is unavailable.</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {openAiUsageMessage || "Configure OPENAI_ADMIN_API_KEY and OPENAI_USAGE_API_KEY_ID to load real API key usage."}
              </p>
            </div>
          )}
        </Card>

      </section>
    </main>
  );
}
