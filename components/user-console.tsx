"use client";

import * as XLSX from "xlsx";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Card } from "./card";
import { Input, Textarea } from "./input";
import { LogoutButton } from "./logout-button";
import { apiRequest } from "../lib/client-api";

type OverviewPayload = {
  user: {
    id: string;
    name: string;
    role: string;
    creditsBalance: number;
    subscription: {
      status: string;
      plan: {
        name: string;
        priceMonthly: number;
        creditsPerMonth: number;
      };
    } | null;
    usageEvents: Array<{
      id: string;
      action: string;
      creditsUsed: number;
      createdAt: string;
    }>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    creditsUsed: number;
    createdAt: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    artifacts?: Array<{ id: string; title: string; type: string }>;
  }>;
  creditCatalog: Record<string, number>;
  modules: string[];
};

const sections = [
  "Dashboard Overview",
  "Generate Test Cases",
  "Automation Script Generator",
  "Bug Analyzer",
  "Test Data Generator",
  "Test Report Generator",
  "API Test Generator",
  "Release Risk Analyzer",
  "Settings",
] as const;

function exportJsonFile(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportSpreadsheet(rows: Record<string, string>[], filename: string, format: "csv" | "xlsx") {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Results");
  XLSX.writeFile(workbook, `${filename}.${format}`, { bookType: format });
}

export function UserConsole() {
  const router = useRouter();
  const [section, setSection] = useState<(typeof sections)[number]>("Dashboard Overview");
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [requirementText, setRequirementText] = useState("");
  const [requirementFile, setRequirementFile] = useState<File | null>(null);
  const [automationText, setAutomationText] = useState("");
  const [automationFramework, setAutomationFramework] = useState("playwright");
  const [bugInput, setBugInput] = useState("");
  const [testDataPrompt, setTestDataPrompt] = useState("");
  const [recordCount, setRecordCount] = useState("5");
  const [reportText, setReportText] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [apiSpecText, setApiSpecText] = useState("");
  const [apiFile, setApiFile] = useState<File | null>(null);
  const [releaseRiskText, setReleaseRiskText] = useState("");

  const exportedTestCases = useMemo(() => {
    if (
      result &&
      typeof result === "object" &&
      "testCases" in result &&
      Array.isArray((result as { testCases: unknown[] }).testCases)
    ) {
      return (result as { testCases: Array<Record<string, string>> }).testCases.map((row) => ({
        "Test Case ID": row.id,
        Scenario: row.scenario,
        Steps: Array.isArray(row.steps) ? row.steps.join(" | ") : String(row.steps || ""),
        "Expected Result": row.expectedResult,
        Type: row.type,
      }));
    }

    return [];
  }, [result]);

  async function loadOverview() {
    try {
      const data = await apiRequest<OverviewPayload>("/dashboard/overview");
      setOverview(data);
      setSelectedProjectId((current) => current || data.projects[0]?.id || "");
    } catch {
      router.push("/login");
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  async function createProject() {
    if (!projectName) {
      return;
    }

    await apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify({
        name: projectName,
        description: projectDescription,
      }),
    });
    setProjectName("");
    setProjectDescription("");
    await loadOverview();
  }

  async function sendMultipart(path: string, fields: Record<string, string>, file?: File | null) {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    if (file) {
      formData.append("file", file);
    }

    return apiRequest(path, {
      method: "POST",
      body: formData,
    });
  }

  async function runAction(action: () => Promise<unknown>) {
    setLoading(true);
    setMessage("");
    try {
      const data = await action();
      setResult(data);
      await loadOverview();
      setMessage("AI action completed successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!overview) {
    return <p className="text-sm text-slate-300">Loading workspace...</p>;
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[280px_1fr] pb-12">
      <aside className="space-y-6">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">QA Copilot</h1>
          <p className="mt-2 text-sm text-slate-300">
            Plan: {overview.user.subscription?.plan.name || "Starter"}
          </p>
          <p className="text-sm text-slate-300">Credits left: {overview.user.creditsBalance}</p>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </Card>

        <Card className="space-y-2">
          {sections.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${
                section === item ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </Card>

        <Card>
          <p className="text-sm font-semibold text-white">Projects</p>
          <div className="mt-4 space-y-3">
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-sm text-white"
            >
              {overview.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <Input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="New project name"
            />
            <Textarea
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
              placeholder="Project description"
            />
            <Button onClick={createProject}>Create project</Button>
          </div>
        </Card>
      </aside>

      <section className="space-y-6">
        {section === "Dashboard Overview" ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <p className="text-sm text-slate-300">User plan</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {overview.user.subscription?.plan.name || "Starter"}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-slate-300">AI credits usage</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {(overview.user.subscription?.plan.creditsPerMonth || 250) - overview.user.creditsBalance}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-slate-300">Subscription status</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {overview.user.subscription?.status || "pending_approval"}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-slate-300">Recent AI activity</p>
                <p className="mt-2 text-2xl font-semibold text-white">{overview.recentActivity.length}</p>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Recent activity</p>
                <div className="mt-4 space-y-3">
                  {overview.recentActivity.map((activity) => (
                    <div key={activity.id} className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="font-medium text-white">{activity.action}</p>
                      <p className="text-sm text-slate-300">
                        {activity.creditsUsed} credits used on{" "}
                        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
                          new Date(activity.createdAt),
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Bonus AI modules</p>
                <div className="mt-4 space-y-3">
                  {overview.modules.map((module) => (
                    <div key={module} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                      {module}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : null}

        {section === "Generate Test Cases" ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Requirement to Test Case Generator</h2>
            <Input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setRequirementFile(e.target.files?.[0] || null)} />
            <Textarea
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              placeholder="Paste requirement text here..."
            />
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  runAction(() =>
                    sendMultipart(
                      "/ai/test-cases",
                      { content: requirementText, projectId: selectedProjectId },
                      requirementFile,
                    ),
                  )
                }
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate test cases"}
              </Button>
              <Button variant="secondary" onClick={() => exportSpreadsheet(exportedTestCases, "qa-copilot-test-cases", "csv")} disabled={!exportedTestCases.length}>
                Export CSV
              </Button>
              <Button variant="secondary" onClick={() => exportSpreadsheet(exportedTestCases, "qa-copilot-test-cases", "xlsx")} disabled={!exportedTestCases.length}>
                Export Excel
              </Button>
              <Button variant="secondary" onClick={() => exportJsonFile(result, "qa-copilot-test-cases.json")} disabled={!result}>
                Export JSON
              </Button>
            </div>
          </Card>
        ) : null}

        {section === "Automation Script Generator" ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Automation Script Generator</h2>
            <select
              value={automationFramework}
              onChange={(event) => setAutomationFramework(event.target.value)}
              className="rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-sm text-white"
            >
              <option value="selenium">Selenium (Python)</option>
              <option value="playwright">Playwright</option>
              <option value="cypress">Cypress</option>
            </select>
            <Textarea
              value={automationText}
              onChange={(event) => setAutomationText(event.target.value)}
              placeholder="Enter the manual test case description..."
            />
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  runAction(() =>
                    apiRequest("/ai/automation", {
                      method: "POST",
                      body: JSON.stringify({
                        content: automationText,
                        framework: automationFramework,
                        projectId: selectedProjectId,
                      }),
                    }),
                  )
                }
                disabled={loading}
              >
                Generate script
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  navigator.clipboard.writeText(
                    typeof result === "object" && result && "script" in result
                      ? String((result as { script: string }).script)
                      : "",
                  )
                }
              >
                Copy to clipboard
              </Button>
            </div>
          </Card>
        ) : null}

        {section === "Bug Analyzer" ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Bug Analyzer</h2>
            <Textarea
              value={bugInput}
              onChange={(event) => setBugInput(event.target.value)}
              placeholder="Paste stack trace, error logs, or screenshot description..."
            />
            <Button
              onClick={() =>
                runAction(() =>
                  apiRequest("/ai/bug-analyzer", {
                    method: "POST",
                    body: JSON.stringify({ content: bugInput, projectId: selectedProjectId }),
                  }),
                )
              }
            >
              Analyze bug
            </Button>
          </Card>
        ) : null}

        {section === "Test Data Generator" ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Test Data Generator</h2>
            <Input value={recordCount} onChange={(event) => setRecordCount(event.target.value)} placeholder="Number of records" />
            <Textarea
              value={testDataPrompt}
              onChange={(event) => setTestDataPrompt(event.target.value)}
              placeholder="Describe the records you need..."
            />
            <Button
              onClick={() =>
                runAction(() =>
                  apiRequest("/ai/test-data", {
                    method: "POST",
                    body: JSON.stringify({
                      prompt: testDataPrompt,
                      recordCount: Number(recordCount || 5),
                      projectId: selectedProjectId,
                    }),
                  }),
                )
              }
            >
              Generate test data
            </Button>
          </Card>
        ) : null}

        {section === "Test Report Generator" ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Test Report Generator</h2>
            <Input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setReportFile(e.target.files?.[0] || null)} />
            <Textarea
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              placeholder="Paste raw test execution results..."
            />
            <Button
              onClick={() =>
                runAction(() =>
                  sendMultipart(
                    "/ai/test-report",
                    { content: reportText, projectId: selectedProjectId },
                    reportFile,
                  ),
                )
              }
            >
              Generate report
            </Button>
          </Card>
        ) : null}

        {section === "API Test Generator" ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">API Test Generator</h2>
            <Input type="file" accept=".json,.txt,.yaml,.yml" onChange={(e) => setApiFile(e.target.files?.[0] || null)} />
            <Textarea
              value={apiSpecText}
              onChange={(event) => setApiSpecText(event.target.value)}
              placeholder="Paste Swagger or OpenAPI content..."
            />
            <Button
              onClick={() =>
                runAction(() =>
                  sendMultipart(
                    "/ai/api-tests",
                    { content: apiSpecText, projectId: selectedProjectId },
                    apiFile,
                  ),
                )
              }
            >
              Generate API tests
            </Button>
          </Card>
        ) : null}

        {section === "Release Risk Analyzer" ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Release Risk Analyzer</h2>
            <Textarea
              value={releaseRiskText}
              onChange={(event) => setReleaseRiskText(event.target.value)}
              placeholder="Paste test results, bug counts, and module coverage..."
            />
            <Button
              onClick={() =>
                runAction(() =>
                  apiRequest("/ai/release-risk", {
                    method: "POST",
                    body: JSON.stringify({ content: releaseRiskText, projectId: selectedProjectId }),
                  }),
                )
              }
            >
              Analyze release risk
            </Button>
          </Card>
        ) : null}

        {section === "Settings" ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Settings</h2>
            <p className="text-sm text-slate-300">
              Role: {overview.user.role}. Current plan: {overview.user.subscription?.plan.name || "Starter"}.
            </p>
            <p className="text-sm text-slate-300">
              Credits catalog: {Object.entries(overview.creditCatalog).map(([key, value]) => `${key} (${value})`).join(", ")}
            </p>
          </Card>
        ) : null}

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">AI Result</h3>
              <p className="text-sm text-slate-300">Generated output, recommendations, and exports appear here.</p>
            </div>
          </div>
          {message ? <p className="mb-4 text-sm text-cyan-100">{message}</p> : null}
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-3xl bg-slate-950/60 p-5 text-sm leading-7 text-slate-100">
            {result ? JSON.stringify(result, null, 2) : "Your generated output will appear here."}
          </pre>
        </Card>
      </section>
    </main>
  );
}
