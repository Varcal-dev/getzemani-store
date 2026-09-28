"use client"

import { useEffect, useRef } from "react"
import { trackPurchase } from "@/lib/analytics"
import { trackMetaEvent } from "@/components/MetaPixel"

export function PurchaseTracker({
  order,
  value,
  currency = "USD",
}: {
  order: string
  value: number
  currency?: string
}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!order || tracked.current) return

    const storageKey = `getzemani_purchase_${order}`

    if (sessionStorage.getItem(storageKey)) {
      return
    }

    tracked.current = true
    sessionStorage.setItem(storageKey, "1")

    trackPurchase({
      transactionId: order,
      value,
      currency,
      items: [],
    })

    trackMetaEvent("Purchase", {
      content_type: "product",
      value,
      currency,
      order_id: order,
    })
  }, [order, value, currency])

  return null
}
