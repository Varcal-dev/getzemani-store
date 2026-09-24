import type { Metadata } from "next"
import { PolicyPage, PolicySection } from "@/components/policy-page"
import { getCollections } from "@/lib/shopify"

export const metadata: Metadata = {
  title: "Returns | Getzemani",
  description:
    "Getzemani's 30-day return policy — free returns and refunds, started by email.",
}

export default async function ReturnsPage() {
  const collections = await getCollections().catch(() => [])

  return (
    <PolicyPage
      collections={collections}
      eyebrow="Getzemani"
      title="Returns"
      intro="If something isn't right, you have 30 days from delivery to send it back — return shipping is on us."
    >
      <PolicySection title="Return window">
        <p>
          You can request a return within{" "}
          <strong className="font-semibold text-ink">
            30 days of the delivery date
          </strong>
          . Items should be unused and in their original condition and
          packaging whenever possible.
        </p>
      </PolicySection>

      <PolicySection title="Return shipping">
        <p>
          Returns are{" "}
          <strong className="font-semibold text-ink">free</strong> — we
          cover the cost of the return shipping label once your return is
          approved.
        </p>
      </PolicySection>

      <PolicySection title="Refunds">
        <p>
          Approved returns are issued as a{" "}
          <strong className="font-semibold text-ink">refund</strong> to your
          original payment method once the item is received and inspected.
        </p>
      </PolicySection>

      <PolicySection title="Items that can't be returned">
        <p>
          For hygiene reasons, opened or used personal care and beauty items
          can&apos;t be returned. This is standard practice across skincare
          and body care and helps us guarantee every product you receive is
          untouched.
        </p>
      </PolicySection>

      <PolicySection title="How to start a return">
        <p>
          Email us at{" "}
          <a href="mailto:hello@getzemani.store" className="underline underline-offset-2 hover:text-ink">
            hello@getzemani.store
          </a>{" "}
          with your order number and the reason for the return. We&apos;ll
          confirm eligibility and send you a prepaid return label and the
          next steps.
        </p>
      </PolicySection>
    </PolicyPage>
  )
}
