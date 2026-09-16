import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { ProductDetail } from "@/components/product-detail"
import { getProduct, getRelatedProducts, getCollections } from "@/lib/shopify"

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle).catch(() => null)
  if (!product) return {}

  const description = product.description
    ? product.description.slice(0, 155).trim()
    : `${product.title} — available now at Getzemani.store.`
  const image = product.featuredImage?.url

  return {
    title: `${product.title} | Getzemani`,
    description,
    openGraph: {
      title: product.title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Props) {
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
