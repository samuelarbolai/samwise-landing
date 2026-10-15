// n8n "Samwise Phone Code": sends a phone_codes row's code once with the approved WhatsApp template,
// and saves the first call time after verification.
export const PHONE_CODE_HOOK = "https://samuelgiraldoconcha.app.n8n.cloud/webhook/samwise-phone-code"

/** Countries offered in the sign-up phone field. Betas are in Colombia and the US; the rest are common for Spanish speakers. */
export const COUNTRIES = [
  { iso: "CO", dial: "57", flag: "🇨🇴", name: "Colombia" },
  { iso: "US", dial: "1", flag: "🇺🇸", name: "United States" },
  { iso: "MX", dial: "52", flag: "🇲🇽", name: "México" },
  { iso: "ES", dial: "34", flag: "🇪🇸", name: "España" },
  { iso: "AR", dial: "54", flag: "🇦🇷", name: "Argentina" },
  { iso: "CL", dial: "56", flag: "🇨🇱", name: "Chile" },
  { iso: "PE", dial: "51", flag: "🇵🇪", name: "Perú" },
  { iso: "EC", dial: "593", flag: "🇪🇨", name: "Ecuador" },
  { iso: "VE", dial: "58", flag: "🇻🇪", name: "Venezuela" },
  { iso: "PA", dial: "507", flag: "🇵🇦", name: "Panamá" },
  { iso: "CR", dial: "506", flag: "🇨🇷", name: "Costa Rica" },
  { iso: "DO", dial: "1", flag: "🇩🇴", name: "República Dominicana" },
  { iso: "CA", dial: "1", flag: "🇨🇦", name: "Canada" },
  { iso: "GB", dial: "44", flag: "🇬🇧", name: "United Kingdom" },
  { iso: "IL", dial: "972", flag: "🇮🇱", name: "Israel" },
] as const

export type CountryIso = (typeof COUNTRIES)[number]["iso"]

const TZ_COUNTRY: Record<string, CountryIso> = {
  "America/Bogota": "CO",
  "America/Mexico_City": "MX",
  "Europe/Madrid": "ES",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Santiago": "CL",
  "America/Lima": "PE",
  "America/Guayaquil": "EC",
  "America/Caracas": "VE",
  "America/Panama": "PA",
  "America/Costa_Rica": "CR",
  "America/Santo_Domingo": "DO",
  "America/Toronto": "CA",
  "Europe/London": "GB",
  "Asia/Jerusalem": "IL",
}

/** Best guess of the person's country from their timezone, for the default dial code. */
export function countryFromTimezone(tz: string): CountryIso {
  if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz]
  if (tz.startsWith("America/") && !tz.startsWith("America/Argentina")) return "US"
  return "CO"
}

/** Country dial code + what the person typed → E.164. A number typed with a leading + wins over the selector. */
export function toE164(dial: string, typed: string): string {
  const raw = typed.trim()
  const digits = raw.replace(/\D/g, "")
  if (raw.startsWith("+") || raw.startsWith("00")) return "+" + digits.replace(/^00/, "")
  return "+" + dial + digits.replace(/^0+/, "")
}
