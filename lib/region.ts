const ALLOWED_COUNTRY = "US"
const COOKIE_NAME = "ge_country"

export const REGION_RESTRICTED_MESSAGE =
  "We currently ship within the United States only."

export function getCountryCookie(): string | null {
  if (typeof document === "undefined") return null

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
  )

  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Sin país detectado (localhost, cookies bloqueadas, primer render en el
 * servidor, etc.) NO restringimos — es mejor dejar pasar de más que
 * bloquear a un comprador real de EE. UU. por un falso negativo.
 * La barrera real sigue siendo Shopify Markets/envío; esto es solo una
 * mejora de experiencia para no llevar a nadie a un checkout roto.
 */
export function isRegionRestricted(country: string | null): boolean {
  if (!country) return false
  return country.toUpperCase() !== ALLOWED_COUNTRY
}
