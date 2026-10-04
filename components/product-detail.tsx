"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Product } from "@/lib/shopify";
import { useCart } from "@/context/cart-context";
import { cleanAlt } from "@/lib/format";
import { trackMetaEvent } from "@/components/MetaPixel";
import { trackAddToCart, trackBeginCheckout, trackViewItem } from "@/lib/analytics";
import { useRegionRestricted } from "@/lib/use-region-restricted";
import { REGION_RESTRICTED_MESSAGE } from "@/lib/region";
import { toCatalogContentId } from "@/lib/meta-ids";

/*
 * Tiempos de envío (días hábiles). UNA sola fuente de verdad:
 * alimentan la fecha estimada, el sello de envío y el texto de "Shipping & returns".
 * Ajústalos a la realidad del proveedor y mantenlos iguales a /shipping.
 */
const PROCESSING_DAYS: [number, number] = [2, 3];
const TRANSIT_DAYS: [number, number] = [3, 7];

function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) remaining--;
  }
  return date;
}

function formatDeliveryRange(start: Date, end: Date) {
  const month = new Intl.DateTimeFormat("en-US", { month: "short" });
  return start.getMonth() === end.getMonth()
    ? `${month.format(start)} ${start.getDate()} – ${end.getDate()}`
    : `${month.format(start)} ${start.getDate()} – ${month.format(end)} ${end.getDate()}`;
}

function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

/*
 * Extrae las URLs de <img> del HTML de la descripción.
 * Se hace con regex (y no con DOMParser) para que el servidor y el cliente
 * obtengan exactamente la misma lista y no haya error de hidratación.
 */
