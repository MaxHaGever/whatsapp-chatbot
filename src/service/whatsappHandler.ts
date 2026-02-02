import type { Request, Response } from "express";
import Business from "../models/Business";
import { sendWhatsAppMessage, sendClientLanguageSelectionMessage } from "./sendWhatsAppMessage";
import { isResetCommand } from "../rules/textCommands";
import {
  getOrCreateClient,
  handleClientUpsertWithIdleCheck,
  isClientFirst,
  updateClientStage
} from "./clientService";
import { extractIntentWithFallback } from "../utils/extractIntentWithFallback";
import { sendWelcomeMessage } from "../messages/welcomeMessage";
import { intentToStageMap } from "../utils/intentStageMap";
import { handleBookingFlow } from "../flows/bookingFlow";
import { handleUpdatingFlow } from "../flows/updatingFlow";
import { handleCancelingFlow } from "../flows/cancelingFlow";
import mongoose from "mongoose";

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

    const profileName = value?.contacts?.[0]?.profile?.name;

    // ✅ Handle list reply for language
    if (msg?.type === "interactive" && msg.interactive?.type === "list_reply") {
      const payload = msg.interactive.list_reply.id;
      await handleLanguageSelection(doc._id, from, payload, profileName);
      return;
    }

    if (msg?.type !== "text") return;

    let client;

    if (await isClientFirst(from)) {
      client = await getOrCreateClient(doc._id, from, new Date(), "he", profileName);
      await sendClientLanguageSelectionMessage(businessPhoneId, from);
    } else {
      client = await handleClientUpsertWithIdleCheck(
        doc._id,
        from,
        profileName,
        "welcome"
      );
    }

    const text = msg?.text?.body?.trim();
    if (!text) return;

    if (isResetCommand(text)) {
      await sendWelcomeMessage(businessPhoneId, from, doc.welcome);
      await updateClientStage(client._id, "idle");
      return;
    }

    let stage = client.stage;

    if (stage === "welcome") {
      await sendWelcomeMessage(businessPhoneId, from, doc.welcome);
      await updateClientStage(client._id, "idle");
      return;
    }

    if (stage === "idle") {
      const result = await extractIntentWithFallback(text);
      const { intent, confidence } = result;

      if (intent === "unknown" || confidence < 0.6) {
        await updateClientStage(client._id, "idle");
        await sendWhatsAppMessage(businessPhoneId, from, "Sorry, I didn't understand that.");
        return;
      }

      const nextStage = intentToStageMap[intent];
      if (nextStage) {
        await updateClientStage(client._id, nextStage);
        stage = nextStage;
      }
    }

    if (stage === "booking") {
      await handleBookingFlow({ business: doc, client, message: text });
    } else if (stage === "updating") {
      await handleUpdatingFlow({ business: doc, client, message: text });
    } else if (stage === "canceling") {
      await handleCancelingFlow({ business: doc, client, message: text });
    }

  } catch (err: any) {
    console.error("Webhook handler error:", err?.message || err);
  }
}

async function handleLanguageSelection(
  businessId: mongoose.Types.ObjectId,
  phone: string,
  payload: string,
  profileName?: string
) {
  const langMap: Record<string, "he" | "en" | "ru" | "fr"> = {
    lang_en: "en",
    lang_ru: "ru",
    lang_fr: "fr",
    lang_he: "he"
  };

  const language = langMap[payload];
  if (!language) {
    console.warn("Invalid language payload received:", payload);
    return;
  }

  console.log(`Language selected by ${phone}: ${language}`);

  const client = await getOrCreateClient(businessId, phone, new Date(), language, profileName);

  await updateClientStage(client._id, "welcome");

  await sendWhatsAppMessage(client.businessId.toString(), phone, `Language set to ${language.toUpperCase()}.`);
  await sendWelcomeMessage(client.businessId.toString(), phone, "Thanks for selecting your language. How can I help you?");
}
