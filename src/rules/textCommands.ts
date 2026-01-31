function normalize(t: string) {
  return t.trim().toLowerCase();
}

export function isResetCommand(text: string): boolean {
  const t = normalize(text);
  return t === "reset" || t === "איפוס";
}

export function isCancelAppointment(text: string): boolean {
    const t = normalize(text);
    return t === "ביטול" || t === "לבטל";
}

export function isFrench(text: string): boolean {
  const t = normalize(text);
  return t === "français" || t === "צרפתית";
}

export function isEnglish(text: string): boolean {
  const t = normalize(text);
  return t === "english" || t === "אנגלית";
}

export function isRussian(text: string): boolean {
  const t = normalize(text);
  return t === "русский" || t === "רוסי";
}
