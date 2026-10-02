"use client";

import type { Product } from "@/lib/shopify";
import { cleanAlt } from "@/lib/format";
import { AddToBagButton } from "@/components/add-to-bag-button";

function formatPrice(product: Product) {
  const { amount, currencyCode } = product.priceRange.minVariantPrice;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function ProductCard({
  product,
  tagline,
}: {
  product: Product;
  tagline?: string;
}) {
  const firstVariant =
    product.variants.nodes.find((v) => v.availableForSale) ??
    product.variants.nodes[0];
  const secondaryImage = product.images?.nodes.find(
    (image) => image.url !== product.featuredImage?.url,
  );

  return (
    <article className="product-card group flex min-w-0 flex-col">
      <div className="relative">
        <a
          href={`/products/${product.handle}`}
          className="block overflow-hidden rounded-card bg-card"
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
        </a>
        {firstVariant && (
          <AddToBagButton
            merchandiseId={firstVariant.id}
            available={firstVariant.availableForSale}
            label={product.title}
          />
        )}
      </div>
      <div className="pt-4">
        <a href={`/products/${product.handle}`}>
          <h3 className="font-serif text-lg leading-tight text-ink hover:text-olive">
            {product.title}
          </h3>
        </a>
        {tagline && (
          <p className="mt-1 text-xs italic text-ink-soft/80">{tagline}</p>
        )}
        <p className="mt-1.5 text-sm text-ink-soft">{formatPrice(product)}</p>
      </div>
    </article>
  );
}
