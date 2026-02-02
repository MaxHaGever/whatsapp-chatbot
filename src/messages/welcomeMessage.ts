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
    he: `👋 שלום וברוך הבא ל־${businessName}!\n\n🤖 אני בוט לקביעת תורים.\nאפשר לכתוב לי בצורה חופשית מה תרצו לעשות – לקבוע פגישה, לעדכן או לבטל.`,
    en: `👋 Hi and welcome to ${businessName}!\n\n🤖 I'm an appointment scheduling bot.\nYou can write freely what you'd like to do — book, update, or cancel an appointment.`,
    ru: `👋 Добро пожаловать в ${businessName}!\n\n🤖 Я бот для записи на приём.\nВы можете свободно написать, что хотите сделать — записаться, изменить или отменить встречу.`,
    fr: `👋 Bienvenue chez ${businessName} !\n\n🤖 Je suis un bot de prise de rendez-vous.\nVous pouvez écrire librement ce que vous souhaitez faire — prendre, modifier ou annuler un rendez-vous.`
  };

  const message = messages[language] || messages["he"]; // fallback to Hebrew

  await sendWhatsAppMessage(sendingBusiness._id, from, message);
}
