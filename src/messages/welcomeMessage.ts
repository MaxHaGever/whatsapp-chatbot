// src/messages/welcome.messages.ts
import type { Lang } from "../models/Client";

type WelcomeOptions = {
  lang: Lang;
  customWelcome?: string | null;
  businessName?: string | null;
  includeLanguageChooser?: boolean;
};

function clean(s?: string | null) {
  return (s ?? "").trim();
}

const INSTRUCTIONS: Record<Lang, string> = {
  en: [
    "This is an automated chatbot.",
    "You can write freely, in your own words.",
    "You do not need to use a specific format — just tell me what you want.",
    "For example: book an appointment, update an existing appointment, or cancel an appointment.",
  ].join("\n"),

  he: [
    "זהו צ'אטבוט אוטומטי.",
    "אפשר לכתוב חופשי, במילים שלכם.",
    "אין צורך בפורמט מסוים — פשוט כתבו מה אתם רוצים.",
    "לדוגמה: לקבוע תור, לעדכן תור קיים, או לבטל תור.",
  ].join("\n"),

  ru: [
    "Это автоматический чат-бот.",
    "Вы можете писать свободно, своими словами.",
    "Не нужен специальный формат — просто напишите, что вы хотите.",
    "Например: записаться, изменить существующую запись или отменить запись.",
  ].join("\n"),

  fr: [
    "Ceci est un chatbot automatisé.",
    "Vous pouvez écrire librement, avec vos propres mots.",
    "Aucun format particulier n’est nécessaire — dites simplement ce que vous voulez.",
    "Par exemple : réserver, modifier un rendez-vous existant, ou annuler un rendez-vous.",
  ].join("\n"),
};

const LANGUAGE_CHOOSER_LINES = [
  "For English, write: English",
  "Pour le français, écrivez : Français",
  "Для русского языка напишите: Русский",
].join("\n");

export function buildWelcomeMessage(opts: WelcomeOptions) {
  const custom = clean(opts.customWelcome);
  const name = clean(opts.businessName);

  const header = custom
    ? custom
    : name
      ? `Hello, welcome to ${name}.`
      : "Hello.";

  const blocks: string[] = [header];

  if (opts.includeLanguageChooser) {
    blocks.push(LANGUAGE_CHOOSER_LINES);
  }

  blocks.push(INSTRUCTIONS[opts.lang]);

  return blocks.filter(Boolean).join("\n\n");
}
