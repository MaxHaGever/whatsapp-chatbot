import { google } from "googleapis";

export function makeOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getCalendarScopes(): string[] {
  const raw =
    process.env.GOOGLE_CALENDAR_SCOPES ||
    "https://www.googleapis.com/auth/calendar.events";

  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
