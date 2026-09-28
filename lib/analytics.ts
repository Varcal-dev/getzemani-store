// lib/analytics.ts

export type AnalyticsItem = {
  item_id: string
  item_name: string
  price?: number
  quantity?: number
  item_category?: string
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function trackGA4Event(
  eventName: string,
  params: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params)
  }
}

export function trackViewItem(item: AnalyticsItem, currency = "USD") {
  trackGA4Event("view_item", {
    currency,
    value: item.price ?? 0,
    items: [
      {
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price ?? 0,
        quantity: 1,
        ...(item.item_category
          ? { item_category: item.item_category }
          : {}),
      },
    ],
  })
}

export function trackAddToCart(
  item: AnalyticsItem,
  currency = "USD",
) {
  trackGA4Event("add_to_cart", {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [
      {
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price ?? 0,
        quantity: item.quantity ?? 1,
        ...(item.item_category
          ? { item_category: item.item_category }
          : {}),
      },
    ],
  })
}

export function trackBeginCheckout(
  items: AnalyticsItem[],
  value: number,
  currency = "USD",
) {
  trackGA4Event("begin_checkout", {
    currency,
    value,
    items: items.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      price: item.price ?? 0,
      quantity: item.quantity ?? 1,
      ...(item.item_category
        ? { item_category: item.item_category }
        : {}),
    })),
  })
}

export function trackPurchase({
  transactionId,
  value,
  currency = "USD",
  items,
}: {
  transactionId: string
  value: number
  currency?: string
  items: AnalyticsItem[]
}) {
  trackGA4Event("purchase", {
    transaction_id: transactionId,
    currency,
    value,
    items: items.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      price: item.price ?? 0,
      quantity: item.quantity ?? 1,
      ...(item.item_category
        ? { item_category: item.item_category }
        : {}),
    })),
  })
}
