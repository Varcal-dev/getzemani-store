"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { Cart } from "@/lib/shopify"
import { addToCartAction, getCartAction, removeCartLineAction, updateCartLineAction } from "@/lib/cart-actions"

const STORAGE_KEY = "getzemani_cart_id"

type CartContextValue = {
  cart: Cart | null
  isOpen: boolean
  isLoading: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const storedId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (!storedId) return
    getCartAction(storedId)
      .then(existing => { if (existing) setCart(existing) })
      .catch(() => localStorage.removeItem(STORAGE_KEY))
  }, [])

  const persist = useCallback((next: Cart) => {
    setCart(next)
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next.id)
  }, [])

  const addItem = useCallback(async (merchandiseId: string, quantity = 1) => {
    setIsLoading(true)
    try {
      const next = await addToCartAction(cart?.id ?? null, merchandiseId, quantity)
      persist(next)
      setIsOpen(true)
    } finally {
      setIsLoading(false)
    }
  }, [cart?.id, persist])

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return
    setIsLoading(true)
    try {
      const next = await updateCartLineAction(cart.id, lineId, quantity)
      persist(next)
    } finally {
      setIsLoading(false)
    }
  }, [cart, persist])

  const removeItem = useCallback(async (lineId: string) => {
    if (!cart) return
    setIsLoading(true)
    try {
      const next = await removeCartLineAction(cart.id, lineId)
      persist(next)
    } finally {
      setIsLoading(false)
    }
  }, [cart, persist])

  const value = useMemo(() => ({
    cart, isOpen, isLoading,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem, updateItem, removeItem,
  }), [cart, isOpen, isLoading, addItem, updateItem, removeItem])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}
