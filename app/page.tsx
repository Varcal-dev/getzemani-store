import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getCollectionProducts, getStorefront } from "@/lib/shopify";

const VALUES = ["Thoughtful formulas", "Made for daily rituals", "Free returns within 30 days", "Real people, real support"];
const CATEGORY_GLYPH: Record<string, string> = { skin: "◐", body: "◡", movement: "◑", home: "▢" };

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const data = await getStorefront();
  const selectedCollection = category ? await getCollectionProducts(category) : null;
  const products = selectedCollection?.products.nodes ?? data.products.nodes;
  const collections = data.collections.nodes;
  return <main id="top" className="min-h-screen bg-paper">
    <SiteHeader collections={collections} />
    <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 pb-16 pt-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:px-10 lg:pb-24 lg:pt-20">
      <div className="hero-rise max-w-xl">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[.24em] text-olive">Everyday rituals for feeling well</p>
        <h1 className="max-w-lg text-balance font-serif text-[clamp(3.3rem,7vw,6.5rem)] leading-[.92] tracking-[-.04em] text-ink">Care, at the pace of a garden.</h1>
        <p className="mt-7 max-w-sm text-[15px] leading-7 text-ink-soft">Skincare, wellness, and home rituals designed for people who&apos;d rather feel better than do more.</p>
        <div className="mt-9 flex items-center gap-7"><a href="#shop" className="bg-olive-deep px-6 py-3.5 text-sm text-paper transition-colors hover:bg-olive">Shop the collection</a><a href="#rituals" className="underline-grow text-sm text-ink-soft hover:text-ink">Find your ritual</a></div>
      </div>
      <div className="relative"><div className="aspect-[5/4] overflow-hidden bg-paper-deep"><img src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200&q=85" alt="A quiet personal care ritual" className="h-full w-full object-cover" /></div><p className="absolute -bottom-7 left-6 max-w-[190px] bg-olive-deep px-5 py-4 font-serif text-lg italic leading-tight text-paper">Less to do. More that lasts.</p></div>
    </section>
    <section id="rituals" className="border-y border-line bg-card px-5 py-14 lg:px-10 lg:py-20"><div className="mx-auto max-w-[1320px]"><div className="mb-10 flex items-end justify-between gap-5"><div><p className="mb-3 text-[11px] font-semibold uppercase tracking-[.22em] text-olive">Start here</p><h2 className="font-serif text-4xl leading-none text-ink lg:text-5xl">Find your ritual.</h2></div><a href="#shop" className="hidden text-sm text-ink-soft underline underline-offset-4 hover:text-ink sm:block">View everything</a></div><div className="grid grid-cols-2 border-l border-t border-line md:grid-cols-4">{collections.map((collection) => <a key={collection.id} href={`/?category=${collection.handle}#shop`} className="group flex min-h-36 flex-col justify-between border-b border-r border-line p-5 transition-colors hover:bg-paper-deep lg:min-h-48 lg:p-7"><span className="text-2xl text-olive">{CATEGORY_GLYPH[collection.handle] ?? "◍"}</span><span className="flex items-center justify-between font-serif text-2xl text-ink"><span>{collection.title}</span><span className="text-sm opacity-0 transition-opacity group-hover:opacity-100">↗</span></span></a>)}</div></div></section>
    <section id="shop" className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-24"><div className="mb-9 flex items-end justify-between"><div><p className="mb-3 text-[11px] font-semibold uppercase tracking-[.22em] text-olive">The edit</p><h2 className="font-serif text-4xl leading-none text-ink lg:text-5xl">Your everyday ritual.</h2></div><span className="text-sm text-ink-soft">{products.length} pieces</span></div><div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-5">{products.length ? products.map((product) => <ProductCard key={product.id} product={product} />) : <p className="col-span-full text-ink-soft">No products found.</p>}</div></section>
    <section className="border-y border-line bg-paper-deep px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-10 md:flex-row md:items-end"><p className="max-w-2xl font-serif text-[clamp(2.3rem,5vw,5rem)] leading-[.95] tracking-[-.03em] text-ink">Feel better.<br /><em>Do less.</em></p><p className="max-w-xs text-sm leading-7 text-ink-soft">A considered collection for the small, daily choices that make a life feel more like your own.</p></div></section>
    <section className="overflow-hidden border-b border-line bg-card py-4"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-center gap-x-10 gap-y-2 px-5 text-[11px] font-semibold uppercase tracking-[.16em] text-ink-soft lg:px-10">{VALUES.map((value) => <span key={value}>{value}</span>)}</div></section>
    <SiteFooter />
  </main>;
}
