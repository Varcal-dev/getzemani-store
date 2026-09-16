"use client";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import type { Collection } from "@/lib/shopify";

export function SiteHeader({ collections }: { collections: Collection[] }) {
  const [open, setOpen] = useState(false);
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;
  return <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md"><div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5 py-5 lg:px-10"><a href="/" className="font-serif text-[1.45rem] tracking-[-.03em] text-ink">Getzemani</a><nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[.15em] text-ink-soft md:flex">{collections.map((c) => <a key={c.id} href={`/?category=${c.handle}#shop`} className="underline-grow hover:text-ink">{c.title}</a>)}</nav><div className="flex items-center gap-5"><button onClick={openCart} className="text-xs font-semibold uppercase tracking-[.12em] text-ink hover:text-olive" aria-label="Open bag">Bag{count > 0 ? ` (${count})` : ""}</button><button className="flex flex-col gap-1.5 md:hidden" onClick={() => setOpen(!open)} aria-label="Open menu" aria-expanded={open}><span className="block h-px w-5 bg-ink" /><span className="block h-px w-5 bg-ink" /></button></div></div>{open && <div className="border-t border-line px-5 py-5 md:hidden"><nav className="flex flex-col gap-4 text-sm text-ink-soft">{collections.map((c) => <a key={c.id} href={`/?category=${c.handle}#shop`} onClick={() => setOpen(false)}>{c.title}</a>)}</nav></div>}</header>;
}
