/** WhatsApp opener with a clear, structured intro (*bold* greeting for WhatsApp formatting). */
export const WHATSAPP_DEFAULT_MESSAGE = [
  "*Hello Prince Parfait GANZA,*",
  "",
  "I would like to get in touch for a professional conversation.",
  "",
  "Looking forward to hearing from you.",
].join("\n");

export function whatsappContactUrl(
  digitsOrPhone?: string | null,
  message: string = WHATSAPP_DEFAULT_MESSAGE,
): string | null {
  const digits = (digitsOrPhone || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
