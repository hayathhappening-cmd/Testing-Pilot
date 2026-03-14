import { ArtifactType, type Prisma, type User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { generateAiJson } from "../lib/openai";

const creditCosts: Record<string, number> = {
  generateTestCases: 10,
  generateAutomation: 8,
  analyzeBug: 5,
  generateTestData: 4,
  generateTestReport: 6,
  generateApiTests: 9,
  analyzeReleaseRisk: 7,
};

async function spendCredits(user: User, action: keyof typeof creditCosts, projectId?: string) {
  const cost = creditCosts[action];

  if (user.creditsBalance < cost) {
    throw new Error("Not enough credits remaining.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      creditsBalance: {
        decrement: cost,
      },
    },
  });

  await prisma.usageEvent.create({
    data: {
      userId: user.id,
      projectId,
      action,
      creditsUsed: cost,
    },
  });

  return cost;
}

async function storeArtifact({
  projectId,
  type,
  title,
  sourceName,
  inputText,
  outputText,
  outputJson,
}: {
  projectId?: string;
  type: ArtifactType;
  title: string;
  sourceName?: string;
  inputText?: string;
  outputText?: string;
  outputJson?: Prisma.InputJsonValue;
}) {
  if (!projectId) {
    return;
  }

  await prisma.projectArtifact.create({
    data: {
      projectId,
      type,
      title,
      sourceName,
      inputText,
      outputText,
      outputJson,
    },
  });
}

export async function generateTestCases({
  user,
  input,
  projectId,
  sourceName,
}: {
  user: User;
  input: string;
  projectId?: string;
  sourceName?: string;
}) {
  const fallback = {
    testCases: [
      {
        id: "TC-001",
        type: "Functional",
        scenario: "Validate primary happy path",
        steps: ["Open the target flow", "Submit valid inputs", "Confirm successful completion"],
        expectedResult: "Workflow completes successfully and data is stored.",
      },
      {
        id: "TC-002",
        type: "Edge",
        scenario: "Validate boundary value handling",
        steps: ["Enter minimum allowed value", "Enter maximum allowed value", "Submit both variants"],
        expectedResult: "Boundary values are processed without truncation or validation failure.",
      },
      {
        id: "TC-003",
        type: "Negative",
        scenario: "Validate invalid input rejection",
        steps: ["Enter invalid or missing input", "Submit form"],
        expectedResult: "System blocks submission and shows clear validation feedback.",
      },
      {
        id: "TC-004",
        type: "Security",
        scenario: "Validate unauthorized access prevention",
        steps: ["Attempt access without a valid session", "Call protected workflow"],
        expectedResult: "Request is rejected and protected data remains inaccessible.",
      },
    ],
  };

  const result = await generateAiJson({
    system:
      "You are a senior QA architect. Return JSON with key testCases. Each item must have id, type, scenario, steps, expectedResult.",
    prompt: `Generate structured test cases from the following requirement:\n\n${input}`,
    fallback,
  });

  const creditsUsed = await spendCredits(user, "generateTestCases", projectId);
  await storeArtifact({
    projectId,
    type: ArtifactType.TEST_CASES,
    title: "AI generated test cases",
    sourceName,
    inputText: input,
    outputJson: result as Prisma.InputJsonValue,
  });

  return { ...result, creditsUsed };
}

export async function generateAutomationScript({
  user,
  input,
  framework,
  projectId,
}: {
  user: User;
  input: string;
  framework: string;
  projectId?: string;
}) {
  const fallback = {
    framework,
    script:
      framework === "selenium"
        ? `from selenium import webdriver\n\ndef test_login_flow():\n    driver = webdriver.Chrome()\n    driver.get("https://example.com")\n    driver.find_element("id", "email").send_keys("qa@example.com")\n    driver.find_element("id", "submit").click()\n    assert "Dashboard" in driver.page_source`
        : framework === "cypress"
          ? `describe("login flow", () => {\n  it("logs the user in", () => {\n    cy.visit("https://example.com");\n    cy.get('[name=\"email\"]').type("qa@example.com");\n    cy.contains("button", "Submit").click();\n    cy.contains("Dashboard").should("be.visible");\n  });\n});`
          : `import { test, expect } from "@playwright/test";\n\ntest("login flow", async ({ page }) => {\n  await page.goto("https://example.com");\n  await page.getByLabel("Email").fill("qa@example.com");\n  await page.getByRole("button", { name: "Submit" }).click();\n  await expect(page.getByText("Dashboard")).toBeVisible();\n});`,
  };

  const result = await generateAiJson({
    system: "Return JSON with framework and script.",
    prompt: `Generate a ${framework} automation script for the following test case:\n\n${input}`,
    fallback,
  });

  const creditsUsed = await spendCredits(user, "generateAutomation", projectId);
  await storeArtifact({
    projectId,
    type: ArtifactType.AUTOMATION_SCRIPT,
    title: `${framework} automation script`,
    inputText: input,
    outputText: String(result.script),
    outputJson: result as Prisma.InputJsonValue,
  });

  return { ...result, creditsUsed };
}

