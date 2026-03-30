import OpenAI from "openai";
import { env } from "../config/env";

let client: OpenAI | null = null;

function getClient() {
  if (!env.openAiApiKey) {
    return null;
  }

  client ??= new OpenAI({ apiKey: env.openAiApiKey });
  return client;
}

type UsageApiResult = {
  input_tokens?: number;
  output_tokens?: number;
  input_cached_tokens?: number;
  input_audio_tokens?: number;
  output_audio_tokens?: number;
  num_model_requests?: number;
};

type UsageApiBucket = {
  results?: UsageApiResult[];
};

type UsageApiResponse = {
  data?: UsageApiBucket[];
};

export async function getOpenAiApiKeyUsage() {
  if (!env.openAiAdminApiKey || !env.openAiUsageApiKeyId) {
    return null;
  }

  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const params = new URLSearchParams({
    start_time: String(Math.floor(start.getTime() / 1000)),
    bucket_width: "1d",
    limit: "31",
  });
  params.append("api_key_ids", env.openAiUsageApiKeyId);

  const response = await fetch(`https://api.openai.com/v1/organization/usage/completions?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${env.openAiAdminApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI usage request failed: ${errorText || response.statusText}`);
  }

  const payload = (await response.json()) as UsageApiResponse;
  const buckets = payload.data ?? [];

  let usedTokens = 0;
  let requestCount = 0;

  for (const bucket of buckets) {
    for (const result of bucket.results ?? []) {
      usedTokens +=
        (result.input_tokens ?? 0) +
        (result.output_tokens ?? 0) +
        (result.input_cached_tokens ?? 0) +
        (result.input_audio_tokens ?? 0) +
        (result.output_audio_tokens ?? 0);
      requestCount += result.num_model_requests ?? 0;
    }
  }

  const limit = env.openAiUsageTokenLimit > 0 ? env.openAiUsageTokenLimit : null;
  const remainingTokens = limit ? Math.max(limit - usedTokens, 0) : null;
  const usagePercent = limit ? Math.min(100, Math.round((usedTokens / Math.max(limit, 1)) * 100)) : null;

  return {
    usedTokens,
    remainingTokens,
    limit,
    usagePercent,
    requestCount,
    periodStart: start.toISOString(),
    periodEnd: new Date().toISOString(),
  };
}

export async function generateAiJson<T>({
  system,
  prompt,
  fallback,
  allowFallback = true,
}: {
  system: string;
  prompt: string;
  fallback: T;
  allowFallback?: boolean;
}) {
  const openai = getClient();

  if (!openai) {
    if (allowFallback) {
      return fallback;
    }

    throw new Error("AI generation is unavailable because the OpenAI client is not configured.");
  }

  try {
    const response = await openai.responses.create({
      model: env.openAiModel,
      text: {
        format: {
          type: "json_object",
        },
      },
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
    });

    return JSON.parse(response.output_text) as T;
  } catch (error) {
    if (allowFallback) {
      return fallback;
    }

    throw new Error(
      `AI generation failed${error instanceof Error && error.message ? `: ${error.message}` : "."}`,
    );
  }
}
