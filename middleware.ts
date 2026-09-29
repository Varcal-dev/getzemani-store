import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "ge_country"

/**
 * Lee el país del visitante desde el header que Vercel agrega
 * automáticamente en el edge (sin necesidad de ningún servicio externo)
 * y lo deja en una cookie legible por el cliente, para que los componentes
 * de carrito/producto puedan decidir si restringen la compra.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const country = request.headers.get("x-vercel-ip-country") ?? ""

  if (country) {
    response.cookies.set(COOKIE_NAME, country, {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|brand|manifest.webmanifest).*)",
}
