"use client"

import { useState, type FormEvent } from "react"
import { subscribeToNewsletterAction } from "@/lib/cart-actions"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("loading")
    const result = await subscribeToNewsletterAction(email)
    if (result.ok) {
      setStatus("done")
      setEmail("")
    } else {
      setStatus("error")
      setError(result.error)
    }
  }

  if (status === "done") {
    return (
      <p className="text-sm leading-6 text-ink-soft">
        You&apos;re on the list — thanks for joining.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <div className="flex items-stretch gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Email address"
          className="min-w-0 flex-1 border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-olive-deep focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 bg-olive-deep px-5 py-2.5 text-xs font-semibold uppercase tracking-[.12em] text-paper transition-colors hover:bg-olive disabled:opacity-50"
        >
          {status === "loading" ? "Joining…" : "Join"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-terracotta-deep">{error}</p>
      )}
    </form>
  )
}
