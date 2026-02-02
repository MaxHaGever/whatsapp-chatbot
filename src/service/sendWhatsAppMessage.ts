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

export async function sendClientLanguageSelectionMessage(phoneId: string, to: string) {
  const business = await Business.findOne({ phoneId });

  if (!business?.token) {
    console.error("No token found for phoneId:", phoneId);
    return;
  }

  const version = process.env.GRAPH_VERSION || "v19.0";
  const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;

  const headers = {
    Authorization: `Bearer ${business.token}`,
    "Content-Type": "application/json"
  };

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: "אנא בחרו שפה"
      },
      action: {
        buttons: [
                      {
            type: "reply",
            reply: {
              id: "lang_he",
              title: "עברית"
            }
          },
          {
            type: "reply",
            reply: {
              id: "lang_ru",
              title: "Русский"
            }
          },
          {
            type: "reply",
            reply: {
              id: "lang_fr",
              title: "Français"
            }
          },
        ]
      }
    }
  };

  try {
    const response = await axios.post(url, body, { headers });
    console.log("Language selection message sent successfully:", response.data);
  } catch (error: any) {
    console.error("Error sending language selection message:", error.response?.data || error.message || error);
  }
}
