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

/**
 * WhatsApp webhook POST handler
 * - replies only to incoming TEXT messages
 * - ignores statuses-only events
 * - responds 200 immediately (Meta wants fast response)
 * - uses your sendWhatsAppMessage(phoneId, to, text) which looks up token by phoneId in DB
 */
export async function handleWhatsappWebhook(req: Request, res: Response) {
  // Always respond fast so Meta doesn't retry
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

    // Ignore delivery/read updates (statuses-only) and anything without messages[]
    if (!msg) {
      // Optional debug:
      // console.log("Webhook: statuses-only event:", JSON.stringify(value?.statuses?.[0] ?? null));
      return;
    }

    const from = msg?.from; // user wa_id
    const type = msg?.type;
    const text = msg?.text?.body;

    // Only handle text messages for now
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

    // Echo back (or replace `text` with your own response)
    await sendWhatsAppMessage(phoneId, from, `You said: ${text}`);
  } catch (err: any) {
    // You already responded 200; this is just for logs
    console.error("Webhook handler error:", err?.message || err);
  }
}