export async function analyzeBug({
  user,
  input,
  projectId,
}: {
  user: User;
  input: string;
  projectId?: string;
}) {
  const fallback = {
    rootCause: "The issue is likely caused by missing null checks or environment-specific configuration drift.",
    affectedModule: "Application service or controller nearest the top stack frame",
    suggestedFix: "Validate input earlier, confirm deployment configuration, and add a regression test.",
  };

  const result = await generateAiJson({
    system: "Return JSON with rootCause, affectedModule, suggestedFix.",
    prompt: `Analyze these logs and identify the bug cause:\n\n${input}`,
    fallback,
  });

  const creditsUsed = await spendCredits(user, "analyzeBug", projectId);
  await storeArtifact({
    projectId,
    type: ArtifactType.BUG_ANALYSIS,
    title: "Bug analysis",
    inputText: input,
    outputJson: result as Prisma.InputJsonValue,
  });

  return { ...result, creditsUsed };
}

export async function generateTestData({
  user,
  prompt,
  recordCount,
  projectId,
}: {
  user: User;
  prompt: string;
  recordCount: number;
  projectId?: string;
}) {
  const fallback = {
    records: Array.from({ length: recordCount }).map((_, index) => ({
      name: index === recordCount - 1 ? "" : `QA User ${index + 1}`,
      email: index === recordCount - 1 ? "invalid-email" : `qa.user${index + 1}@example.com`,
      phone: index === recordCount - 1 ? "123" : `+1-415-555-01${String(index).padStart(2, "0")}`,
      address: index === recordCount - 1 ? "" : `${100 + index} Mission Street, San Francisco, CA`,
    })),
  };

  const result = await generateAiJson({
    system: "Return JSON with key records. Include realistic positive and edge data.",
    prompt: `Generate ${recordCount} QA data records for the following use case:\n\n${prompt}`,
    fallback,
  });

  const creditsUsed = await spendCredits(user, "generateTestData", projectId);
  await storeArtifact({
    projectId,
    type: ArtifactType.TEST_DATA,
    title: "Generated test data",
    inputText: prompt,
    outputJson: result as Prisma.InputJsonValue,
  });

  return { ...result, creditsUsed };
}

export async function generateTestReport({
  user,
  input,
  projectId,
}: {
  user: User;
  input: string;
  projectId?: string;
}) {
  const fallback = {
    summary: "Core QA execution is healthy with a few repeatable failures requiring follow-up.",
    passRate: "86%",
    criticalIssues: ["Validation failure in checkout flow", "Intermittent API timeout during order sync"],
    releaseRecommendation: "Proceed only after the failed scenarios are retested and blocking issues are closed.",
  };

  const result = await generateAiJson({
    system: "Return JSON with summary, passRate, criticalIssues, releaseRecommendation.",
    prompt: `Summarize the following QA results into an executive report:\n\n${input}`,
    fallback,
  });

  const creditsUsed = await spendCredits(user, "generateTestReport", projectId);
  await storeArtifact({
    projectId,
    type: ArtifactType.TEST_REPORT,
    title: "QA execution report",
    inputText: input,
    outputJson: result as Prisma.InputJsonValue,
  });

  return { ...result, creditsUsed };
}

export async function generateApiTests({
  user,
  input,
  projectId,
}: {
  user: User;
  input: string;
  projectId?: string;
}) {
  const fallback = {
    testCases: [
      {
        endpoint: "POST /orders",
        scenario: "Create order with valid payload",
        expectedResult: "Returns 201 Created with order id.",
      },
      {
        endpoint: "POST /orders",
        scenario: "Reject request with missing customer id",
        expectedResult: "Returns 400 with validation error.",
      },
    ],
    sampleRequests: [
      {
        method: "POST",
        endpoint: "/orders",
        body: {
          customerId: "cust_001",
          items: [{ sku: "SKU-100", quantity: 1 }],
        },
      },
    ],
  };

  const result = await generateAiJson({
    system: "Return JSON with testCases and sampleRequests based on the provided API spec.",
    prompt: `Generate API tests from the following OpenAPI or Swagger content:\n\n${input}`,
    fallback,
  });

  const creditsUsed = await spendCredits(user, "generateApiTests", projectId);
  await storeArtifact({
    projectId,
    type: ArtifactType.API_TESTS,
    title: "API test suite",
    inputText: input,
    outputJson: result as Prisma.InputJsonValue,
  });

  return { ...result, creditsUsed };
}

export async function analyzeReleaseRisk({
  user,
  input,
  projectId,
}: {
  user: User;
  input: string;
  projectId?: string;
}) {
  const fallback = {
    readinessScore: 72,
    riskLevel: "Medium",
    highRiskModules: ["Checkout", "Order synchronization"],
    recommendation: "Hold release until flaky tests are stabilized and module coverage improves.",
  };

  const result = await generateAiJson({
    system: "Return JSON with readinessScore, riskLevel, highRiskModules, recommendation.",
    prompt: `Analyze release risk using the following QA indicators:\n\n${input}`,
    fallback,
  });

  const creditsUsed = await spendCredits(user, "analyzeReleaseRisk", projectId);
  await storeArtifact({
    projectId,
    type: ArtifactType.RELEASE_RISK,
    title: "Release risk analysis",
    inputText: input,
    outputJson: result as Prisma.InputJsonValue,
  });

  return { ...result, creditsUsed };
}

export const creditsCatalog = creditCosts;

