import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { parseUploadedFile } from "../lib/file-parser";
import { requireApprovedUser, requireAuth } from "../middleware/auth";
import {
  analyzeBug,
  analyzeReleaseRisk,
  generateApiTests,
  generateAutomationScript,
  generateTestCases,
  generateTestData,
  generateTestReport,
} from "../services/ai";

const upload = multer({
  storage: multer.memoryStorage(),
});

export const aiRouter = Router();

aiRouter.use(requireAuth, requireApprovedUser);

async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

aiRouter.post("/test-cases", upload.single("file"), async (request, response) => {
  const content = (await parseUploadedFile(request.file)) || String(request.body.content || "");
  const user = await getUser(request.auth!.userId);
  const result = await generateTestCases({
    user,
    input: content,
    projectId: request.body.projectId,
    sourceName: request.file?.originalname,
  });
  response.json(result);
});

aiRouter.post("/automation", async (request, response) => {
  const user = await getUser(request.auth!.userId);
  const result = await generateAutomationScript({
    user,
    input: String(request.body.content || ""),
    framework: String(request.body.framework || "playwright"),
    projectId: request.body.projectId,
  });
  response.json(result);
});

aiRouter.post("/bug-analyzer", async (request, response) => {
  const user = await getUser(request.auth!.userId);
  const result = await analyzeBug({
    user,
    input: String(request.body.content || ""),
    projectId: request.body.projectId,
  });
  response.json(result);
});

aiRouter.post("/test-data", async (request, response) => {
  const user = await getUser(request.auth!.userId);
  const result = await generateTestData({
    user,
    prompt: String(request.body.prompt || ""),
    recordCount: Number(request.body.recordCount || 5),
    projectId: request.body.projectId,
  });
  response.json(result);
});

aiRouter.post("/test-report", upload.single("file"), async (request, response) => {
  const content = (await parseUploadedFile(request.file)) || String(request.body.content || "");
  const user = await getUser(request.auth!.userId);
  const result = await generateTestReport({
    user,
    input: content,
    projectId: request.body.projectId,
  });
  response.json(result);
});

aiRouter.post("/api-tests", upload.single("file"), async (request, response) => {
  const content = (await parseUploadedFile(request.file)) || String(request.body.content || "");
  const user = await getUser(request.auth!.userId);
  const result = await generateApiTests({
    user,
    input: content,
    projectId: request.body.projectId,
  });
  response.json(result);
});

aiRouter.post("/release-risk", async (request, response) => {
  const user = await getUser(request.auth!.userId);
  const result = await analyzeReleaseRisk({
    user,
    input: String(request.body.content || ""),
    projectId: request.body.projectId,
  });
  response.json(result);
});

