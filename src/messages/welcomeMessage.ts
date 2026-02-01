import { sendWhatsAppMessage } from "../service/sendWhatsAppMessage";

export async function sendWelcomeMessage(businessPhoneId: string, from: string, customMessage?: string) {
  const message = customMessage || "Welcome!";
  await sendWhatsAppMessage(businessPhoneId, from, message);
}
