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

const CATEGORY_GLYPH: Record<string, string> = {
  skin: "◐",
  body: "◡",
  movement: "◑",
  home: "▢",
};

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
      <SiteHeader collections={collections} />

      {/* Hero */}
      <section className="mx-auto max-w-[1320px] px-5 pb-10 pt-10 lg:px-10 lg:pb-14 lg:pt-14">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="hero-rise">
            <h1 className="max-w-md text-balance font-serif text-[clamp(2.5rem,5vw,3.75rem)] font-normal leading-[1.05] tracking-tight text-ink">
              Care, at the pace of a garden.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-ink-soft">
              Skincare, wellness, and home rituals designed for people
              who&apos;d rather feel better than do more.
            </p>
            <div className="mt-7 flex items-center gap-6">
              <a
                href="#shop"
                className="inline-block rounded-[var(--radius-chip)] bg-olive-deep px-6 py-3 text-sm text-paper transition-colors hover:bg-olive"
              >
                Shop the collection
              </a>
              <a href="#categories" className="underline-grow text-sm text-ink-soft hover:text-ink">
                Browse by ritual
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[6/5] overflow-hidden rounded-[var(--radius-card)]">
              <img
                src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1000&q=85"
                alt="Ritual de cuidado personal con productos naturales"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden w-48 rounded-[var(--radius-card)] bg-brick px-5 py-4 shadow-[0_10px_30px_-12px_rgba(178,58,46,0.55)] sm:block">
              <p className="font-serif text-sm italic leading-snug text-paper">
                Less to do. More that lasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories -- compact chip row instead of a full image grid */}
      <section id="categories" className="border-y border-line py-8">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#shop"
              className="flex items-center gap-2.5 rounded-[var(--radius-chip)] border border-line bg-card px-4 py-2.5 text-sm text-ink transition-colors hover:border-olive hover:text-olive-deep"
            >
              <span aria-hidden className="text-olive">✻</span>
              All products
            </a>
            {collections.map((collection) => (
              <a
                key={collection.id}
                href={`/?category=${collection.handle}#shop`}
                className="flex items-center gap-2.5 rounded-[var(--radius-chip)] border border-line bg-card px-4 py-2.5 text-sm text-ink transition-colors hover:border-olive hover:text-olive-deep"
              >
                <span aria-hidden className="text-olive">
                  {CATEGORY_GLYPH[collection.handle] ?? "◍"}
                </span>
                {collection.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section id="shop" className="mx-auto max-w-[1320px] px-5 py-14 lg:px-10">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl text-ink lg:text-3xl">
            Curated for you.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 lg:grid-cols-5">
          {products.length ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full">No hay productos.</div>
          )}
        </div>
      </section>

      {/* Value strip -- one continuous line rather than four half-empty boxes */}
      <section className="overflow-hidden border-y border-line bg-card py-3.5">
        <div className="ticker-track">
          {[...VALUES, ...VALUES].map((value, i) => (
            <span
              key={i}
              className="flex items-center whitespace-nowrap px-6 text-sm text-ink-soft"
            >
              {value}
              <span aria-hidden className="ml-6 text-brick">
                ·
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* Editorial pull-quote */}
      <section className="mx-auto max-w-[1320px] px-5 py-14 lg:px-10">
        <blockquote className="max-w-xl border-l-2 border-brick pl-6">
          <p className="font-serif text-[clamp(1.4rem,2.6vw,1.9rem)] italic leading-snug text-ink">
            Most wellness brands sell you more to do. We&apos;d rather sell
            you less to think about.
          </p>
        </blockquote>
      </section>

      <SiteFooter />
    </main>
  );
}
