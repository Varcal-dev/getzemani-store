import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { FeaturedProductCard } from "@/components/featured-product-card";
import { Reveal } from "@/components/reveal";
import {
  getCollectionProducts,
  getProduct,
  getStorefront,
} from "@/lib/shopify";

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      key?: string | number | symbol | null;
    }

    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// "The Getzemani Way" -- doubles as the trust strip, so the promise isn't repeated twice
const WAY = [
  ["Curated", "We don't believe in more. We believe in better choices."],
  ["Simple", "Products designed to fit naturally into everyday life."],
  ["Thoughtful", "Beauty and wellness without unnecessary complexity."],
  ["Human", "Real support from real people."],
];

const RITUAL_HANDLES = ["skin", "body", "movement", "home"];

const RITUAL_TAGLINE: Record<string, string> = {
  skin: "Glow & care",
  body: "Everyday self-care",
  movement: "Slow down & feel better",
  home: "Create your space",
};

// The four products the Edit opens with -- confirmed live on the store
const EDIT_HANDLES = [
  "led-facial-beauty-mask-for-at-home-skincareled-facial-beauty-mask",
  "natural-resin-gua-sha-facial-massage-tool",
  "facial-cleansing-brush-3in1-rechargeable",
  "salt-rock-aromatherapy-diffuser",
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [data, selectedCollection, editProducts] = await Promise.all([
    getStorefront(),
    category ? getCollectionProducts(category) : Promise.resolve(null),
    Promise.all(EDIT_HANDLES.map((handle) => getProduct(handle))),
  ]);

  const products = selectedCollection?.products.nodes ?? data.products.nodes;
  const collections = data.collections.nodes;
  const ritualCollections = RITUAL_HANDLES.map((handle) =>
    collections.find((collection) => collection.handle === handle),
  )
    .filter(Boolean)
    .slice(0, 4);
  const featured = editProducts.filter(Boolean);

  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader collections={collections} overMedia />

      {/* Hero -- full-bleed editorial campaign, header rides transparent on top */}
      <section className="relative flex h-[86vh] min-h-[560px] items-end overflow-hidden lg:h-[92vh]">
        <img
          src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=2200&q=85"
          alt="A quiet skincare ritual with a jade facial roller on natural linen"
          className="hero-image-in absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent"
        />
        <div className="hero-rise relative mx-auto w-full max-w-[1320px] px-5 pb-16 lg:px-10 lg:pb-24">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.3em] text-paper/80">
            Getzemani
          </p>
          <h1 className="max-w-2xl text-balance font-serif text-[clamp(2.75rem,6vw,5.5rem)] leading-[.98] tracking-[-.03em] text-paper">
            Care, at the pace of a garden.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-paper/85">
            Skincare, wellness, and everyday essentials designed for people
            who&apos;d rather feel better than do more.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href="#shop"
              className="bg-terracotta px-7 py-4 text-xs font-semibold uppercase tracking-[.12em] text-paper transition-colors hover:bg-terracotta-deep"
            >
              Shop the collection
            </a>
            <a
              href="#rituals"
              className="underline-grow text-xs font-semibold uppercase tracking-[.12em] text-paper/90 hover:text-paper"
            >
              Find your ritual
            </a>
          </div>
        </div>
      </section>

      {/* The Getzemani Way -- brand promise, doubling as the trust strip */}
      <Reveal
        as="section"
        aria-label="The Getzemani way"
        className="border-y border-line bg-card px-5 py-12 lg:px-10 lg:py-14"
      >
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-10">
          {WAY.map(([title, text]) => (
            <div key={title} className="max-w-xs">
              <p className="font-serif text-lg text-terracotta">{title}</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* The Getzemani Edit -- four featured products */}
      {featured.length > 0 && (
        <Reveal
          as="section"
          className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-24"
        >
          <div className="mb-12 max-w-xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-terracotta">
              The Getzemani edit
            </p>
            <h2 className="font-serif text-5xl leading-none tracking-[-.03em] text-ink lg:text-6xl">
              Your everyday ritual.
            </h2>
            <p className="mt-5 text-base leading-7 text-ink-soft">
              Four simple essentials worth making space for.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {featured.map((product) => (
              <FeaturedProductCard key={product!.id} product={product!} />
            ))}
          </div>
        </Reveal>
      )}

      <section
        id="shop"
        className="mx-auto max-w-[1320px] px-5 pb-16 lg:px-10 lg:pb-24"
      >
        <div className="mb-10 max-w-xl">
          <h2 className="font-serif text-4xl leading-none tracking-[-.03em] text-ink lg:text-5xl">
            {selectedCollection ? selectedCollection.title : "Shop everything"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:gap-y-16">
          {products.length ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-ink-soft">No products found.</p>
          )}
        </div>
      </section>

      {ritualCollections.length > 0 && (
        <Reveal
          as="section"
          id="rituals"
          className="border-y border-line bg-paper-deep px-5 py-16 lg:px-10 lg:py-24"
        >
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-12 max-w-xl">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-terracotta">
                Explore your everyday
              </p>
              <h2 className="font-serif text-5xl leading-none tracking-[-.03em] text-ink lg:text-6xl">
                Find your ritual.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-ink-soft">
                Choose the part of your everyday life you want to care for.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {ritualCollections.map(
                (collection) =>
                  collection && (
                    <a
                      key={collection.id}
                      href={`/?category=${collection.handle}#shop`}
                      className="group block"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-card">
                        {collection.image ? (
                          <img
                            src={collection.image.url}
                            alt={collection.image.altText || collection.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-olive-pale" />
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-3 pt-5">
                        <div>
                          <h3 className="font-serif text-3xl text-ink">
                            {collection.handle === "movement"
                              ? "Wellness"
                              : collection.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-ink-soft">
                            {RITUAL_TAGLINE[collection.handle] ?? ""}
                          </p>
                        </div>
                        <span className="underline-grow shrink-0 pt-1.5 text-sm text-terracotta">
                          Shop
                        </span>
                      </div>
                    </a>
                  ),
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* Editorial visual moment -- a pure breathing pause between rituals and the brand */}
      <Reveal as="section" id="philosophy" className="relative flex h-[70vh] min-h-[440px] items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1585652757173-57de5e9fab42?auto=format&fit=crop&w=1800&q=85"
          alt="A quiet corner set up for an evening ritual"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div aria-hidden className="absolute inset-0 bg-olive-deep/55" />
        <div className="relative mx-auto w-full max-w-[1320px] px-5 lg:px-10">
          <h2 className="max-w-xl font-serif text-[clamp(2.75rem,6vw,5rem)] leading-[.95] tracking-[-.03em] text-paper">
            Feel better.
            <br />
            <em>Do less.</em>
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-paper/85">
            Most wellness brands sell you more to do. We&apos;d rather give
            you less to think about.
          </p>
        </div>
      </Reveal>

      {/* Final CTA */}
      <Reveal
        as="section"
        className="bg-olive-deep px-5 py-20 text-center text-paper lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-xl">
          <h2 className="font-serif text-4xl leading-tight tracking-[-.02em] lg:text-5xl">
            Make space for your ritual.
          </h2>
          <p className="mt-5 text-base leading-7 text-paper/75">
            Discover simple essentials for skin, body and everyday wellness.
          </p>
          <a
            href="#shop"
            className="mt-8 inline-block bg-terracotta px-8 py-4 text-xs font-semibold uppercase tracking-[.12em] text-paper transition-colors hover:bg-terracotta-deep"
          >
            Shop Getzemani
          </a>
        </div>
      </Reveal>

      <SiteFooter />
    </main>
  );
}
