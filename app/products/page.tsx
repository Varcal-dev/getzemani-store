import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getCollectionProducts, getStorefront } from "@/lib/shopify";
import { PRODUCT_TAGLINE } from "@/lib/product-copy";

export const metadata: Metadata = {
  title: "Shop all | Getzemani",
  description: "The full Getzemani catalog — skincare, body care, and everyday wellness essentials.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [data, selectedCollection] = await Promise.all([
    getStorefront(),
    category ? getCollectionProducts(category) : Promise.resolve(null),
  ]);

  const products = selectedCollection?.products.nodes ?? data.products.nodes;
  const collections = data.collections.nodes;

  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader collections={collections} />
      <section className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-terracotta">
            Getzemani
          </p>
          <h1 className="font-serif text-4xl leading-none tracking-[-.03em] text-ink lg:text-5xl">
            {selectedCollection ? selectedCollection.title : "Shop all"}
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:gap-y-16">
          {products.length ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                tagline={PRODUCT_TAGLINE[product.handle]}
              />
            ))
          ) : (
            <p className="col-span-full text-ink-soft">No products found.</p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
