const MODEL_NAME = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

export function getApiKey(): string {
  return "AIzaSyAGzrn_j2maP4vcXbLR1X5XFygZiXqhUTE";
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

import type { ChatMessage as Msg } from "../types/type";
export function makeGeminiHistory(all: Msg[]) {
  const filtered = all.filter((m) => m.role === "user" || m.role === "model");
  const last = filtered.slice(-16);
  return last.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
}

/**
 * Create a cancelable Gemini call.
 * - Returns { promise, cancel }
 * - Uses AbortController to truly cancel the HTTP request
 */
export function callGeminiCancelable({
  apiKey,
  contents,
}: {
  apiKey: string;
  contents: any[];
}): {
  promise: Promise<{ text: string; blocked?: string }>;
  cancel: () => void;
} {
  const controller = new AbortController();

  const promise = (async () => {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents,
        generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
        systemInstruction: {
          parts: [
            {
              text: "You are a helpful Vietnamese assistant. Keep answers clear and concise.",
            },
          ],
        },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .join("") ?? "";
    const blocked = data?.promptFeedback?.blockReason as string | undefined;
    return { text: reply, blocked };
  })();

  return { promise, cancel: () => controller.abort() };
}
