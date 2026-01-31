import type { Request, Response } from "express";
import Business from "../models/Business";   
import Client from "../models/Client";
import { sendWhatsAppMessage } from "./sendWhatsAppMessage";  
import { isResetCommand } from "../rules/textCommands";
import { extractIntent } from "../ai/intents/extractIntent";


export function verifyWebhook(req: Request, res: Response) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
}

/**
 * WhatsApp Cloud API webhook payload (simplified map)
 *
 * req.body
 * └─ entry[0]
 *    └─ changes[0]
 *       └─ value   <== "value" is where the useful WhatsApp data lives
 *
 * value.metadata.phone_number_id
 *   - The BUSINESS phone number id (the WhatsApp phoneId you use to send replies)
 *   - Use this to find your Business document in Mongo: Business.findOne({ phoneId })
 *
 * value.metadata.display_phone_number
 *   - The BUSINESS display phone number (human-readable), not needed for logic
 *
 * value.messages[0]
 *   - The incoming message object (only exists for message events)
 *
 * value.messages[0].from
 *   - The CLIENT WhatsApp id (usually a phone number in international format)
 *   - This is your stable client identifier ("waId"/phone)
 *
 * value.messages[0].type
 *   - Message type: "text", "image", "audio", "button", etc.
 *   - For intent detection you usually handle only type === "text"
 *
 * value.messages[0].text.body
 *   - The actual text content the client sent (only when type === "text")
 *
 * value.contacts[0].wa_id
 *   - Often the same as messages[0].from (client id)
 *
 * value.contacts[0].profile.name
 *   - The client's WhatsApp profile name (optional / not guaranteed)
 *   - Use for personalization only; never rely on it for identity
 *
 * value.statuses[0]
 *   - Delivery/read status updates (these events may arrive without "messages")
 *   - If "value.messages" is missing but "value.statuses" exists, it's a status-only webhook
 */

export async function handleWhatsappWebhook(req: Request, res: Response) {
  res.sendStatus(200);

  try {
    const body = req.body;

    const value = body?.entry?.[0]?.changes?.[0]?.value;
    if (!value) {
      console.log("Webhook: missing value");
      return;
    }
    
    const businessPhoneId = value?.metadata?.phone_number_id;
     if (!businessPhoneId) {
      console.error("Webhook: missing metadata.phone_number_id");
      return;
    }
    const doc = await Business.findOne({ phoneId: businessPhoneId });
    if (!doc) {
      console.log("Webhook: business not found");
      return;
    }

    const msg = value?.messages?.[0];
    const from = msg?.from;
    if (!from) {
      console.error("Webhook: missing message.from");
      return;
    }
    const type = msg?.type;
  if (type !== "text") {
    console.log("Webhook: non-text message ignored:", { type });
    return;
  }

    const profileName = value?.contacts?.[0]?.profile?.name;

    const client = await Client.findOneAndUpdate(
      { businessId: doc._id, phone: from },   
      {
        $setOnInsert: {
          businessId: doc._id,
          phone: from,
          // stage will use schema default if you don't set it here
    },
    ...(profileName ? { $set: { name: profileName } } : {}),
    },
    {
     upsert: true,   // create if not found
     new: true,      // return the updated/created document
    }
  );

  const text = msg?.text?.body?.trim();
  if (!text) {
    console.error("Webhook: missing message.text.body");
    return;
  }

  console.log("Webhook: incoming text", {
      businessPhoneId,
      from,
      textPreview: text.slice(0, 60),
    });

  if(isResetCommand(text)) {
    const welcomeMsg = doc.welcome || "Welcome!";
    await sendWhatsAppMessage(businessPhoneId, from, welcomeMsg);
    await Client.updateOne({ _id: client._id }, { $set: { stage: "idle" } });
    return;
  }

  let stage = client.stage;

  if (stage === "welcome") {
    const welcomeMsg = doc.welcome || "Welcome!";
    await sendWhatsAppMessage(businessPhoneId, from, welcomeMsg);
    await Client.updateOne({ _id: client._id }, { $set: { stage: "idle" } });
    return;
  }

  if (stage === "idle") {
    const intent = await extractIntent(text);
    if (intent) {
      console.log("Webhook: detected intent", { intent });
    }
  }
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message || err);
  }
}