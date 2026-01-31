import type { Request, Response } from "express";
import Business from "../models/Business";
import { makeOAuthClient, getCalendarScopes } from "../google/googleClient";

export async function googleOAuthStart(req: Request, res: Response) {
  const businessId = String(req.query.businessId || "");
  if (!businessId) return res.status(400).send("Missing businessId");

  const biz = await Business.findById(businessId);
  if (!biz) return res.status(404).send("Business not found");

  const oauth2 = makeOAuthClient();
  const scopes = getCalendarScopes();

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state: businessId,
  });

  return res.redirect(url);
}

export async function googleOAuthCallback(req: Request, res: Response) {
  const code = String(req.query.code || "");
  const businessId = String(req.query.state || "");

  if (!code) return res.status(400).send("Missing code");
  if (!businessId) return res.status(400).send("Missing state/businessId");

  const oauth2 = makeOAuthClient();
  const { tokens } = await oauth2.getToken(code);

  if (!tokens.refresh_token) {
    return res
      .status(400)
      .send("No refresh_token returned. Try reconnecting or revoke access and try again.");
  }

  await Business.updateOne(
    { _id: businessId },
    {
      $set: {
        googleRefreshToken: tokens.refresh_token,
        googleAccessToken: tokens.access_token ?? null,
        googleTokenExpiryDate: tokens.expiry_date ?? null,
        googleCalendarId: "primary",
      },
    }
  );

  return res.status(200).send("Google Calendar connected. You can close this tab.");
}

export async function googleStatus(req: Request, res: Response) {
  const businessId = String(req.query.businessId || "");
  if (!businessId) return res.status(400).json({ ok: false, error: "Missing businessId" });

  const biz = await Business.findById(businessId).select("googleRefreshToken googleCalendarId");
  if (!biz) return res.status(404).json({ ok: false, error: "Business not found" });

  return res.json({
    ok: true,
    connected: Boolean(biz.googleRefreshToken),
    calendarId: biz.googleCalendarId || "primary",
  });
}

export async function googleDisconnect(req: Request, res: Response) {
  const businessId = String(req.body?.businessId || "");
  if (!businessId) return res.status(400).json({ ok: false, error: "Missing businessId" });

  await Business.updateOne(
    { _id: businessId },
    {
      $set: {
        googleRefreshToken: null,
        googleAccessToken: null,
        googleTokenExpiryDate: null,
      },
    }
  );

  return res.json({ ok: true });
}
