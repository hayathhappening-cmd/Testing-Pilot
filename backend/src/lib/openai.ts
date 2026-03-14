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

export async function generateAiJson<T>({
  system,
  prompt,
  fallback,
}: {
  system: string;
  prompt: string;
  fallback: T;
}) {
  const openai = getClient();

  if (!openai) {
    return fallback;
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
  } catch {
    return fallback;
  }
}

