import "dotenv/config";

function parseCorsOrigins(input?: string) {
  const defaults = ["http://localhost:3000", "http://127.0.0.1:3000"];

  if (!input?.trim()) {
    return defaults;
  }

  const configuredOrigins = input
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...configuredOrigins, ...defaults]));
}

export const env = {
  apiPort: Number(process.env.PORT || process.env.API_PORT || 4000),
  apiHost: process.env.API_HOST || process.env.HOST || "0.0.0.0",
  jwtSecret: process.env.JWT_SECRET || "change-me-super-secret",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiAdminApiKey: process.env.OPENAI_ADMIN_API_KEY || "",
  openAiUsageApiKeyId: process.env.OPENAI_USAGE_API_KEY_ID || "",
  openAiUsageTokenLimit: Number(process.env.OPENAI_USAGE_TOKEN_LIMIT || 0),
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
