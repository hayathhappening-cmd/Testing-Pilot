import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { adminRouter } from "./routes/admin";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { billingRouter } from "./routes/billing";
import { dashboardRouter } from "./routes/dashboard";
import { prisma } from "./lib/prisma";
import { requireAuth } from "./middleware/auth";
import { projectsRouter } from "./routes/projects";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/me", requireAuth, async (request, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.auth!.userId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!user) {
    response.status(404).json({ error: "User not found." });
    return;
  }

  response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      creditsBalance: user.creditsBalance,
      subscription: user.subscription
        ? {
            status: user.subscription.status,
            plan: user.subscription.plan,
          }
        : null,
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);
app.use("/api/billing", billingRouter);

app.use(
  (error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(500).json({
      error: error.message || "Unexpected server error.",
    });
  },
);

app.listen(env.apiPort, () => {
  console.log(`QA Copilot API running on port ${env.apiPort}`);
});
