// Some imported products (via the CJdropshipping app) carry the source
// image's filename hash as the Shopify alt text instead of a real
// description — e.g. "c7cefcd8c9729a6d05e4810efe8243b0". That's worse than
// having no alt text at all, so we detect and discard it in favor of a
// real fallback (usually the product title).
const HASH_LIKE = /^[a-f0-9]{16,}$/i

export function cleanAlt(altText: string | null | undefined, fallback: string): string {
  const trimmed = altText?.trim()
  if (!trimmed || HASH_LIKE.test(trimmed)) return fallback
  return trimmed
}
