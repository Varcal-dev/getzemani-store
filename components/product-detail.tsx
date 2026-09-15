"use client"

import { useMemo, useState } from "react"
import type { Product } from "@/lib/shopify"
import { useCart } from "@/context/cart-context"

function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(Number(amount))
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, isLoading } = useCart()
  const images = product.images?.nodes?.length ? product.images.nodes : (product.featuredImage ? [product.featuredImage] : [])
  const [activeImage, setActiveImage] = useState(0)

  const options = product.options?.filter(o => o.values.length > 1 || o.name.toLowerCase() !== "title") ?? []
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    options.forEach(o => { initial[o.name] = o.values[0] })
    return initial
  })

  const variant = useMemo(() => {
    return product.variants.nodes.find(v =>
      v.selectedOptions.every(so => selected[so.name] === so.value)
    ) ?? product.variants.nodes[0]
  }, [product.variants.nodes, selected])

  const [justAdded, setJustAdded] = useState(false)

  async function handleAdd() {
    if (!variant) return
    await addItem(variant.id, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="organic-mask aspect-[4/5] overflow-hidden bg-card">
          {images[activeImage] ? (
            <img
              src={images[activeImage].url}
              alt={images[activeImage].altText || product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-soft">Getzemani</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex gap-3">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setActiveImage(i)}
                className={`h-16 w-14 overflow-hidden rounded-lg border ${i === activeImage ? "border-olive" : "border-line"}`}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:pt-4">
        <h1 className="font-serif text-3xl leading-tight text-ink lg:text-4xl">{product.title}</h1>
        {variant && (
          <p className="mt-3 text-lg text-ink-soft">{formatMoney(variant.price.amount, variant.price.currencyCode)}</p>
        )}

        <p className="mt-6 max-w-md text-sm leading-6 text-ink-soft">{product.description}</p>

        {options.map(option => (
          <div key={option.name} className="mt-7">
            <p className="mb-2 text-xs text-ink-soft">{option.name}</p>
            <div className="flex flex-wrap gap-2">
              {option.values.map(value => (
                <button
                  key={value}
                  onClick={() => setSelected(prev => ({ ...prev, [option.name]: value }))}
                  className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                    selected[option.name] === value
                      ? "border-olive-deep bg-olive-deep text-paper"
                      : "border-line text-ink-soft hover:border-ink-soft"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleAdd}
          disabled={isLoading || !variant?.availableForSale}
          className="mt-9 w-full rounded-full bg-olive-deep py-3.5 text-sm text-paper transition-colors hover:bg-olive disabled:opacity-40 sm:w-auto sm:px-10"
        >
          {!variant?.availableForSale ? "Sold out" : justAdded ? "Added to bag" : "Add to bag"}
        </button>
      </div>
    </div>
  )
}
