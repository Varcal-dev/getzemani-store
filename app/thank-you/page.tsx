import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getCollections } from "@/lib/shopify"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>
}) {
  const { order, email } = await searchParams
  const collections = await getCollections().catch(() => [])

  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader collections={collections} />

      <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center lg:py-32">
        <div className="organic-mask flex h-20 w-20 items-center justify-center bg-olive-pale">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-olive-deep">
            <path d="M4 12.5 9.5 18 20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="mt-8 font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-tight text-ink">
          Thank you. Your ritual is on its way.
        </h1>

        <p className="mt-5 max-w-md text-sm leading-6 text-ink-soft">
          {email
            ? `We've sent a confirmation to ${email} with everything you need to track your order.`
            : "We've sent a confirmation email with everything you need to track your order."}
        </p>

        {order && (
          <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-card px-8 py-5">
            <p className="text-xs text-ink-soft">Order number</p>
            <p className="mt-1 font-serif text-xl text-ink">{order}</p>
          </div>
        )}

        <a
          href="/#shop"
          className="mt-10 inline-block rounded-full bg-olive-deep px-7 py-3.5 text-sm text-paper transition-colors hover:bg-olive"
        >
          Continue exploring
        </a>
      </section>

      <SiteFooter />
    </main>
  )
}
