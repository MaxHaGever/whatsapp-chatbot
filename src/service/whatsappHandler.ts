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

export function handleWhatsappWebhook(req: Request, res: Response) {

    res.sendStatus(200);

    const body = req.body;
    console.log("Received WhatsApp webhook event:", body);
    


}
