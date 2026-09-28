"use client"

import { useEffect, useRef } from "react"
import { trackPurchase } from "@/lib/analytics"
import { trackMetaEvent } from "@/components/MetaPixel"

export function PurchaseTracker({
  order,
}: {
  order: string
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

    // Purchase básico.
    // El valor real de la orden no está disponible en /thank-you
    // con los parámetros actuales de Shopify.
    trackPurchase({
      transactionId: order,
      value: 0,
      currency: "USD",
      items: [],
    })

    trackMetaEvent("Purchase", {
      content_type: "product",
      value: 0,
      currency: "USD",
      order_id: order,
    })
  }, [order])

  return null
}