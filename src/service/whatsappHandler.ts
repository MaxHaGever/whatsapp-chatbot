import type { Request, Response } from "express";
import Business from "../models/Business";   
import Client from "../models/Client";
import { sendWhatsAppMessage } from "./sendWhatsAppMessage";  
import { isResetCommand } from "../rules/textCommands";
import { extractIntent, extractIntentBetter } from "../ai/intents/extractIntent";

export function verifyWebhook(req: Request, res: Response) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Forbidden");
}

export async function handleWhatsappWebhook(req: Request, res: Response) {
  res.sendStatus(200);

  try {
    const body = req.body;

    const value = body?.entry?.[0]?.changes?.[0]?.value;
    if (!value) return;

    const businessPhoneId = value?.metadata?.phone_number_id;
    if (!businessPhoneId) return;

    const doc = await Business.findOne({ phoneId: businessPhoneId });
    if (!doc) return;

    const msg = value?.messages?.[0];
    const from = msg?.from;
    if (!from) return;

    if (msg?.type !== "text") return;

    const profileName = value?.contacts?.[0]?.profile?.name;

    const client = await Client.findOneAndUpdate(
      { businessId: doc._id, phone: from },
      {
        $setOnInsert: {
          businessId: doc._id,
          phone: from,
        },
        ...(profileName ? { $set: { name: profileName } } : {}),
      },
      {
        upsert: true,
        new: true,
      }
    );

    const text = msg?.text?.body?.trim();
    if (!text) return;

    if (isResetCommand(text)) {
      const welcomeMsg = doc.welcome || "Welcome!";
      await sendWhatsAppMessage(businessPhoneId, from, welcomeMsg);
      await Client.updateOne({ _id: client._id }, { $set: { stage: "idle" } });
      return;
    }

    const stage = client.stage ?? "welcome";

    if (stage === "welcome") {
      const welcomeMsg = doc.welcome || "Welcome!";
      await sendWhatsAppMessage(businessPhoneId, from, welcomeMsg);
      await Client.updateOne({ _id: client._id }, { $set: { stage: "idle" } });
      return;
    }

    if (stage === "idle") {
      let result = await extractIntent(text);

      if (result.confidence < 0.7) {
        result = await extractIntentBetter(text);
      }

      const { intent, confidence } = result;

      if (intent === "unknown" || confidence < 0.6) {
        await Client.updateOne({ _id: client._id }, { $set: { stage: "idle" } });
        await sendWhatsAppMessage(businessPhoneId, from, "Sorry, I didn't understand that.");
        return;
      }

      switch (intent) {
        case "booking":
        case "updating":
        case "canceling":
          await Client.updateOne({ _id: client._id }, { $set: { stage: intent } });
          return;

        default:
          await Client.updateOne({ _id: client._id }, { $set: { stage: "idle" } });
          return;
      }
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message || err);
  }
}
