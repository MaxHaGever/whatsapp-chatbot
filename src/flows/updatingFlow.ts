import { FlowContext } from "../utils/flowContext";
import { sendWhatsAppMessage } from "../service/sendWhatsAppMessage";

export async function handleUpdatingFlow(context: FlowContext) {
  const { business, client, message } = context;
  sendWhatsAppMessage(business._id, client.phone, "Updating flow");
}
