import axios from "axios";
import Business from "../models/Business";

export async function sendWhatsAppMessage(phoneId: string, to: string, text: string) {
  const token = (await Business.findOne({ phoneId }))?.token;
  if (!token) {
    console.error("No token found for phoneId:", phoneId);
    return;
  }

  const version = process.env.GRAPH_VERSION || "v19.0";
  const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;
  const headers = {
    Authorization: `Bearer ${token}`,
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
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error.response?.data || error.message || error);
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
      type: "list",
      header: {
        type: "text",
        text: "בחירת שפה 🌍 "
      },
      body: {
        text: "אנא בחרו את השפה המועדפת עליכם:"
      },
      footer: {
        text: "השפה תישמר לשיחות הבאות."
      },
      action: {
        button: "בחר שפה",
        sections: [
          {
            title: "Available Languages",
            rows: [
              { id: "lang_he", title: "עברית", description: "Hebrew" },
              { id: "lang_en", title: "English", description: "English" },
              { id: "lang_ru", title: "Русский", description: "Russian" },
              { id: "lang_fr", title: "Français", description: "French" }
            ]
          }
        ]
      }
    }
  };

  try {
    const response = await axios.post(url, body, { headers });
    console.log("Language list message sent successfully:", response.data);
  } catch (error: any) {
    console.error("Error sending language list message:", error.response?.data || error.message || error);
  }
}
