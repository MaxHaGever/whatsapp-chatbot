import axios from "axios";
import Business from "../models/Business";

export async function sendWhatsAppMessage(phoneId: string, to: string, text: string) {

    const token = (await Business.findOne({ phoneId }))?.token;
    if (!token) {
        console.error("No token found for phoneId:", phoneId);
        return;
    }
    const version = process.env.GRAPH_VERSION || "v22.0";

    const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
    const body = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text }
    };

    try {
        const response = await axios.post(url, body, { headers });
        console.log("WhatsApp message sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
    }
}
