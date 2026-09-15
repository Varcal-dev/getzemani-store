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

  return (
    <article className="product-card group flex min-w-0 flex-col">
      <a href={`/products/${product.handle}`} className="block overflow-hidden rounded-[var(--radius-card)] bg-card">
        <div className="relative aspect-[4/5] overflow-hidden">
          {product.featuredImage ? (
            <img
              className="product-image h-full w-full object-cover"
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-soft">Getzemani</div>
          )}
        </div>
      </a>
      <div className="flex items-start justify-between gap-4 pt-4">
        <div className="min-w-0">
          <a href={`/products/${product.handle}`}>
            <h3 className="text-sm font-medium leading-snug text-ink hover:text-olive">{product.title}</h3>
          </a>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-soft">{product.description}</p>
        </div>
        <p className="shrink-0 text-sm text-ink">{formatPrice(product)}</p>
      </div>
      {firstVariant && (
        <button
          className="mt-3 self-start text-xs text-olive underline-grow disabled:opacity-40"
          disabled={isLoading || !firstVariant.availableForSale}
          onClick={() => addItem(firstVariant.id, 1)}
        >
          {firstVariant.availableForSale ? "Add to bag" : "Sold out"}
        </button>
      )}
    </article>
  )
}
