import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireApprovedUser, requireAuth } from "../middleware/auth";
import { creditsCatalog } from "../services/ai";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requireApprovedUser);

dashboardRouter.get("/overview", async (request, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.auth!.userId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      usageEvents: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      projects: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) {
    response.status(404).json({ error: "User not found." });
    return;
  }

  response.json({
    user,
    recentActivity: user.usageEvents,
    projects: user.projects,
    creditCatalog: creditsCatalog,
    modules: [
      "AI exploratory testing agent",
      "AI accessibility testing",
      "AI performance test scenario generator",
      "AI security test generator",
      "AI UX quality analyzer",
    ],
  });
});

