import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { getCollectionProducts, getStorefront } from "@/lib/shopify"

const TRUST_POINTS = [
  ["Curated essentials", "Thoughtfully selected for everyday rituals."],
  ["Made for everyday", "Simple products that fit naturally into your routine."],
  ["30-day returns", "A little more room to find what works for you."],
  ["Real people, real support", "Helpful care from our small team."],
]

const RITUAL_HANDLES = ["skin", "body", "wellness", "movement"]

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const data = await getStorefront()
  const selectedCollection = category ? await getCollectionProducts(category) : null
  const products = selectedCollection?.products.nodes ?? data.products.nodes
  const collections = data.collections.nodes
  const ritualCollections = RITUAL_HANDLES.map((handle) => collections.find((collection) => collection.handle === handle)).filter(Boolean).slice(0, 3)

  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader collections={collections} />

      <section className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="hero-rise max-w-xl">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[.24em] text-olive">Skincare · body care · everyday wellness</p>
          <h1 className="max-w-lg text-balance font-serif text-[clamp(3.5rem,7vw,6.8rem)] leading-[.9] tracking-[-.045em] text-ink">Care, at the pace of a garden.</h1>
          <p className="mt-8 max-w-md text-base leading-7 text-ink-soft">Skincare, wellness, and everyday essentials designed for people who&apos;d rather feel better than do more.</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"><a href="#shop" className="bg-ink px-7 py-4 text-sm text-paper transition-colors hover:bg-olive-deep">Shop the collection</a><a href="#rituals" className="underline-grow text-sm text-ink-soft hover:text-ink">Find your ritual</a></div>
        </div>
        <div className="relative lg:pt-2"><div className="aspect-[5/4] overflow-hidden bg-paper-deep"><img src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1400&q=85" alt="A quiet personal care ritual" className="h-full w-full object-cover" /></div><p className="absolute -bottom-7 left-6 max-w-[190px] bg-olive-deep px-5 py-4 font-serif text-lg italic leading-tight text-paper">Less to do. More that lasts.</p></div>
      </section>

      <section aria-label="Why Getzemani" className="border-y border-line bg-card px-5 py-12 lg:px-10 lg:py-16"><div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-10">{TRUST_POINTS.map(([title, text]) => <div key={title} className="max-w-xs"><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-ink">{title}</p><p className="mt-3 text-sm leading-6 text-ink-soft">{text}</p></div>)}</div></section>

      <section id="shop" className="mx-auto max-w-[1320px] px-5 py-20 lg:px-10 lg:py-28"><div className="mb-10 max-w-xl"><p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-olive">The everyday edit</p><h2 className="font-serif text-5xl leading-none tracking-[-.03em] text-ink lg:text-6xl">Your everyday ritual.</h2><p className="mt-5 text-base leading-7 text-ink-soft">Six simple essentials for the rituals that make your day feel better.</p></div><div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:gap-y-16">{products.length ? products.map((product) => <ProductCard key={product.id} product={product} />) : <p className="col-span-full text-ink-soft">No products found.</p>}</div></section>

      {ritualCollections.length > 0 && <section id="rituals" className="border-y border-line bg-paper-deep px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-[1320px]"><div className="mb-12 max-w-xl"><p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-olive">A little less searching</p><h2 className="font-serif text-5xl leading-none tracking-[-.03em] text-ink lg:text-6xl">Find your ritual.</h2><p className="mt-5 text-base leading-7 text-ink-soft">Explore simple essentials designed around the way you care for yourself.</p></div><div className="grid gap-5 md:grid-cols-3">{ritualCollections.map((collection) => collection && <a key={collection.id} href={`/?category=${collection.handle}#shop`} className="group block"><div className="aspect-[4/3] overflow-hidden bg-card">{collection.image ? <img src={collection.image.url} alt={collection.image.altText || collection.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" /> : <div className="h-full w-full bg-olive-pale" />}</div><div className="flex items-start justify-between gap-4 pt-5"><div><h3 className="font-serif text-3xl text-ink">{collection.handle === "movement" ? "Wellness" : collection.title}</h3><p className="mt-2 max-w-[220px] text-sm leading-6 text-ink-soft">{collection.handle === "skin" ? "Face care, blemish care & skincare tools." : collection.handle === "body" ? "Personal care & everyday essentials." : "Comfort, posture & everyday wellbeing."}</p></div><span className="pt-1 text-[11px] font-semibold uppercase tracking-[.12em] text-olive transition-transform group-hover:translate-x-1">Shop {collection.handle === "movement" ? "wellness" : collection.title} →</span></div></a>)}</div></div></section>}

      <section className="bg-paper px-5 py-24 lg:min-h-[60vh] lg:px-10 lg:py-32"><div className="mx-auto flex max-w-[1320px] flex-col justify-center gap-10"><p className="text-[11px] font-semibold uppercase tracking-[.22em] text-olive">Our philosophy</p><h2 className="max-w-4xl font-serif text-[clamp(4rem,10vw,9rem)] leading-[.82] tracking-[-.06em] text-ink">Feel better.<br /><em>Do less.</em></h2><p className="max-w-md text-base leading-7 text-ink-soft">Most wellness brands sell you more to do. We&apos;d rather give you less to think about.</p></div></section>

      <section className="bg-olive-deep px-5 py-20 text-paper lg:px-10 lg:py-28"><div className="mx-auto flex max-w-[1320px] flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-paper/60">Make space for your ritual.</p><h2 className="max-w-2xl font-serif text-5xl leading-[.92] tracking-[-.04em] lg:text-7xl">Simple essentials for skin, body & everyday wellness.</h2></div><a href="#shop" className="shrink-0 self-start border border-paper/50 px-6 py-3.5 text-sm transition-colors hover:bg-paper hover:text-olive-deep md:self-end">Shop the collection →</a></div></section>
      <SiteFooter />
    </main>
  )
}
