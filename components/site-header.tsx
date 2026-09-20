"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import type { Collection } from "@/lib/shopify"

const NAV_ORDER = ["skin", "body", "wellness", "movement", "home"]

export function SiteHeader({
  collections,
  overMedia = false,
}: {
  collections: Collection[]
  /** true when the header opens on top of a full-bleed hero image and should start transparent */
  overMedia?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { cart, openCart } = useCart()
  const count = cart?.totalQuantity ?? 0
  const navCollections = NAV_ORDER.map((handle) =>
    collections.find((collection) => collection.handle === handle),
  ).filter(Boolean)

  useEffect(() => {
    if (!overMedia) return
    const onScroll = () => setScrolled(window.scrollY > 64)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [overMedia])

  const transparent = overMedia && !scrolled
  const logoSrc = transparent
    ? "/brand/logo-horizontal-dark.png"
    : "/brand/logo-horizontal.png"

  return (
    <header
      className={`site-header z-40 border-b ${overMedia ? "fixed inset-x-0 top-0" : "sticky top-0"}`}
      data-scrolled={scrolled}
      data-over-media={overMedia}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5 py-5 lg:px-10">
        <a href="/" className="flex items-center" aria-label="Getzemani.store — inicio">
          <Image
            src={logoSrc}
            alt="Getzemani.store"
            width={1558}
            height={240}
            priority
            className="h-8 w-auto md:h-9"
          />
        </a>
        <nav
          className={`hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[.15em] md:flex ${
            transparent ? "text-paper/90" : "text-ink-soft"
          }`}
        >
          {navCollections.map((collection) => (
            <a
              key={collection?.id}
              href={`/?category=${collection?.handle}#shop`}
              className={`underline-grow ${transparent ? "hover:text-paper" : "hover:text-ink"}`}
            >
              {collection?.handle === "movement" ? "Wellness" : collection?.title}
            </a>
          ))}
          <a
            href="/#philosophy"
            className={`underline-grow ${transparent ? "hover:text-paper" : "hover:text-ink"}`}
          >
            Our story
          </a>
        </nav>
        <div className="flex items-center gap-5">
          <button
            onClick={openCart}
            className={`text-xs font-semibold uppercase tracking-[.12em] ${
              transparent ? "text-paper hover:text-paper/70" : "text-ink hover:text-olive"
            }`}
            aria-label="Open bag"
          >
            Bag{count > 0 ? ` (${count})` : ""}
          </button>
          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span className={`block h-px w-5 ${transparent ? "bg-paper" : "bg-ink"}`} />
            <span className={`block h-px w-5 ${transparent ? "bg-paper" : "bg-ink"}`} />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-paper px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-ink-soft">
            {navCollections.map((collection) => (
              <a
                key={collection?.id}
                href={`/?category=${collection?.handle}#shop`}
                onClick={() => setOpen(false)}
              >
                {collection?.handle === "movement" ? "Wellness" : collection?.title}
              </a>
            ))}
            <a href="/#philosophy" onClick={() => setOpen(false)}>
              Our story
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
