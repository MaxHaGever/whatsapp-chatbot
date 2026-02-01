import { extractIntent, IntentResult , extractIntentBetter } from "../ai/intents/extractIntent";

export async function extractIntentWithFallback(text: string): Promise<IntentResult> {
  const result = await extractIntent(text);

  if (result.confidence < 0.7) {
    return await extractIntentBetter(text);
  }

  return result;
}