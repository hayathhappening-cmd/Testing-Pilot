import "dotenv/config";

export const env = {
  apiPort: Number(process.env.API_PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change-me-super-secret",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

