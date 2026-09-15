async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  cache: "cart" | "catalog" = "catalog"
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN
  const publicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  const token = privateToken || publicToken

  if (!domain || !token) {
    throw new Error("Shopify no está configurado")
  }

  const response = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      ...(privateToken
        ? { "Shopify-Storefront-Private-Token": privateToken }
        : { "X-Shopify-Storefront-Access-Token": publicToken as string }),
    },

    body: JSON.stringify({
      query,
      variables,
    }),

    ...(cache === "cart"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 60 } }),
  })

  const payload = await response.json()

  console.log("SHOPIFY STATUS:", response.status)

  if (!response.ok) {
    console.error(
      "SHOPIFY ERROR:",
      JSON.stringify(payload, null, 2)
    )

    throw new Error(
      `Shopify HTTP ${response.status}: ${JSON.stringify(payload)}`
    )
  }

  if (payload.errors?.length) {
    console.error(
      "SHOPIFY GRAPHQL ERROR:",
      JSON.stringify(payload.errors, null, 2)
    )

    throw new Error(payload.errors[0].message)
  }

  return payload.data
}

export type Money = { amount: string; currencyCode: string }

export type ProductImage = { url: string; altText?: string | null; width: number; height: number }

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  selectedOptions: { name: string; value: string }[]
}

export type Product = {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml?: string
  featuredImage?: ProductImage
  images?: { nodes: ProductImage[] }
  priceRange: { minVariantPrice: Money }
  options?: { name: string; values: string[] }[]
  variants: { nodes: ProductVariant[] }
}

export type Collection = { id: string; title: string; handle: string; image?: { url: string; altText?: string | null } }

export type CollectionProducts = { id: string; title: string; handle: string; products: { nodes: Product[] } }

const PRODUCT_CARD_FIELDS = `
  id title handle description
  featuredImage { url altText width height }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 1) { nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } } }
`

export async function getStorefront() {
  const query = `query Storefront {
    products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        ${PRODUCT_CARD_FIELDS}
      }
    }

    collections(first: 6) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
        }
      }
    }
  }`

  return shopifyFetch<{
    products: { nodes: Product[] }
    collections: { nodes: Collection[] }
  }>(query)
}

export async function getCollections() {
  const query = `query Collections {
    collections(first: 6) {
      nodes {
        id
        title
        handle
        image { url altText }
      }
    }
  }`
  const data = await shopifyFetch<{ collections: { nodes: Collection[] } }>(query)
  return data.collections.nodes
}

export async function getCollectionProducts(handle: string) {
  const query = `query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: 8, sortKey: BEST_SELLING) {
        nodes { ${PRODUCT_CARD_FIELDS} }
      }
    }
  }`
  const data = await shopifyFetch<{ collection: CollectionProducts | null }>(query, { handle })
  return data.collection
}

export async function getProduct(handle: string) {
  const query = `query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id title handle description descriptionHtml
      featuredImage { url altText width height }
      images(first: 6) { nodes { url altText width height } }
      priceRange { minVariantPrice { amount currencyCode } }
      options { name values }
      variants(first: 20) { nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } } }
    }
  }`
  const data = await shopifyFetch<{ product: Product | null }>(query, { handle })
  return data.product
}

export async function getRelatedProducts(excludeHandle: string) {
  const query = `query Related { products(first: 5, sortKey: BEST_SELLING) { nodes { ${PRODUCT_CARD_FIELDS} } } }`
  const data = await shopifyFetch<{ products: { nodes: Product[] } }>(query)
  return data.products.nodes.filter(p => p.handle !== excludeHandle).slice(0, 4)
}

// ---------- Cart (Storefront Cart API) ----------

export type CartLine = {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    product: { title: string; handle: string; featuredImage?: ProductImage }
    price: Money
  }
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { subtotalAmount: Money; totalAmount: Money }
  lines: { nodes: CartLine[] }
}

const CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 50) {
    nodes {
      id quantity
      merchandise {
        ... on ProductVariant {
          id title price { amount currencyCode }
          product { title handle featuredImage { url altText width height } }
        }
      }
    }
  }
`

export async function createCart(merchandiseId: string, quantity = 1) {
  const query = `mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) { cart { ${CART_FIELDS} } userErrors { message } }
  }`
  const data = await shopifyFetch<{ cartCreate: { cart: Cart; userErrors: { message: string }[] } }>(
    query, { lines: [{ merchandiseId, quantity }] }, "cart"
  )
  if (data.cartCreate.userErrors.length) throw new Error(data.cartCreate.userErrors[0].message)
  return data.cartCreate.cart
}

export async function getCart(cartId: string) {
  const query = `query CartQuery($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`
  const data = await shopifyFetch<{ cart: Cart | null }>(query, { id: cartId }, "cart")
  return data.cart
}

export async function addCartLine(cartId: string, merchandiseId: string, quantity = 1) {
  const query = `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } }
  }`
  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart; userErrors: { message: string }[] } }>(
    query, { cartId, lines: [{ merchandiseId, quantity }] }, "cart"
  )
  if (data.cartLinesAdd.userErrors.length) throw new Error(data.cartLinesAdd.userErrors[0].message)
  return data.cartLinesAdd.cart
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  const query = `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } }
  }`
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: Cart; userErrors: { message: string }[] } }>(
    query, { cartId, lines: [{ id: lineId, quantity }] }, "cart"
  )
  if (data.cartLinesUpdate.userErrors.length) throw new Error(data.cartLinesUpdate.userErrors[0].message)
  return data.cartLinesUpdate.cart
}

export async function removeCartLine(cartId: string, lineId: string) {
  const query = `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { message } }
  }`
  const data = await shopifyFetch<{ cartLinesRemove: { cart: Cart; userErrors: { message: string }[] } }>(
    query, { cartId, lineIds: [lineId] }, "cart"
  )
  if (data.cartLinesRemove.userErrors.length) throw new Error(data.cartLinesRemove.userErrors[0].message)
  return data.cartLinesRemove.cart
}
