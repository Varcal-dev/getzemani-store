import type { Metadata } from "next"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { CartDrawer } from "@/components/cart-drawer"

export const metadata: Metadata = {
  title: "Getzemani — Skin, body, and home rituals",
  description: "Skincare, wellness, movement, and home goods for a quieter kind of self-care.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-paper">
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
