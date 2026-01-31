import Business from "../models/Business";

export async function changeBusinessWelcome(phoneId: string, newWelcomeMessage: string) {
    try {
        await Business.findOneAndUpdate({ phoneId }, { welcome: newWelcomeMessage });
        console.log("Business welcome message updated successfully");
    } catch (error) {
        console.error("Error updating business welcome message:", error);
    }
}
