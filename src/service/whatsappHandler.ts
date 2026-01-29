import type { Request, Response } from "express";
import Business from "../models/Business";
import { mongo } from "mongoose";

export function verifyWebhook(req: Request, res: Response) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WHATSAPP_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
}

/**
 * TL;DR WhatsApp webhook payload (important parts):
 *
 * - The payload is nested like: entry[] -> changes[] -> value
 *
 * - For INCOMING user messages:
 *   value.metadata.phone_number_id        // your business phone id (needed when sending replies)
 *   value.contacts?.[0]?.wa_id            // the user's WhatsApp id (often same as messages[0].from)
 *   value.messages?.[0]?.from             // sender (user wa_id)
 *   value.messages?.[0]?.id               // message id ("wamid...")
 *   value.messages?.[0]?.type             // "text" | "interactive" | "image" | ...
 *   value.messages?.[0]?.text?.body       // text content (only if type === "text")
 *   value.messages?.[0]?.interactive      // button/list replies (only if type === "interactive")
 *
 * - For DELIVERY/READ updates of your outgoing messages:
 *   value.statuses?.[0]?.id               // message id you sent ("wamid...")
 *   value.statuses?.[0]?.status           // "sent" | "delivered" | "read" | "failed"
 *   value.statuses?.[0]?.recipient_id     // the user wa_id
 *
 * Gotchas:
 * - You might receive ONLY messages[] or ONLY statuses[] (handle both).
 * - Arrays can have multiple items; loop entry/changes/messages/statuses safely.
 */


export function handleWhatsappWebhook(req: Request, res: Response) {

    res.sendStatus(200);

    const body = req.body;
    console.log("Received WhatsApp webhook event:", body);
    


}
