import type { Metadata } from "next"
import { PolicyPage, PolicySection } from "@/components/policy-page"
import { getCollections } from "@/lib/shopify"

export const metadata: Metadata = {
  title: "Shipping | Getzemani",
  description:
    "Shipping times, coverage, and order tracking for Getzemani — shipped from our U.S. warehouse.",
}

export default async function ShippingPage() {
  const collections = await getCollections().catch(() => [])

  return (
    <PolicyPage
      collections={collections}
      eyebrow="Getzemani"
      title="Shipping"
      intro="Every Getzemani order ships from our warehouse in the United States, so you're never waiting on a package crossing an ocean."
    >
      <PolicySection title="Processing time">
        <p>
          Orders are prepared and handed off to the carrier within{" "}
          <strong className="font-semibold text-ink">2–3 business days</strong>{" "}
          of purchase. You&apos;ll get a shipping confirmation email with a
          tracking number as soon as your order leaves our warehouse.
        </p>
      </PolicySection>

      <PolicySection title="Delivery time">
        <p>
          Once shipped, delivery typically takes{" "}
          <strong className="font-semibold text-ink">3–7 business days</strong>,
          depending on your location within the U.S.
        </p>
        <p>
          Total time from order to delivery is usually{" "}
          <strong className="font-semibold text-ink">5–10 business days</strong>.
        </p>
      </PolicySection>

      <PolicySection title="Where we ship">
        <p>
          We currently ship to addresses within the{" "}
          <strong className="font-semibold text-ink">
            United States, with the exception of Alaska
          </strong>
          . We don&apos;t offer international shipping at this time.
        </p>
      </PolicySection>

      <PolicySection title="Tracking your order">
        <p>
          Once your order ships, you&apos;ll receive an email with a tracking
          link. If a few days go by and your tracking hasn&apos;t updated,
          reach out to us at{" "}
          <a href="mailto:getzemani.store.info@gmail.com" className="underline underline-offset-2 hover:text-ink">
            getzemani.store.info@gmail.com
          </a>{" "}
          and we&apos;ll look into it.
        </p>
      </PolicySection>

      <PolicySection title="Delays">
        <p>
          Delivery estimates are business days and don&apos;t include
          weekends or holidays. Occasionally weather or carrier delays can
          push delivery outside these windows — we&apos;ll help track things
          down if that happens.
        </p>
      </PolicySection>
    </PolicyPage>
  )
}
