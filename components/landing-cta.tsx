"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";
import { trackMetaEvent } from "@/components/MetaPixel";
import { trackAddToCart, trackViewItem } from "@/lib/analytics";
import { useRegionRestricted } from "@/lib/use-region-restricted";
import type { LandingVariant } from "@/lib/landing";

type Data = {
  productId: string;
  title: string;
  options: { name: string; values: string[] }[];
  variants: LandingVariant[];
};

type Ctx = {
  data: Data;
  variant: LandingVariant;
  selected: Record<string, string>;
  select: (name: string, value: string) => void;
};

const LandingCtx = createContext<Ctx | null>(null);

function useLanding() {
  const ctx = useContext(LandingCtx);
  if (!ctx) throw new Error("Debe usarse dentro de <LandingPurchase>");
  return ctx;
}

function money(m: { amount: string; currencyCode: string }) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: m.currencyCode }).format(Number(m.amount));
}

// Guarda la variante elegida y la comparte con el hero, el cierre y la barra fija.
export function LandingPurchase({ data, children }: { data: Data; children: React.ReactNode }) {
  const initial = data.variants.find((v) => v.availableForSale) ?? data.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(
    Object.fromEntries(initial.selectedOptions.map((o) => [o.name, o.value])),
  );
  const variant = useMemo(
    () => data.variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)) ?? initial,
    [data.variants, selected, initial],
  );
  const value = useMemo(
    () => ({ data, variant, selected, select: (n: string, v: string) => setSelected((s) => ({ ...s, [n]: v })) }),
    [data, variant, selected],
  );
  return <LandingCtx.Provider value={value}>{children}</LandingCtx.Provider>;
}

// ViewContent (Meta) + view_item (GA4), una vez por producto.
export function LandingViewTracker() {
  const { data, variant } = useLanding();
  useEffect(() => {
    const price = Number(variant.price.amount);
    trackMetaEvent("ViewContent", {
      content_ids: [data.productId],
      content_type: "product",
      content_name: data.title,
      value: price,
      currency: variant.price.currencyCode,
    });
    trackViewItem({ item_id: variant.id, item_name: data.title, price, quantity: 1 }, variant.price.currencyCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.productId]);
  return null;
}

export function LandingPrice() {
  const { variant } = useLanding();
  const was = variant.compareAtPrice;
  const showWas = was && Number(was.amount) > Number(variant.price.amount);
  return (
    <span className="lw-price">
      {money(variant.price)}
      {showWas && <s className="lw-was">{money(was!)}</s>}
    </span>
  );
}

// Una sola opción (p. ej. "1 pieza / 2 piezas"): tarjetas con precio. Varias opciones: chips.
export function LandingOptions() {
  const { data, variant, selected, select } = useLanding();
  const options = data.options.filter((o) => o.values.length > 1);
  if (!options.length) return null;

  if (options.length === 1) {
    const opt = options[0];
    return (
      <div className="lw-opts" role="radiogroup" aria-label={opt.name}>
        <div className="lw-cards">
          {opt.values.map((val) => {
            const v = data.variants.find((x) => x.selectedOptions.some((o) => o.name === opt.name && o.value === val));
            const on = selected[opt.name] === val;
            return (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={on}
                className="lw-card"
                onClick={() => select(opt.name, val)}
              >
                <span className="lw-card-name">{val}</span>
                {v && <span className="lw-card-price">{v.availableForSale ? money(v.price) : "Sold out"}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="lw-opts">
      {options.map((opt) => (
        <div className="lw-opt-group" key={opt.name} role="radiogroup" aria-label={opt.name}>
          <p className="lw-opt-label">{opt.name}: {selected[opt.name]}</p>
          <div className="lw-pills">
            {opt.values.map((val) => (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={selected[opt.name] === val}
                className="lw-pill"
                onClick={() => select(opt.name, val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LandingCTA() {
  const { data, variant } = useLanding();
  const { addItem, isLoading } = useCart();
  const restricted = useRegionRestricted();
  const [added, setAdded] = useState(false);

  if (!variant.availableForSale) {
    return (
      <span className="lw-btn lw-btn-off" aria-disabled="true">
        Sold out
      </span>
    );
  }

  async function handleAdd() {
    if (restricted) return;
    await addItem(variant.id, 1);

    const price = Number(variant.price.amount);
    const currency = variant.price.currencyCode;
    trackMetaEvent("AddToCart", {
      content_ids: [variant.id],
      content_type: "product",
      content_name: `${data.title} - ${variant.title}`,
      value: price,
      currency,
    });
    trackAddToCart({ item_id: variant.id, item_name: data.title, price, quantity: 1 }, currency);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button type="button" className="lw-btn" onClick={handleAdd} disabled={isLoading || restricted}>
      {restricted ? "Ships to the U.S. only" : isLoading ? "Adding…" : added ? "Added" : "Add to cart"}
    </button>
  );
}