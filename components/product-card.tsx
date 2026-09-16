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
      <div className="relative">
        <a href={`/products/${product.handle}`} className="block overflow-hidden rounded-[var(--radius-card)] bg-card">
          <div className="relative aspect-square overflow-hidden">
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
        {firstVariant && (
          <button
            className="quick-add absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brick text-paper shadow-sm transition-colors hover:bg-brick-deep disabled:cursor-not-allowed disabled:bg-ink-soft disabled:opacity-60"
            disabled={isLoading || !firstVariant.availableForSale}
            onClick={() => addItem(firstVariant.id, 1)}
            aria-label={firstVariant.availableForSale ? `Add ${product.title} to bag` : "Sold out"}
          >
            <span aria-hidden className="text-base leading-none">
              {firstVariant.availableForSale ? "+" : "×"}
            </span>
          </button>
        )}
      </div>
      <div className="pt-3">
        <a href={`/products/${product.handle}`}>
          <h3 className="text-sm font-medium leading-snug text-ink hover:text-olive">{product.title}</h3>
        </a>
        <p className="mt-1 text-sm text-ink-soft">{formatPrice(product)}</p>
      </div>
    </article>
  )
}
