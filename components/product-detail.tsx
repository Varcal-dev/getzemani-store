"use client";
import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/lib/shopify";
import { useCart } from "@/context/cart-context";
import { cleanAlt } from "@/lib/format";
import { trackMetaEvent } from "@/components/MetaPixel";
import { trackAddToCart, trackViewItem } from "@/lib/analytics";
import { useRegionRestricted } from "@/lib/use-region-restricted";
import { REGION_RESTRICTED_MESSAGE } from "@/lib/region";
import { toCatalogContentId } from "@/lib/meta-ids";

function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

function ProductDescription({ description }: { description: string }) {
  const descriptionWithoutImages = useMemo(() => {
    return description.replace(/<img\b[^>]*>/gi, "");
  }, [description]);

  return (
    <div
      className="
        product-description
        text-sm
        leading-7
        text-ink-soft

        [&_p]:mb-4
        [&_p:last-child]:mb-0

        [&_strong]:font-semibold
        [&_strong]:text-ink

        [&_em]:italic

        [&_ul]:my-4
        [&_ul]:list-disc
        [&_ul]:pl-6

        [&_ol]:my-4
        [&_ol]:list-decimal
        [&_ol]:pl-6

        [&_li]:mb-1

        [&_h2]:mb-3
        [&_h2]:mt-6
        [&_h2]:font-serif
        [&_h2]:text-xl
        [&_h2]:text-ink

        [&_h3]:mb-2
        [&_h3]:mt-5
        [&_h3]:font-semibold
        [&_h3]:text-ink

        [&_a]:underline
        [&_a]:underline-offset-2
      "
      dangerouslySetInnerHTML={{
        __html: descriptionWithoutImages,
      }}
    />
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, isLoading } = useCart();
  const regionRestricted = useRegionRestricted();

  /*
   * Images coming from Shopify's normal product gallery
   */
  const productImages = product.images?.nodes?.length
    ? product.images.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  /*
   * Extract images embedded inside Shopify's description.
   */
  const descriptionImages = useMemo(() => {
    if (typeof window === "undefined") return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(
      product.descriptionHtml ?? product.description,
      "text/html",
    );

    const urls = Array.from(doc.querySelectorAll("img"))
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => Boolean(src));

    return Array.from(new Set(urls));
  }, [product.descriptionHtml, product.description]);

  /*
   * Combine normal Shopify product images + description images.
   */
  const galleryImages = useMemo(() => {
    const normalImages = productImages.map((image) => ({
      url: image.url,
      altText: image.altText,
    }));

    const descriptionGalleryImages = descriptionImages.map((url) => ({
      url,
      altText: product.title,
    }));

    const combined = [...normalImages, ...descriptionGalleryImages];

    return combined.filter(
      (image, index, array) =>
        array.findIndex((item) => item.url === image.url) === index,
    );
  }, [productImages, descriptionImages, product.title]);

  const [activeImage, setActiveImage] = useState(0);

  const options =
    product.options?.filter(
      (o) => o.values.length > 1 || o.name.toLowerCase() !== "title",
    ) ?? [];

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.values[0]])),
  );

  const variant = useMemo(
    () =>
      product.variants.nodes.find((v) =>
        v.selectedOptions.every((so) => selected[so.name] === so.value),
      ) ?? product.variants.nodes[0],
    [product.variants.nodes, selected],
  );
  const [justAdded, setJustAdded] = useState(false);

  // ViewContent: se dispara una vez cuando el usuario entra a la página de producto.
  useEffect(() => {
    const price = Number(variant?.price.amount ?? 0);
    const currency = variant?.price.currencyCode ?? "USD";

    // Meta
    trackMetaEvent("ViewContent", {
      content_ids: [toCatalogContentId(variant?.id ?? product.id)],
      content_type: "product",
      content_name: product.title,
      value: price,
      currency,
    });

    // GA4
    trackViewItem(
      {
        item_id: variant?.id ?? product.id,
        item_name: product.title,
        price,
        quantity: 1,
      },
      currency,
    );

    // Solo una vez por producto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  async function handleAdd() {
    if (!variant || regionRestricted) return;

    await addItem(variant.id, 1);

    const price = Number(variant.price.amount);
    const currency = variant.price.currencyCode;

    // Meta
    trackMetaEvent("AddToCart", {
      content_ids: [toCatalogContentId(variant.id)],
      content_type: "product",
      content_name: product.title,
      value: price,
      currency,
    });

    // GA4
    trackAddToCart(
      {
        item_id: variant.id,
        item_name: product.title,
        price,
        quantity: 1,
      },
      currency,
    );

    setJustAdded(true);

    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
      {/* LEFT: IMAGES */}
      <div>
        <div className="flex aspect-square items-center justify-center overflow-hidden bg-card">
          {galleryImages[activeImage] ? (
            <img
              src={galleryImages[activeImage].url}
              alt={cleanAlt(galleryImages[activeImage].altText, product.title)}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-soft">
              Getzemani
            </div>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {galleryImages.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                onClick={() => setActiveImage(i)}
                className={`flex size-16 shrink-0 items-center justify-center overflow-hidden border bg-card transition-colors ${
                  i === activeImage ? "border-olive-deep" : "border-line"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: PRODUCT INFORMATION */}
      <div className="lg:sticky lg:top-8 lg:self-start lg:pt-3">
        {/* 1. NAME */}
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.2em] text-olive">
          Getzemani ritual
        </p>

        <h1 className="font-serif text-5xl leading-[.95] tracking-[-.03em] text-ink">
          {product.title}
        </h1>

        {/* 2. VARIANTS */}
        {options.map((option) => (
          <div key={option.name} className="mt-8 border-t border-line pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-ink-soft">
              {option.name}
            </p>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => (
                <button
                  key={value}
                  onClick={() =>
                    setSelected((prev) => ({
                      ...prev,
                      [option.name]: value,
                    }))
                  }
                  className={`border px-4 py-2 text-xs transition-colors ${
                    selected[option.name] === value
                      ? "border-olive-deep bg-olive-deep text-paper"
                      : "border-line text-ink-soft hover:border-ink"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* 3. PRICE */}
        {variant && (
          <p className="mt-6 text-lg text-ink">
            {formatMoney(variant.price.amount, variant.price.currencyCode)}
          </p>
        )}

        {/* 3.5 REGION NOTICE */}
        {regionRestricted && (
          <p className="mt-4 border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-xs leading-5 text-terracotta-deep">
            {REGION_RESTRICTED_MESSAGE}
          </p>
        )}

        {/* 4. ADD TO BAG */}
        <button
          onClick={handleAdd}
          disabled={isLoading || !variant?.availableForSale || regionRestricted}
          title={regionRestricted ? REGION_RESTRICTED_MESSAGE : undefined}
          className="mt-6 w-full bg-olive-deep py-4 text-sm text-paper transition-colors hover:bg-olive disabled:opacity-40 sm:w-auto sm:px-12"
        >
          {regionRestricted
            ? "Not available in your region"
            : !variant?.availableForSale
              ? "Sold out"
              : justAdded
                ? "Added to bag"
                : "Add to bag"}
        </button>

        {/* 5. DETAILS / SHIPPING & RETURNS / FAQ */}
        <div className="mt-10 divide-y divide-line border-t border-line">
          <details open className="group py-6 first:pt-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-ink marker:content-none">
              Details
              <span
                aria-hidden
                className="shrink-0 text-xl text-terracotta transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-4">
              <ProductDescription
                description={product.descriptionHtml ?? product.description}
              />
            </div>
          </details>

          <details className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-ink marker:content-none">
              Shipping &amp; returns
              <span
                aria-hidden
                className="shrink-0 text-xl text-terracotta transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-4 space-y-3 text-sm leading-7 text-ink-soft">
              <p>
                Shipped from our U.S. warehouse. Orders ship within 2–3 business
                days and typically arrive within 3–7 business days after that.
              </p>
              <p>
                Free returns within 30 days of delivery.{" "}
                <a
                  href="/shipping"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  Shipping details
                </a>{" "}
                ·{" "}
                <a
                  href="/returns"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  Return policy
                </a>
              </p>
            </div>
          </details>

          <details className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-ink marker:content-none">
              Questions
              <span
                aria-hidden
                className="shrink-0 text-xl text-terracotta transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-4 text-sm leading-7 text-ink-soft">
              <p>
                Need something specific before you buy? See our{" "}
                <a
                  href="/faq"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  full FAQ
                </a>{" "}
                or email{" "}
                <a
                  href="mailto:info@getzemani.store"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  info@getzemani.store
                </a>
                .
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
