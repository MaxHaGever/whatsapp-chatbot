import mongoose from "mongoose";
import { sendWhatsAppMessage } from "../service/sendWhatsAppMessage";
import { Business } from "../models/Business";

export async function sendWelcomeMessage(business: mongoose.Types.ObjectId, from: string, language: string) {
  const sendingBusiness = await Business.findOne({ _id: business });

  if (!sendingBusiness) {
    console.error("Business not found:", business);
    return;
  }

  const businessName = sendingBusiness.name || "העסק שלנו";

  const messages: Record<string, string> = {
    he: `👋 שלום וברוך הבא ל־${businessName}!\n\nאני בוט קטן שעוזר לך לקבוע, לעדכן או לבטל פגישה.\nשלח לי הודעה בחינם 😊`,
    en: `👋 Hi and welcome to ${businessName}!\n\nI'm a helpful little bot that can help you schedule, update, or cancel an appointment.\nJust message me for free 😊`,
    ru: `👋 Добро пожаловать в ${businessName}!\n\nЯ бот, который поможет вам записаться, изменить или отменить встречу.\nНапишите мне бесплатно 😊`,
    fr: `👋 Bienvenue chez ${businessName} !\n\nJe suis un petit bot prêt à vous aider à programmer, modifier ou annuler un rendez-vous.\nÉcrivez-moi gratuitement 😊`,
  };

  const message = messages[language] || messages["he"]; // fallback to Hebrew

  await sendWhatsAppMessage(sendingBusiness._id, from, message);
}
