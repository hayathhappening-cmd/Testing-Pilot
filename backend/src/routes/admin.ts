import { ApprovalStatus } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin, requireApprovedUser, requireAuth } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireApprovedUser, requireAdmin);

adminRouter.get("/overview", async (_request, response) => {
  const [users, plans, usageEvents] = await Promise.all([
    prisma.user.findMany({
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscriptionPlan.findMany({ orderBy: { priceMonthly: "asc" } }),
    prisma.usageEvent.findMany(),
  ]);

  response.json({
    users,
    plans,
    usageBreakdown: usageEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + event.creditsUsed;
      return acc;
    }, {}),
    stats: {
      totalUsers: users.length,
      pendingUsers: users.filter((user) => user.approvalStatus === ApprovalStatus.PENDING).length,
      approvedUsers: users.filter((user) => user.approvalStatus === ApprovalStatus.APPROVED).length,
      totalCreditsUsed: usageEvents.reduce((sum, event) => sum + event.creditsUsed, 0),
    },
  });
});

adminRouter.post("/users/:id/approve", async (request, response) => {
  const user = await prisma.user.update({
    where: { id: request.params.id },
    data: {
      approvalStatus: ApprovalStatus.APPROVED,
      subscription: {
        update: {
          status: "active",
        },
      },
    },
  });

  response.json({ message: `${user.name} approved.` });
});

adminRouter.post("/users/:id/reject", async (request, response) => {
  const user = await prisma.user.update({
    where: { id: request.params.id },
    data: {
      approvalStatus: ApprovalStatus.REJECTED,
      subscription: {
        update: {
          status: "rejected",
        },
      },
    },
  });

  response.json({ message: `${user.name} rejected.` });
});

adminRouter.post("/plans/:slug", async (request, response) => {
  const { creditsPerMonth, priceMonthly, description, features } = request.body;

  const plan = await prisma.subscriptionPlan.update({
    where: { slug: request.params.slug },
    data: {
      creditsPerMonth,
      priceMonthly,
      description,
      features,
    },
  });

  response.json({ plan });
});

