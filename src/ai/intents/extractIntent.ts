import openai from "../OpenaiClient";
import { INTENT_EXTRACTOR_SYSTEM_PROMPT } from "../prompt/intentExtractor.prompt";

export type Intent = "booking" | "updating" | "canceling" | "unknown";
export type IntentResult = { intent: Intent; confidence: number };

const ALLOWED_INTENTS = new Set<Intent>(["booking", "updating", "canceling", "unknown"]);

function stripJsonFences(s: string) {
  // handles ```json ... ``` or ``` ... ```
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

export async function extractIntent(text: string): Promise<IntentResult> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: INTENT_EXTRACTOR_SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0,
    });

    const raw = stripJsonFences(response.choices[0]?.message?.content?.trim() ?? "");

    const parsed = JSON.parse(raw) as Partial<IntentResult>;
    const intentRaw = parsed.intent;
    const confidence = Number(parsed.confidence);

    if (!ALLOWED_INTENTS.has(intentRaw as Intent)) {
      return { intent: "unknown", confidence: 0 };
    }

    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      return { intent: "unknown", confidence: 0 };
    }

    return { intent: intentRaw as Intent, confidence };
  } catch (error) {
    console.error("Error extracting intent:", error);
    return { intent: "unknown", confidence: 0 };
  }
}

/** OpenAI Chat Completions API response is JSON (example)
 * {
 *   id: "chatcmpl-9wK3mQx1AbCdEfGhIjKlMnOpQrStUvWx",
 *   object: "chat.completion",
 *   created: 1769823456, // unix timestamp (seconds)
 *   model: "gpt-4o-mini",
 *   choices: [
 *     {
 *       index: 0,
 *       message: {
 *         role: "assistant",
 *         content: "{\"intent\":\"booking\",\"confidence\":0.91}"
 *       },
 *       finish_reason: "stop"
 *     }
 *   ],
 *   usage: {
 *     prompt_tokens: 128,
 *     completion_tokens: 18,
 *     total_tokens: 146
 *   }
 * }
 */

export async function extractIntentBetter(text: string): Promise<IntentResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: INTENT_EXTRACTOR_SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
    temperature: 0,
  });

  const raw = stripJsonFences(response.choices[0]?.message?.content?.trim() ?? "");

  try {
    const parsed = JSON.parse(raw) as Partial<IntentResult>;
    const intent = parsed.intent;
    const confidence = Number(parsed.confidence);

    const okIntent =
      intent === "booking" ||
      intent === "updating" ||
      intent === "canceling" ||
      intent === "unknown";

    const okConfidence = Number.isFinite(confidence) && confidence >= 0 && confidence <= 1;

    if (okIntent && okConfidence) return { intent, confidence };
  } catch (e) {
    console.error("Error parsing intent response (strong):", e);
  }

  return { intent: "unknown", confidence: 0 };
}
