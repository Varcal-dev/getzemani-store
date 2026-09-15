"use server"

import { addCartLine, createCart, getCart, removeCartLine, updateCartLine } from "@/lib/shopify"

export async function addToCartAction(cartId: string | null, merchandiseId: string, quantity: number) {
  if (!cartId) return createCart(merchandiseId, quantity)
  try {
    return await addCartLine(cartId, merchandiseId, quantity)
  } catch {
    // The stored cart may be stale/expired — start a fresh one.
    return createCart(merchandiseId, quantity)
  }
}

export async function updateCartLineAction(cartId: string, lineId: string, quantity: number) {
  if (quantity <= 0) return removeCartLine(cartId, lineId)
  return updateCartLine(cartId, lineId, quantity)
}

export async function removeCartLineAction(cartId: string, lineId: string) {
  return removeCartLine(cartId, lineId)
}

export async function getCartAction(cartId: string) {
  return getCart(cartId)
}
