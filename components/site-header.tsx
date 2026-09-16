"use client"

import { useState } from "react"
import { useCart } from "@/context/cart-context"
import type { Collection } from "@/lib/shopify"

export function SiteHeader({ collections }: { collections: Collection[] }) {
  const [open, setOpen] = useState(false)
  const { cart, openCart } = useCart()
  const count = cart?.totalQuantity ?? 0

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5 py-4 lg:px-10">
        <a
          href="/"
          className="shrink-0 font-serif text-xl italic tracking-tight text-ink"
        >
          Getzemani
        </a>

        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          {collections.map((c) => (
            <a
              key={c.id}
              href={`/?category=${c.handle}#shop`}
              className="underline-grow hover:text-ink"
            >
              {c.title}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            onClick={openCart}
            className="flex items-center gap-2 text-sm text-ink hover:text-olive"
            aria-label="Abrir bolsa"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z"
                strokeLinejoin="round"
              />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>

            <span>Bag{count > 0 ? ` (${count})` : ""}</span>
          </button>

          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            <span className="block h-px w-5 bg-ink" />
            <span className="block h-px w-5 bg-ink" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-ink-soft">
            {collections.map((c) => (
              <a
                key={c.id}
                href={`/?category=${c.handle}#shop`}
                onClick={() => setOpen(false)}
              >
                {c.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}