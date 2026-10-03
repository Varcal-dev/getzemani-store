/**
 * El catálogo de productos en Meta (sincronizado por el canal nativo de
 * Shopify) identifica cada artículo con su ID numérico de Shopify.
 * La Storefront API, en cambio, entrega GIDs como
 * "gid://shopify/ProductVariant/44123456789". Si mandamos el GID completo
 * como content_id en los eventos del pixel, Meta nunca lo hace coincidir
 * con el catálogo (de ahí el 0% de "proporción de coincidencias").
 * Esta función se queda solo con el número final.
 */
export function toCatalogContentId(gid: string): string {
  const match = gid.match(/(\d+)$/)
  return match ? match[1] : gid
}
