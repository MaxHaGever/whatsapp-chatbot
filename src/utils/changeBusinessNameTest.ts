import Business from "../models/Business";
import { changeBusinessWelcome } from "../service/changeBusinessWelcome";

async function changeBusinessNameTest() {
    const phoneId = process.env.WHATSAPP_TEST_PHONE_ID;
    const newWelcomeMessage = "Hello! How can we assist you today?";

    if (!phoneId) {
        console.error("Missing required environment variables");
        return;
    }

    await changeBusinessWelcome(phoneId, newWelcomeMessage);
    console.log("Business welcome message changed to:", newWelcomeMessage);
}
