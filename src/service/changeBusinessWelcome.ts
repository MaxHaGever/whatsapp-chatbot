import Business from "../models/Business";

export async function changeBusinessWelcome(
  phoneId: string,
  newWelcomeMessage: string
): Promise<boolean> {
  const pid = (phoneId ?? "").trim();
  const welcome = (newWelcomeMessage ?? "").trim();

  if (!pid) throw new Error("phoneId is required");
  if (!welcome) throw new Error("welcome message is required");

  const updated = await Business.findOneAndUpdate(
    { phoneId: pid },
    { $set: { welcome } },
    { new: true, runValidators: true }
  );

  return updated !== null;
}
