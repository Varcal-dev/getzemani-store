"use client"

import { useEffect, useRef, useState } from "react"
import { useCart } from "@/context/cart-context"

type Status = "idle" | "adding" | "added"

export function AddToBagButton({
  merchandiseId,
  available,
  label,
  variant = "icon",
}: {
  merchandiseId: string
  available: boolean
  /** product title, for the accessible label */
  label: string
  variant?: "icon" | "text"
}) {
  const { addItem } = useCart()
  const [status, setStatus] = useState<Status>("idle")
  const timeoutRef = useRef<number>()

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  async function handleClick() {
    if (status === "adding") return
    setStatus("adding")
    try {
      await addItem(merchandiseId, 1)
      setStatus("added")
      timeoutRef.current = window.setTimeout(() => setStatus("idle"), 1400)
    } catch {
      setStatus("idle")
    }
  }

  if (variant === "text") {
    return (
      <button
        className="add-to-bag-text text-[11px] font-semibold uppercase tracking-[.14em] text-terracotta transition-colors hover:text-terracotta-deep disabled:cursor-not-allowed disabled:text-ink-soft disabled:opacity-60"
        data-status={status}
        disabled={status === "adding" || !available}
        onClick={handleClick}
      >
        {!available ? "Sold out" : status === "added" ? "Added ✓" : status === "adding" ? "Adding…" : "Add to bag"}
      </button>
    )
  }

  return (
    <button
      className="quick-add add-to-bag-icon absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-terracotta text-xl leading-none text-paper transition-colors hover:bg-terracotta-deep disabled:cursor-not-allowed disabled:bg-ink-soft disabled:opacity-60"
      data-status={status}
      disabled={status === "adding" || !available}
      onClick={handleClick}
      aria-label={available ? `Add ${label} to bag` : "Sold out"}
    >
      <span aria-hidden className="add-to-bag-icon-glyph">
        {!available ? "×" : status === "added" ? "✓" : "+"}
      </span>
    </button>
  )
}
