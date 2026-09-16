"use client"

import { useState } from "react"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import type { Collection } from "@/lib/shopify"

const NAV_ORDER = ["skin", "body", "wellness", "movement", "home"]

export function SiteHeader({ collections }: { collections: Collection[] }) {
  const [open, setOpen] = useState(false)
  const { cart, openCart } = useCart()
  const count = cart?.totalQuantity ?? 0
  const navCollections = NAV_ORDER.map((handle) => collections.find((collection) => collection.handle === handle)).filter(Boolean)
  return <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md"><div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5 py-5 lg:px-10"><a href="/" className="flex items-center" aria-label="Getzemani.store — inicio"><Image src="/brand/logo-horizontal.png" alt="Getzemani.store" width={1558} height={240} priority className="h-8 w-auto md:h-9" /></a><nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[.15em] text-ink-soft md:flex">{navCollections.map((collection) => <a key={collection?.id} href={`/?category=${collection?.handle}#shop`} className="underline-grow hover:text-ink">{collection?.handle === "movement" ? "Wellness" : collection?.title}</a>)}</nav><div className="flex items-center gap-5"><button onClick={openCart} className="text-xs font-semibold uppercase tracking-[.12em] text-ink hover:text-olive" aria-label="Open bag">Bag{count > 0 ? ` (${count})` : ""}</button><button className="flex flex-col gap-1.5 md:hidden" onClick={() => setOpen(!open)} aria-label="Open menu" aria-expanded={open}><span className="block h-px w-5 bg-ink" /><span className="block h-px w-5 bg-ink" /></button></div></div>{open && <div className="border-t border-line px-5 py-5 md:hidden"><nav className="flex flex-col gap-4 text-sm text-ink-soft">{navCollections.map((collection) => <a key={collection?.id} href={`/?category=${collection?.handle}#shop`} onClick={() => setOpen(false)}>{collection?.handle === "movement" ? "Wellness" : collection?.title}</a>)}</nav></div>}</header>
}
