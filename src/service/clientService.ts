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

export async function updateClientStage(clientId: mongoose.Types.ObjectId, stage: string) {
  return Client.updateOne({ _id: clientId }, { $set: { stage } });
}
