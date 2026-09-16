"use client"

import { useCart } from "@/context/cart-context"

function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(Number(amount))
}

export function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, updateItem, removeItem } = useCart()
  const lines = cart?.lines.nodes ?? []

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`tray fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Tu bolsa"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-2xl text-ink">Your bag</h2>
          <button onClick={closeCart} aria-label="Cerrar bolsa" className="text-ink-soft hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {lines.length === 0 ? (
            <p className="pt-10 text-center text-sm leading-6 text-ink-soft">
              Your bag is empty. Time to start a ritual.
            </p>
          ) : (
            <ul className="flex flex-col gap-6">
              {lines.map(line => (
                <li key={line.id} className="flex gap-4">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-card">
                    {line.merchandise.product.featuredImage && (
                      <img
                        src={line.merchandise.product.featuredImage.url}
                        alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{line.merchandise.product.title}</p>
                      {line.merchandise.title !== "Default Title" && (
                        <p className="mt-0.5 text-xs text-ink-soft">{line.merchandise.title}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-full border border-line px-2 py-1">
                        <button
                          className="px-1 text-ink-soft hover:text-ink disabled:opacity-40"
                          disabled={isLoading}
                          onClick={() => updateItem(line.id, line.quantity - 1)}
                          aria-label="Reducir cantidad"
                        >−</button>
                        <span className="w-4 text-center text-xs">{line.quantity}</span>
                        <button
                          className="px-1 text-ink-soft hover:text-ink disabled:opacity-40"
                          disabled={isLoading}
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          aria-label="Aumentar cantidad"
                        >+</button>
                      </div>
                      <p className="text-sm text-ink">{formatMoney(line.merchandise.price.amount, line.merchandise.price.currencyCode)}</p>
                    </div>
                    <button
                      className="mt-1 self-start text-xs text-ink-soft underline-offset-2 hover:text-brick hover:underline"
                      onClick={() => removeItem(line.id)}
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && cart && (
          <div className="border-t border-line px-6 py-6">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-ink-soft">Subtotal</span>
              <span className="text-ink">{formatMoney(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
            </div>
            <p className="mb-5 text-xs text-ink-soft">Taxes and shipping calculated at checkout.</p>
            <a
              href={cart.checkoutUrl}
              className="block w-full rounded-full bg-olive-deep py-3.5 text-center text-sm text-paper transition-colors hover:bg-olive"
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </>
  )
}
