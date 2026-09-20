"use client"

import type { Product } from "@/lib/shopify"
import { useCart } from "@/context/cart-context"
import { cleanAlt } from "@/lib/format"

function formatPrice(product: Product) {
  const { amount, currencyCode } = product.priceRange.minVariantPrice
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount))
}

function shortDescription(description: string, max = 78) {
  const clean = description.trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…"
}

export function FeaturedProductCard({ product }: { product: Product }) {
  const { addItem, isLoading } = useCart()
  const firstVariant = product.variants.nodes[0]
  const secondaryImage = product.images?.nodes.find(
    (image) => image.url !== product.featuredImage?.url,
  )

  return (
    <article className="group flex flex-col">
      <a
        href={`/products/${product.handle}`}
        className="relative block overflow-hidden bg-card"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            className="product-image absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            src={product.featuredImage?.url}
            alt={cleanAlt(product.featuredImage?.altText, product.title)}
            loading="lazy"
            width={product.featuredImage?.width}
            height={product.featuredImage?.height}
          />
          {secondaryImage && (
            <img
              className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              src={secondaryImage.url}
              alt={cleanAlt(secondaryImage.altText, product.title)}
              loading="lazy"
            />
          )}
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between bg-olive-deep/90 px-4 py-3 text-xs font-semibold uppercase tracking-[.12em] text-paper opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View product
          <span aria-hidden>→</span>
        </span>
      </a>
      <div className="pt-5">
        {product.productType && (
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-ink-soft">
            {product.productType}
          </p>
        )}
        <a href={`/products/${product.handle}`}>
          <h3 className="font-serif text-xl leading-tight text-ink hover:text-olive-deep">
            {product.title}
          </h3>
        </a>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {shortDescription(product.description)}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink">{formatPrice(product)}</p>
          {firstVariant && (
            <button
              className="text-[11px] font-semibold uppercase tracking-[.14em] text-terracotta transition-colors hover:text-terracotta-deep disabled:cursor-not-allowed disabled:text-ink-soft disabled:opacity-60"
              disabled={isLoading || !firstVariant.availableForSale}
              onClick={() => addItem(firstVariant.id, 1)}
            >
              {firstVariant.availableForSale ? "Add to bag" : "Sold out"}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
