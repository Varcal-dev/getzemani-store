import type { Metadata } from "next"
import { PolicyPage } from "@/components/policy-page"
import { getCollections } from "@/lib/shopify"

export const metadata: Metadata = {
  title: "FAQ | Getzemani",
  description: "Answers to common questions about shipping, returns, and orders at Getzemani.",
}

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Where do you ship from?",
    answer:
      "Every order ships from our warehouse in the United States — nothing crosses an international border to reach you.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders are processed within 2–3 business days, then typically arrive within 3–7 business days after that — usually 5–10 business days total.",
  },
  {
    question: "Do you ship outside the U.S.?",
    answer:
      "Not yet. We currently ship within the United States, with the exception of Alaska.",
  },
  {
    question: "What's your return policy?",
    answer:
      "You have 30 days from delivery to return an item, and return shipping is free. Once we receive and inspect it, you'll get a refund to your original payment method. For hygiene reasons, opened or used personal care and beauty items can't be returned.",
  },
  {
    question: "How do I start a return?",
    answer:
      "Email hello@getzemani.store with your order number and reason for the return, and we'll send you a prepaid return label and next steps.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards through Shopify Payments, plus Shop Pay, Apple Pay, Google Pay, and PayPal.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "If your order hasn't shipped yet, email us right away at hello@getzemani.store and we'll do our best to change or cancel it. Once it ships, it falls under our standard return policy.",
  },
  {
    question: "How do I track my order?",
    answer:
      "You'll get a shipping confirmation email with a tracking link as soon as your order leaves our warehouse.",
  },
]

export default async function FaqPage() {
  const collections = await getCollections().catch(() => [])

  return (
    <PolicyPage
      collections={collections}
      eyebrow="Getzemani"
      title="Frequently asked questions"
      intro="Quick answers about orders, shipping, and returns. Don't see what you need? Reach us at hello@getzemani.store."
    >
      <div className="divide-y divide-line border-t border-line">
        {FAQS.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-ink marker:content-none">
              {item.question}
              <span
                aria-hidden
                className="shrink-0 text-xl text-terracotta transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-lg text-sm leading-7 text-ink-soft">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </PolicyPage>
  )
}
