import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getCollectionProducts, getStorefront } from "@/lib/shopify";

const VALUES = [
  "Free returns within 30 days",
  "Ingredients you can pronounce",
  "Carbon-neutral shipping",
  "Real people, real support",
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const data = await getStorefront();
  const selectedCollection = category
    ? await getCollectionProducts(category)
    : null;
  const products = selectedCollection?.products.nodes ?? data.products.nodes;
  const collections = data.collections.nodes;

  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-[1320px] px-5 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="hero-rise">
            <h1 className="max-w-lg text-balance font-serif text-[clamp(2.75rem,5.5vw,4.5rem)] font-normal leading-[1.04] tracking-tight text-ink">
              Care, at the pace of a garden.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-ink-soft">
              Skincare, wellness, and home rituals designed for people
              who&apos;d rather feel better than do more.
            </p>
            <a
              href="#shop"
              className="mt-9 inline-block rounded-full bg-olive-deep px-7 py-3.5 text-sm text-paper transition-colors hover:bg-olive"
            >
              Shop the collection
            </a>
          </div>
          <div className="organic-mask relative aspect-[4/5] overflow-hidden lg:aspect-[5/6]">
            <img
              src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200&q=85"
              alt="Ritual de cuidado personal con productos naturales"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="border-y border-line bg-card/60 py-20"
      >
        <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
          <h2 className="max-w-md font-serif text-3xl leading-tight text-ink lg:text-4xl">
            Find your ritual.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <a href="/#shop" className="group block">
              <div className="flex aspect-[4/5] items-end overflow-hidden rounded-[var(--radius-card)] bg-olive-deep p-5">
                <span className="font-serif text-2xl text-paper">All products</span>
              </div>
              <h3 className="mt-3 text-sm font-medium text-ink">Everything</h3>
              <p className="mt-1 text-xs leading-5 text-ink-soft">Browse the full Shopify catalog.</p>
            </a>
            {collections.map((collection) => (
              <a key={collection.id} href={`/?category=${collection.handle}#shop`} className="group block">
                <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-card">
                  {collection.image ? (
                    <img
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-end bg-olive p-5">
                      <span className="font-serif text-2xl text-paper">{collection.title}</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-medium text-ink">{collection.title}</h3>
                <p className="mt-1 text-xs leading-5 text-ink-soft">See products in this collection.</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section id="shop" className="mx-auto max-w-[1320px] px-5 py-20 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink lg:text-4xl">
            Curated for you.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
          {products.length ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full">No hay productos.</div>
          )}
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y border-line">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div
              key={value}
              className="border-r border-line px-5 py-8 last:border-r-0 lg:px-10"
            >
              <p className="text-sm leading-6 text-ink">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial pull-quote */}
      <section className="bg-olive-deep py-24">
        <div className="mx-auto max-w-2xl px-5 text-center lg:px-10">
          <p className="font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] italic leading-tight text-paper">
            Most wellness brands sell you more to do. We&apos;d rather sell you
            less to think about.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
