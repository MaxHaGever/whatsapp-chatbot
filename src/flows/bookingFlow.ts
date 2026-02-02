import { FlowContext } from "../utils/flowContext";
import { sendWhatsAppMessage } from "../service/sendWhatsAppMessage";

export async function handleBookingFlow(context: FlowContext) {
  const { business, client, message } = context;
  sendWhatsAppMessage(business._id, client.phone, "Booking flow");
}
