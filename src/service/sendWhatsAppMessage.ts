import axios from "axios";
import Business from "../models/Business";
import mongoose from "mongoose";

export async function sendWhatsAppMessage(business: mongoose.Types.ObjectId, to: string, text: string) {
  const sendingBusiness = (await Business.findOne({ _id: business }))
  if (!sendingBusiness?. token) {
    console.error("No token found for business:", business);
    return;
  }

  const version = process.env.GRAPH_VERSION || "v19.0";
  const url = `https://graph.facebook.com/${version}/${sendingBusiness.phoneId}/messages`;
  const headers = {
    Authorization: `Bearer ${sendingBusiness.token}`,
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

export async function sendClientLanguageSelectionMessage(business: mongoose.Types.ObjectId, to: string) {
  const sendingBusiness = await Business.findOne({ _id: business });

  if (!sendingBusiness?.token) {
    console.error("No token found for business:", business);
    return;
  }

  const version = process.env.GRAPH_VERSION || "v19.0";
  const url = `https://graph.facebook.com/${version}/${sendingBusiness.phoneId}/messages`;

  const headers = {
    Authorization: `Bearer ${sendingBusiness.token}`,
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
              { id: "lang_he", title: "עברית"},
              { id: "lang_en", title: "English"},
              { id: "lang_ru", title: "Русский"},
              { id: "lang_fr", title: "Français"}
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