function extractDescriptionImages(html: string) {
  const urls: string[] = [];
  const pattern = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    urls.push(match[1].replace(/&amp;/g, "&"));
  }
  return Array.from(new Set(urls));
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

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="mt-0.5 size-5 shrink-0 text-olive"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      <div>
        <p className="text-xs font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-ink-soft">{text}</p>
      </div>
    </li>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, buyNow, isLoading } = useCart();
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
   * Images embedded inside Shopify's description.
   */
  const descriptionImages = useMemo(
    () => extractDescriptionImages(product.descriptionHtml ?? product.description ?? ""),
    [product.descriptionHtml, product.description],
  );

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

  /*
   * Galería: swipe en móvil, flechas del teclado, zoom al pasar el mouse
   * y crossfade entre imágenes. Solo se montan la imagen activa y sus vecinas;
   * las demás se cargan cuando se acerca el usuario.
   */
  const imageCount = galleryImages.length;
  const [activeImage, setActiveImage] = useState(0);
  const [loadedImages, setLoadedImages] = useState<number[]>([0, 1]);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  function goToImage(index: number) {
    if (imageCount === 0) return;
    setActiveImage(Math.min(Math.max(index, 0), imageCount - 1));
  }

  function updateZoomOrigin(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--zoom-origin", `${x}% ${y}%`);
  }

  useEffect(() => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      [activeImage - 1, activeImage, activeImage + 1].forEach((i) => {
        if (i >= 0 && i < imageCount) next.add(i);
      });
      return next.size === prev.length ? prev : Array.from(next);
    });

    // Mantiene la miniatura activa a la vista, sin mover el scroll de la página.
    const strip = thumbsRef.current;
    const thumb = strip?.children[activeImage] as HTMLElement | undefined;
    if (strip && thumb) {
      strip.scrollTo({
        left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2,
        behavior: "smooth",
      });
    }
  }, [activeImage, imageCount]);

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
  const [buying, setBuying] = useState(false);

  /*
   * Fecha estimada de entrega. Se calcula tras montar (depende de "hoy" y de la
   * zona horaria del visitante) para no generar diferencias servidor/cliente.
   */
  const [deliveryRange, setDeliveryRange] = useState<string | null>(null);
  useEffect(() => {
    const now = new Date();
    setDeliveryRange(
      formatDeliveryRange(
        addBusinessDays(now, PROCESSING_DAYS[0] + TRANSIT_DAYS[0]),
        addBusinessDays(now, PROCESSING_DAYS[1] + TRANSIT_DAYS[1]),
      ),
    );
  }, []);

  /*
   * Barra inferior (sticky CTA)
   * - purchaseRef: bloque principal de compra (variantes + precio + botones).
   * - Aparece cuando ese bloque sale de pantalla POR ARRIBA (el usuario ya hizo scroll).
   * - Se oculta cuando el footer entra en pantalla para no taparlo.
   */
  const purchaseRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [pastPurchase, setPastPurchase] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const showBar = pastPurchase && !footerInView;

  useEffect(() => {
    const node = purchaseRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPastPurchase(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => {
      setFooterInView(entry.isIntersecting);
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Si la barra se oculta, cerramos también el selector de opciones.
  useEffect(() => {
    if (!showBar) setSheetOpen(false);
  }, [showBar]);

  // Cerrar el selector con Escape o al tocar fuera de la barra.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setSheetOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [sheetOpen]);

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

  async function handleBuy() {
    if (!variant || regionRestricted || buying) return;
    setBuying(true);

    try {
      const checkoutUrl = await buyNow(variant.id, 1);

      const price = Number(variant.price.amount);
      const currency = variant.price.currencyCode;
      const item = {
        item_id: variant.id,
        item_name: product.title,
        price,
        quantity: 1,
      };

      // Meta
      trackMetaEvent("AddToCart", {
        content_ids: [toCatalogContentId(variant.id)],
        content_type: "product",
        content_name: product.title,
        value: price,
        currency,
      });
      trackMetaEvent("InitiateCheckout", {
        content_ids: [toCatalogContentId(variant.id)],
        content_type: "product",
        num_items: 1,
        value: price,
        currency,
      });

      // GA4
      trackAddToCart(item, currency);
      trackBeginCheckout([item], price, currency);

      window.location.href = checkoutUrl;
    } catch {
      setBuying(false);
    }
  }

  const unavailable = !variant?.availableForSale;
  const addDisabled = isLoading || unavailable || regionRestricted;
  const buyDisabled = addDisabled || buying;
  const showDelivery = !regionRestricted && !unavailable;

  const addLabel = regionRestricted
    ? "Not available in your region"
    : unavailable
      ? "Sold out"
      : justAdded
        ? "Added to bag"
        : "Add to bag";

  const buyLabel = buying ? "Redirecting…" : "Buy now";

  const variantSummary = options.map((o) => selected[o.name]).join(" / ");
  const barThumb = galleryImages[0];

  const addButtonClass =
    "w-full bg-olive-deep py-4 text-sm text-paper transition-colors hover:bg-olive disabled:opacity-40";
  const buyButtonClass =
    "w-full border border-terracotta py-4 text-sm text-terracotta transition-colors hover:bg-terracotta hover:text-paper disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-terracotta";

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
      {/* LEFT: IMAGES */}
      <div>
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label={`${product.title} images`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              goToImage(activeImage + 1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              goToImage(activeImage - 1);
            }
          }}
          onMouseEnter={updateZoomOrigin}
          onMouseMove={updateZoomOrigin}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse") return;
            swipeStart.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = swipeStart.current;
            swipeStart.current = null;
            if (!start) return;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
              goToImage(activeImage + (dx < 0 ? 1 : -1));
            }
          }}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
          className="group relative aspect-square touch-pan-y select-none overflow-hidden bg-card outline-none focus-visible:ring-1 focus-visible:ring-olive-deep"
        >
          {imageCount === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-ink-soft">
              Getzemani
            </div>
          ) : (
            galleryImages.map((img, i) =>
              loadedImages.includes(i) ? (
                <img
                  key={`${img.url}-${i}`}
                  src={img.url}
                  alt={cleanAlt(img.altText, product.title)}
                  aria-hidden={i !== activeImage}
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-contain ${
                    i === activeImage
                      ? "cursor-zoom-in opacity-100 group-hover:scale-[1.6]"
                      : "pointer-events-none opacity-0"
                  }`}
                  style={{
                    transformOrigin: "var(--zoom-origin, 50% 50%)",
                    transition:
                      "opacity 500ms cubic-bezier(0.2, 0.7, 0.2, 1), transform 300ms ease-out",
                  }}
                />
              ) : null,
            )
          )}

          {imageCount > 1 && (
            <span
              aria-live="polite"
              className="pointer-events-none absolute bottom-3 right-3 bg-paper/90 px-2.5 py-1 text-[11px] tabular-nums text-ink-soft"
            >
              {activeImage + 1} / {imageCount}
            </span>
          )}
        </div>

        {imageCount > 1 && (
          <div
            ref={thumbsRef}
            className="relative mt-4 flex gap-2 overflow-x-auto pb-2"
          >
            {galleryImages.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                onClick={() => goToImage(i)}
                className={`flex size-16 shrink-0 items-center justify-center overflow-hidden border bg-card transition-colors ${
                  i === activeImage ? "border-olive-deep" : "border-line"
                }`}
                aria-label={`View image ${i + 1}`}
                aria-current={i === activeImage}
              >
                <img
                  src={img.url}
                  alt=""
                  loading="lazy"
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

        {/* PURCHASE BLOCK: variantes + precio + botones (lo observa la barra inferior) */}
        <div ref={purchaseRef}>
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

          {/* 4. ADD TO BAG + BUY NOW */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAdd}
              disabled={addDisabled}
              title={regionRestricted ? REGION_RESTRICTED_MESSAGE : undefined}
              className={`${addButtonClass} sm:w-auto sm:px-12`}
            >
              {addLabel}
            </button>

            {!regionRestricted && (
              <button
                onClick={handleBuy}
                disabled={buyDisabled}
                className={`${buyButtonClass} sm:w-auto sm:px-10`}
              >
                {buyLabel}
              </button>
            )}
          </div>
        </div>

        {/* 4.5 DELIVERY ESTIMATE */}
        {showDelivery && (
          <p className="mt-5 min-h-5 text-sm text-ink-soft">
            {deliveryRange && (
              <>
                Estimated delivery{" "}
                <span className="font-semibold text-ink">{deliveryRange}</span>
              </>
            )}
          </p>
        )}

        {/* 4.6 TRUST */}
        <ul className="mt-8 grid grid-cols-1 gap-5 border-t border-line pt-6 sm:grid-cols-3">
          <TrustItem
            icon={
              <>
                <rect x="5" y="11" width="14" height="9" rx="1.5" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </>
            }
            title="Secure checkout"
            text="Encrypted payment"
          />
          <TrustItem
            icon={
              <>
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
              </>
            }
            title="Free returns"
            text="Within 30 days of delivery"
          />
          <TrustItem
            icon={
              <>
                <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
                <path d="M3 7.5 12 12l9-4.5M12 12v9" />
              </>
            }
            title="Ships from the U.S."
            text={`Orders ship in ${PROCESSING_DAYS[0]}–${PROCESSING_DAYS[1]} business days`}
          />
        </ul>

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
                Shipped from our U.S. warehouse. Orders ship within{" "}
                {PROCESSING_DAYS[0]}–{PROCESSING_DAYS[1]} business days and
                typically arrive within {TRANSIT_DAYS[0]}–{TRANSIT_DAYS[1]}{" "}
                business days after that.
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

      {/* STICKY BAR: aparece al perder de vista el bloque de compra */}
      <div
        ref={barRef}
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 shadow-[0_-10px_30px_-14px_rgba(25,25,23,0.22)] backdrop-blur-md transition-[transform,visibility] duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          showBar ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
      >
        {/* Selector de opciones (se abre encima de la barra) */}
        {options.length > 0 && (
          <div
            id="sticky-options"
            className={`absolute inset-x-0 bottom-full border-t border-line bg-paper transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
              sheetOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible translate-y-2 opacity-0"
            }`}
          >
            <div className="mx-auto max-w-[1320px] space-y-5 px-5 py-5 lg:px-10">
              {options.map((option) => (
                <div key={option.name}>
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
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 sm:flex-row sm:items-center sm:gap-5 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {barThumb && (
              <img
                src={barThumb.url}
                alt=""
                className="hidden size-12 shrink-0 bg-card object-contain sm:block"
              />
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base leading-tight text-ink">
                {product.title}
              </p>
              {variant && (
                <p className="mt-0.5 text-sm text-ink-soft">
                  {formatMoney(variant.price.amount, variant.price.currencyCode)}
                </p>
              )}
            </div>

            {options.length > 0 && (
              <button
                type="button"
                onClick={() => setSheetOpen((open) => !open)}
                aria-expanded={sheetOpen}
                aria-controls="sticky-options"
                className="flex max-w-[48%] shrink-0 items-center gap-2 border border-line px-3 py-2 text-xs text-ink transition-colors hover:border-ink"
              >
                <span className="truncate">{variantSummary}</span>
                <svg
                  aria-hidden
                  viewBox="0 0 12 12"
                  className={`size-3 shrink-0 transition-transform duration-200 ${
                    sheetOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 4.5 6 8.5 10 4.5" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex gap-3 sm:shrink-0">
            <button
              onClick={handleAdd}
              disabled={addDisabled}
              title={regionRestricted ? REGION_RESTRICTED_MESSAGE : undefined}
              className={`${addButtonClass} flex-1 !py-3 sm:flex-none sm:px-8`}
            >
              {addLabel}
            </button>

            {!regionRestricted && (
              <button
                onClick={handleBuy}
                disabled={buyDisabled}
                className={`${buyButtonClass} flex-1 !py-3 sm:flex-none sm:px-8`}
              >
                {buyLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}