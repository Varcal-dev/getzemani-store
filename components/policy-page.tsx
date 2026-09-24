import type { ReactNode } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Collection } from "@/lib/shopify"

export function PolicyPage({
  collections,
  eyebrow,
  title,
  intro,
  children,
}: {
  collections: Collection[]
  eyebrow: string
  title: string
  intro?: string
  children: ReactNode
}) {
  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader collections={collections} />
      <section className="mx-auto max-w-[760px] px-5 py-16 lg:px-10 lg:py-24">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-terracotta">
          {eyebrow}
        </p>
        <h1 className="font-serif text-4xl leading-[1.02] tracking-[-.03em] text-ink lg:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">
            {intro}
          </p>
        )}
        <div className="policy-content mt-12 space-y-10">{children}</div>
      </section>
      <SiteFooter />
    </main>
  )
}

export function PolicySection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="border-t border-line pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-ink-soft">
        {children}
      </div>
    </div>
  )
}
