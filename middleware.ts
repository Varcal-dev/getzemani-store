import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COUNTRY_COOKIE = "ge_country"
const FBC_COOKIE = "_fbc"
const EXTERNAL_ID_COOKIE = "ge_eid"

/**
 * - País del visitante (ya existente): viene del header que Vercel agrega
 *   automáticamente en el edge, sin servicio externo.
 * - _fbc propio: si llega `fbclid` en la URL y todavía no existe la cookie
 *   `_fbc` (la que pone fbevents.js), la creamos nosotros con el formato
 *   oficial de Meta `fb.1.<timestamp_ms>.<fbclid>`, usando el fbclid TAL
 *   CUAL llega — sin minúsculas, sin recodificar — para evitar el aviso de
 *   "fbclid modificado" en Events Manager. Si la cookie de fbevents.js ya
 *   existe, no la tocamos (puede tener más contexto, como el subdominio).
 * - external_id propio: un id anónimo y persistente por visitante, para que
 *   siempre haya al menos un identificador fuerte en los eventos de la
 *   Conversions API, incluso si fbp/fbc todavía no cargaron.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const country = request.headers.get("x-vercel-ip-country") ?? ""
  if (country) {
    response.cookies.set(COUNTRY_COOKIE, country, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    })
  }

  const fbclid = request.nextUrl.searchParams.get("fbclid")
  const existingFbc = request.cookies.get(FBC_COOKIE)?.value

  if (fbclid && !existingFbc) {
    response.cookies.set(FBC_COOKIE, `fb.1.${Date.now()}.${fbclid}`, {
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      sameSite: "lax",
    })
  }

  if (!request.cookies.get(EXTERNAL_ID_COOKIE)?.value) {
    response.cookies.set(EXTERNAL_ID_COOKIE, crypto.randomUUID(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|brand|manifest.webmanifest).*)",
}
