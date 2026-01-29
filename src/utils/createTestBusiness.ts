import Business from "../models/Business";

const createTestBusiness = async () => {

    if(process.env.NODE_ENV !== "development") { return }

    const name = process.env.TEST_BUSINESS_NAME;
    const wabaId = process.env.WHATSAPP_TEST_WABA_ID;
    const phoneId = process.env.WHATSAPP_TEST_PHONE_ID;
    const token = process.env.WHATSAPP_TEMPORARY_TOKEN;

    if (!name || !wabaId || !phoneId || !token) {
        console.error("Missing required environment variables");
        return;
    }

    const business = await Business.findOneAndUpdate(
    { name }, // stable key
    { $set: { name, wabaId, phoneId, token } },
    { upsert: true, new: true }
  );

  console.log("Test business created or updated:",
    name,
    wabaId,
    phoneId,
  );
};

export default createTestBusiness;
