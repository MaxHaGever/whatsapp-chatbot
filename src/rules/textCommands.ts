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