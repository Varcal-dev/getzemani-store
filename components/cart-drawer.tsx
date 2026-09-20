"use client";
import { useCart } from "@/context/cart-context";
import { cleanAlt } from "@/lib/format";
function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}
export function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, updateItem, removeItem } =
    useCart();
  const lines = cart?.lines.nodes ?? [];
  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`tray fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Your bag"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-6">
          <h2 className="font-serif text-3xl text-ink">Your bag</h2>
          <button
            onClick={closeCart}
            aria-label="Close bag"
            className="text-2xl text-ink-soft hover:text-ink"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-7">
          {lines.length === 0 ? (
            <p className="pt-10 text-center text-sm leading-6 text-ink-soft">
              Your bag is empty. Time to start a ritual.
            </p>
          ) : (
            <ul className="flex flex-col gap-7">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <div className="size-24 shrink-0 overflow-hidden bg-card">
                    {line.merchandise.product.featuredImage && (
                      <img
                        src={line.merchandise.product.featuredImage.url}
                        alt={cleanAlt(
                          line.merchandise.product.featuredImage.altText,
                          line.merchandise.product.title,
                        )}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {line.merchandise.product.title}
                      </p>
                      {line.merchandise.title !== "Default Title" && (
                        <p className="mt-1 text-xs text-ink-soft">
                          {line.merchandise.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 border border-line px-2 py-1">
                        <button
                          className="px-1 text-ink-soft"
                          disabled={isLoading}
                          onClick={() => updateItem(line.id, line.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-xs">
                          {line.quantity}
                        </span>
                        <button
                          className="px-1 text-ink-soft"
                          disabled={isLoading}
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm text-ink">
                        {formatMoney(
                          line.merchandise.price.amount,
                          line.merchandise.price.currencyCode,
                        )}
                      </p>
                    </div>
                    <button
                      className="self-start text-xs text-ink-soft underline-offset-2 hover:text-terracotta hover:underline"
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
          <div className="border-t border-line px-6 py-7">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-ink-soft">Subtotal</span>
              <span className="text-ink">
                {formatMoney(
                  cart.cost.subtotalAmount.amount,
                  cart.cost.subtotalAmount.currencyCode,
                )}
              </span>
            </div>
            <p className="mb-6 text-xs text-ink-soft">
              Taxes and shipping calculated at checkout.
            </p>
            <a
              href={cart.checkoutUrl}
              className="block w-full bg-terracotta py-4 text-center text-sm font-semibold text-paper transition-colors hover:bg-terracotta-deep"
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
