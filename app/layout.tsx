import type { Metadata } from "next"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { CartDrawer } from "@/components/cart-drawer"

export const metadata: Metadata = {
  title: "Getzemani — Everyday rituals for feeling well",
  description: "Carefully selected skincare, body care, and everyday wellness essentials for a quieter kind of self-care.",
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
