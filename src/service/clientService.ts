import mongoose, { ObjectId } from "mongoose";
import Client from "../models/Client";

export async function getOrCreateClient(businessId: mongoose.Types.ObjectId, phone: string, profileName?: string) {
  return Client.findOneAndUpdate(
    { businessId, phone },
    {
      $setOnInsert: {
        businessId,
        phone,
      },
      ...(profileName ? { $set: { name: profileName } } : {}),
    },
    { upsert: true, new: true }
  );
}

export async function updateClientStage(clientId: mongoose.Types.ObjectId, newStage: string) {
    const client = await Client.findById(clientId);
    if (!client) return;
    if (client.stage === newStage) return;
       
    console.log(`Stage change for ${client.phone}: ${client.stage} → ${newStage}`);
    return Client.updateOne({ _id: clientId }, { $set: { stage: newStage } });
}
