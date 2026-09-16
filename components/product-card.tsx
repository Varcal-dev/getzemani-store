"use client"

import type { Product } from "@/lib/shopify"
import { useCart } from "@/context/cart-context"

function formatPrice(product: Product) {
  const { amount, currencyCode } = product.priceRange.minVariantPrice
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(Number(amount))
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, isLoading } = useCart()
  const firstVariant = product.variants.nodes[0]
  return <article className="product-card group flex min-w-0 flex-col"><div className="relative"><a href={`/products/${product.handle}`} className="block overflow-hidden rounded-card bg-card"><div className="relative aspect-[4/5] overflow-hidden"><img className="product-image h-full w-full object-cover" src={product.featuredImage?.url} alt={product.featuredImage?.altText || product.title} loading="lazy" width={product.featuredImage?.width} height={product.featuredImage?.height} /></div></a>{firstVariant && <button className="quick-add absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-ink text-xl leading-none text-paper transition-colors hover:bg-olive-deep disabled:cursor-not-allowed disabled:bg-ink-soft disabled:opacity-60" disabled={isLoading || !firstVariant.availableForSale} onClick={() => addItem(firstVariant.id, 1)} aria-label={firstVariant.availableForSale ? `Add ${product.title} to bag` : "Sold out"}>{firstVariant.availableForSale ? "+" : "×"}</button>}</div><div className="pt-4"><a href={`/products/${product.handle}`}><h3 className="font-serif text-lg leading-tight text-ink hover:text-olive">{product.title}</h3></a><p className="mt-1.5 text-sm text-ink-soft">{formatPrice(product)}</p></div></article>
}
