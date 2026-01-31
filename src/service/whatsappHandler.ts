import type { Request, Response } from "express";
import Business from "../models/Business";   
import { sendWhatsAppMessage } from "./sendWhatsAppMessage";  

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
    if (!value) {
      console.log("Webhook: missing value");
      return;
    }

    const phoneId = value?.metadata?.phone_number_id;
    const msg = value?.messages?.[0];

    const from = msg?.from; 
    const type = msg?.type;
    const doc = await Business.findOne({ phoneId },);
    if (!doc) {
      console.log("Webhook: business not found");
      return;
    }
    const text = doc.welcome;

    if (type !== "text") {
      console.log("Webhook: non-text message ignored:", { type });
      return;
    }

    if (!phoneId) {
      console.error("Webhook: missing metadata.phone_number_id");
      return;
    }

    if (!from || !text) {
      console.error("Webhook: missing from/text", { from: !!from, text: !!text });
      return;
    }

    console.log("Webhook: incoming text", {
      phoneId,
      from,
      textPreview: text.slice(0, 60),
    });

    await sendWhatsAppMessage(phoneId, from, `${text}`);
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message || err);
  }
}