import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeaturedProductCard } from "@/components/featured-product-card";
import { Reveal } from "@/components/reveal";
import { HeroCarousel } from "@/components/hero-carousel";
import { getCollectionProducts, getProduct, getStorefront } from "@/lib/shopify";

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

// Why Getzemani -- single, minimal trust section (replaces the old
// "Getzemani Way" strip + the separate "Why Getzemani" block, which said
// the same thing twice)
const WHY = [
  "Thoughtfully chosen.",
  "Simple to use.",
  "Made for everyday life.",
];

const RITUAL_HANDLES = ["skin", "body", "evening", "home"];

const RITUAL_TAGLINE: Record<string, string> = {
  skin: "Glow & care",
  body: "Everyday self-care",
  evening: "Slow down & unwind",
  home: "Create your space",
};

// "The Getzemani Edit" -- to change which products show here, go to
// Shopify Admin > Products > Collections and add/remove products from the
// collection with this handle. No code changes or redeploy needed.
const EDIT_COLLECTION_HANDLE = "the-getzemani-edit";
const EDIT_MAX = 4;

// Used only if the collection above doesn't exist yet (or is empty) --
// safe to delete once the collection is set up in Shopify Admin.
const EDIT_FALLBACK_HANDLES = [
  "led-facial-beauty-mask-for-at-home-skincareled-facial-beauty-mask",
  "natural-resin-gua-sha-facial-massage-tool",
  "facial-cleansing-brush-3in1-rechargeable",
  "salt-rock-aromatherapy-diffuser",
];

export default async function Home() {
  const [data, editCollection] = await Promise.all([
    getStorefront(),
    getCollectionProducts(EDIT_COLLECTION_HANDLE),
  ]);

  const editProducts = editCollection?.products.nodes.length
    ? editCollection.products.nodes
    : await Promise.all(EDIT_FALLBACK_HANDLES.map((handle) => getProduct(handle)));

  const collections = data.collections.nodes;
  const ritualCollections = RITUAL_HANDLES.map((handle) =>
    collections.find((collection) => collection.handle === handle),
  )
    .filter(Boolean)
    .slice(0, 4);
  const featured = editProducts.filter(Boolean).slice(0, EDIT_MAX);

  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader collections={collections} overMedia />

      {/* Hero -- full-bleed editorial campaign carousel */}
      <HeroCarousel />

      {/* Why Getzemani -- single minimal trust line, answers "why buy here" */}
      <Reveal
        as="section"
        aria-label="Why Getzemani"
        className="border-y border-line bg-card px-5 py-12 lg:px-10 lg:py-14"
      >
        <div className="mx-auto max-w-[1320px]">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[.22em] text-terracotta">
            Why Getzemani
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            {WHY.map((line) => (
              <p key={line} className="font-serif text-xl text-ink lg:text-2xl">
                {line}
              </p>
            ))}
          </div>
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
              A few simple essentials worth making space for.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {featured.map((product) => (
              <FeaturedProductCard key={product!.id} product={product!} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href="/products"
              className="underline-grow text-sm font-semibold uppercase tracking-[.12em] text-terracotta"
            >
              Explore all products →
            </a>
          </div>
        </Reveal>
      )}

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
                      href={`/products?category=${collection.handle}`}
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
                            {collection.title} Ritual
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
      <Reveal
        as="section"
        id="philosophy"
        className="relative flex h-[70vh] min-h-[440px] items-center overflow-hidden"
      >
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
            Most wellness brands sell you more to do. We&apos;d rather give you
            less to think about.
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
            href="/products"
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
