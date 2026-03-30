import "dotenv/config";

export const env = {
  apiPort: Number(process.env.API_PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change-me-super-secret",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiAdminApiKey: process.env.OPENAI_ADMIN_API_KEY || "",
  openAiUsageApiKeyId: process.env.OPENAI_USAGE_API_KEY_ID || "",
  openAiUsageTokenLimit: Number(process.env.OPENAI_USAGE_TOKEN_LIMIT || 0),
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
