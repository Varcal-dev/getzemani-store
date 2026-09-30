// lib/landing.ts — mismas variables y versión de API que lib/shopify.ts
export type Pair = { title: string; text: string };
export type LandingContent = {
  headline?: string;
  lede?: string;
  statement?: Pair;
  features?: Pair[];
  ritualTitle?: string;
  ritual?: Pair[];
  specs?: { label: string; value: string }[];
  faqs?: { q: string; a: string }[];
  closing?: string;
  shippingNote?: string;
  legal?: string;
};

export type Money = { amount: string; currencyCode: string };

export type LandingVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
};

export type LandingProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  options: { name: string; values: string[] }[];
  variants: LandingVariant[];
  images: { url: string; altText: string | null }[];
  content: LandingContent;
};

const QUERY = /* GraphQL */ `
  query LandingProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      images(first: 4) { nodes { url altText } }
      options { name values }
      variants(first: 30) {
        nodes {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
        }
      }
      content: metafields(identifiers: [
        { namespace: "landing", key: "content" },
        { namespace: "custom", key: "landing_content" },
        { namespace: "custom", key: "landing-content" },
        { namespace: "custom", key: "content" }
      ]) { value }
    }
  }
`;

export async function getLandingProduct(handle: string): Promise<LandingProduct | null> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const publicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !(privateToken || publicToken)) return null;

  const res = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(privateToken
        ? { "Shopify-Storefront-Private-Token": privateToken }
        : { "X-Shopify-Storefront-Access-Token": publicToken as string }),
    },
    body: JSON.stringify({ query: QUERY, variables: { handle } }),
    next: { revalidate: 300 }, // el precio se actualiza como máximo cada 5 min
  });
  if (!res.ok) return null;

  const json = await res.json();
  const p = json?.data?.product;
  if (!p) return null;

  const variants: LandingVariant[] = p.variants.nodes;
  if (!variants.length) return null;

  let content: LandingContent = {};
  try {
    const raw = (p.content as ({ value: string } | null)[]).find(Boolean)?.value;
    if (raw) content = JSON.parse(raw);
  } catch {
    /* JSON mal formado: la página usa solo los datos base */
  }

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    options: p.options,
    variants,
    images: p.images.nodes,
    content,
  };
}

export function formatMoney({ amount, currencyCode }: Money) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(Number(amount));
}

// Corta en límite de palabra para no dejar frases a medias
export function trimAtWord(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
}