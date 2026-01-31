import { Request, Response } from "express";
import { changeBusinessWelcome } from "../service/changeBusinessWelcome";

type WelcomeParams = { phoneId: string };

export const patchBusinessWelcome = async (
  req: Request<WelcomeParams>,
  res: Response
) => {
  const phoneId = req.params.phoneId;
  const newWelcomeMessage = req.body.welcome;

  try {
    const success = await changeBusinessWelcome(phoneId, newWelcomeMessage);
    return success
      ? res.status(200).json({ message: "Welcome message updated successfully" })
      : res.status(404).json({ error: "Business not found" });
  } catch (err: any) {
    // your service throws on validation -> 400 is better than 500
    return res.status(400).json({ error: err?.message ?? "Bad request" });
  }
};
