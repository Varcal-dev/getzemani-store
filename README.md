# Getzemani — Storefront

Frontend headless para Getzemani (skincare, wellness, movement, home) construido con Next.js 14 (App Router) + TypeScript + Tailwind v4, consumiendo Shopify vía Storefront API. Despliegue en Vercel.

## Identidad visual

- **Paleta**: linen/paper cálido, verde oliva (acento primario), arcilla apagada (acento secundario), tinta cálida en vez de negro puro.
- **Tipografía**: Fraunces (serif editorial, headlines) + Karla (sans, UI y cuerpo).
- **Tono**: elegante y tranquilo — sin mayúsculas sostenidas, sin fuente mono para etiquetas, sin flechas en los CTA.

## Estructura

```
app/
  layout.tsx              Providers de carrito + metadata
  page.tsx                Home: hero, categorías, grid de productos, franja de valores, cita editorial
  products/[handle]/      Página de producto individual
components/
  site-header.tsx          Header con navegación y contador de bolsa
  cart-drawer.tsx           Panel deslizante del carrito
  product-card.tsx          Tarjeta de producto (grid)
  product-detail.tsx        Galería + selección de variante + añadir al carrito
  site-footer.tsx            Footer compartido
context/
  cart-context.tsx          Estado del carrito (React Context + localStorage para el cart ID)
lib/
  shopify.ts                Todas las queries/mutations a Shopify Storefront API
  cart-actions.ts            Server Actions que envuelven las mutaciones del carrito (el token nunca llega al cliente)
```

## Carrito

Usa la Cart API de Shopify (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`). El `cart.id` se guarda en `localStorage` del navegador para persistir la bolsa entre visitas; todas las mutaciones reales ocurren en Server Actions (`lib/cart-actions.ts`), así que el Storefront token nunca se expone en el bundle del cliente. El checkout final redirige al `checkoutUrl` que devuelve Shopify.

## Variables de entorno (Vercel)

```
SHOPIFY_STORE_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxx
```

Ver `.env.local.example` para desarrollo local.

## Pendiente / próximos pasos

- Conectar categorías (Skin/Body/Movement/Home) a colecciones reales de Shopify en vez del ancla `#categories`.
- Definir estrategia de pricing (costo + envío + margen) para el catálogo de CJdropshipping.
- Imágenes de stock de Unsplash en el hero y las categorías son placeholders — reemplazar por fotografía real de producto/marca.

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # y completa tus credenciales
npm run dev
```
