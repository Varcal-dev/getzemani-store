import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { ProductDetail } from "@/components/product-detail"
import { getProduct, getRelatedProducts, getCollections } from "@/lib/shopify"

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProduct(handle).catch(() => null)
  if (!product) notFound()

  const [related, collections] = await Promise.all([
    getRelatedProducts(handle).catch(() => []),
    getCollections().catch(() => []),
  ])

  return (
    <main id="top" className="min-h-screen bg-paper">
      <SiteHeader collections={collections} />
      <section className="mx-auto max-w-[1320px] px-5 py-14 lg:px-10 lg:py-20">
        <ProductDetail product={product} />
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-card/60 py-20">
          <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
            <h2 className="mb-10 font-serif text-3xl text-ink lg:text-4xl">You may also like.</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  )
}