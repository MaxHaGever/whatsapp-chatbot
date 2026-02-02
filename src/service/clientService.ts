import mongoose from "mongoose";
import Client from "../models/Client";
import { DateTime } from "luxon";
import type { ClientStage } from "../models/Client";

export async function getOrCreateClient(
  businessId: mongoose.Types.ObjectId,
  phone: string,
  lastInteraction: Date,
  language: "he" | "ru" | "fr" = "he",
  profileName?: string
) {
  console.log("getOrCreateClient called with:", {
    businessId,
    phone,
    lastInteraction,
    language,
    profileName
  });

  return Client.findOneAndUpdate(
    { businessId, phone },
    {
      $setOnInsert: {
        businessId,
        phone,
        lastInteraction,
        language,
        ...(profileName ? { name: profileName } : {})
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );
}

export async function handleClientUpsertWithIdleCheck(
  businessId: mongoose.Types.ObjectId,
  phone: string,
  profileName?: string,
  resetStage: ClientStage = "welcome"
) {
  const now = new Date();
  const idleThresholdMinutes = process.env.IDLE_THRESHOLD_MINUTES
    ? parseInt(process.env.IDLE_THRESHOLD_MINUTES, 10)
    : 15;

  let client = await Client.findOne({ businessId, phone });

  if (!client) {
    const newClient = {
      businessId,
      phone,
      lastInteraction: now,
      name: profileName,
      stage: resetStage,
      language: "he"
    };

    console.log("Creating new client:", newClient);

    return await Client.create(newClient);
  }

  const last = DateTime.fromJSDate(client.lastInteraction);
  const diffMinutes = DateTime.now().diff(last, "minutes").minutes;

  if (diffMinutes >= idleThresholdMinutes) {
    client.stage = resetStage;
  }

  client.lastInteraction = now;
  if (profileName) client.name = profileName;

  await client.save();
  return client;
}

export async function isClientFirst(phone: string): Promise<boolean> {
  const client = await Client.findOne({ phone });
  return !client;
}

export async function updateClientStage(
  clientId: mongoose.Types.ObjectId,
  newStage: ClientStage
) {
  const client = await Client.findById(clientId);
  if (!client) return;
  if (client.stage === newStage) return;

  console.log(
    `Stage change for ${client.phone}: ${client.stage} → ${newStage}`
  );

  return Client.updateOne(
    { _id: clientId },
    { $set: { stage: newStage } }
  );
}
