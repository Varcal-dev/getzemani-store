"use client";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/shopify";
import { useCart } from "@/context/cart-context";
import { cleanAlt } from "@/lib/format";
function formatMoney(amount: string, currencyCode: string) { return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(Number(amount)); }
function ProductDescription({ description }: { description: string }) {
  return (
    <div
      className="
        product-description
        mt-8
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
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}
export function ProductDetail({ product }: { product: Product }) { const { addItem, isLoading } = useCart(); const images = product.images?.nodes?.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : []; const [activeImage, setActiveImage] = useState(0); const options = product.options?.filter((o) => o.values.length > 1 || o.name.toLowerCase() !== "title") ?? []; const [selected, setSelected] = useState<Record<string, string>>(() => Object.fromEntries(options.map((o) => [o.name, o.values[0]]))); const variant = useMemo(() => product.variants.nodes.find((v) => v.selectedOptions.every((so) => selected[so.name] === so.value)) ?? product.variants.nodes[0], [product.variants.nodes, selected]); const [justAdded, setJustAdded] = useState(false); async function handleAdd() { if (!variant) return; await addItem(variant.id, 1); setJustAdded(true); setTimeout(() => setJustAdded(false), 2000); }
return <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20"><div><div className="aspect-[4/5] overflow-hidden bg-card">{images[activeImage] ? <img src={images[activeImage].url} alt={cleanAlt(images[activeImage].altText, product.title)} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-ink-soft">Getzemani</div>}</div>{images.length > 1 && <div className="mt-4 flex gap-2">{images.map((img, i) => <button key={img.url} onClick={() => setActiveImage(i)} className={`size-16 overflow-hidden border ${i === activeImage ? "border-olive-deep" : "border-line"}`} aria-label={`View image ${i + 1}`}><img src={img.url} alt="" className="h-full w-full object-cover" /></button>)}</div>}</div><div className="lg:pt-3"><p className="mb-4 text-[11px] font-semibold uppercase tracking-[.2em] text-olive">Getzemani ritual</p><h1 className="font-serif text-5xl leading-[.95] tracking-[-.03em] text-ink">{product.title}</h1>{variant && <p className="mt-5 text-sm text-ink-soft">{formatMoney(variant.price.amount, variant.price.currencyCode)}</p>}<<ProductDescription
  description={product.descriptionHtml ?? product.description}
/> />{options.map((option) => <div key={option.name} className="mt-8 border-t border-line pt-5"><p className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-ink-soft">{option.name}</p><div className="flex flex-wrap gap-2">{option.values.map((value) => <button key={value} onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value }))} className={`border px-4 py-2 text-xs transition-colors ${selected[option.name] === value ? "border-olive-deep bg-olive-deep text-paper" : "border-line text-ink-soft hover:border-ink"}`}>{value}</button>)}</div></div>)}<button onClick={handleAdd} disabled={isLoading || !variant?.availableForSale} className="mt-10 w-full bg-olive-deep py-4 text-sm text-paper transition-colors hover:bg-olive disabled:opacity-40 sm:w-auto sm:px-12">{!variant?.availableForSale ? "Sold out" : justAdded ? "Added to bag" : "Add to bag"}</button></div></div>; }
