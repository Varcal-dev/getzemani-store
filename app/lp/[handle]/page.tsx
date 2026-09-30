/* eslint-disable @next/next/no-img-element */
// app/lp/[handle]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { LandingCTA, LandingOptions, LandingPrice, LandingPurchase, LandingViewTracker } from "@/components/landing-cta";
import { getLandingProduct, trimAtWord } from "@/lib/landing";
import "./landing.css";

export const revalidate = 300;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const p = await getLandingProduct(handle).catch(() => null);
  if (!p) return {};
  const description = p.content.lede ?? trimAtWord(p.description, 155);
  return {
    title: `${p.title} | Getzemani`,
    description,
    openGraph: {
      title: p.title,
      description,
      images: p.images[0] ? [{ url: p.images[0].url }] : undefined,
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { handle } = await params;
  const p = await getLandingProduct(handle).catch(() => null);
  if (!p) notFound();

  const c = p.content;
  const hero = p.images[0];
  const band = p.images.slice(1, 3);
  const data = { productId: p.id, title: p.title, options: p.options, variants: p.variants };

  return (
    <>
      <main className="lw">
       <LandingPurchase data={data}>
        <LandingViewTracker />

        <section className="lw-hero">
          <div className="lw-wrap lw-hero-grid">
            <div>
              <p className="lw-brand">Getzemani</p>
              <h1>{c.headline ?? p.title}</h1>
              <p className="lw-lede">{c.lede ?? trimAtWord(p.description, 200)}</p>
              <LandingOptions />
              <div className="lw-buy">
                <LandingPrice />
                <LandingCTA />
              </div>
              {c.shippingNote && <p className="lw-note">{c.shippingNote}</p>}
            </div>
            {hero && (
              <div className="lw-stage">
                <div className="lw-glow" aria-hidden="true" />
                <div className="lw-arch">
                  <img src={hero.url} alt={hero.altText ?? p.title} />
                </div>
              </div>
            )}
          </div>
        </section>

        {(c.statement || !!c.features?.length) && (
          <section className="lw-section">
            <div className="lw-wrap">
              {c.statement && (
                <div className="lw-statement">
                  <h2>{c.statement.title}</h2>
                  <p>{c.statement.text}</p>
                </div>
              )}
              {!!c.features?.length && (
                <div className="lw-feat">
                  {c.features.map((f) => (
                    <div className="lw-feat-item" key={f.title}>
                      <h3>{f.title}</h3>
                      <p>{f.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {band.length > 0 && (
                <div className="lw-band">
                  {band.map((im) => (
                    <img key={im.url} src={im.url} alt={im.altText ?? p.title} loading="lazy" />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {!!c.ritual?.length && (
          <section className="lw-section lw-dark">
            <div className="lw-wrap">
              <div className="lw-statement">
                <h2>{c.ritualTitle ?? "How to use it"}</h2>
              </div>
              <div className="lw-steps">
                {c.ritual.map((s, i) => (
                  <div className="lw-step" key={s.title}>
                    <div className="lw-step-n">{i + 1}</div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!!c.specs?.length && (
          <section className="lw-section">
            <div className="lw-wrap">
              <h2 style={{ fontSize: "clamp(1.9rem,4vw,3rem)" }}>The details</h2>
              <dl className="lw-specs">
                {c.specs.map((s) => (
                  <div className="lw-spec" key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {!!c.faqs?.length && (
          <section className="lw-section" style={{ paddingTop: 0 }}>
            <div className="lw-wrap">
              <h2 style={{ fontSize: "clamp(1.9rem,4vw,3rem)", marginBottom: "2rem" }}>Questions</h2>
              {c.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="lw-section lw-dark lw-final">
          <div className="lw-wrap">
            <h2>{c.closing ?? p.title}</h2>
            <div className="lw-buy">
              <LandingPrice />
              <LandingCTA />
            </div>
            {c.shippingNote && <p className="lw-note">{c.shippingNote}</p>}
          </div>
        </section>

        {c.legal && (
          <section className="lw-legal">
            <div className="lw-wrap">
              <p>{c.legal}</p>
            </div>
          </section>
        )}

        <div className="lw-sticky">
          <LandingPrice />
          <LandingCTA />
        </div>
       </LandingPurchase>
      </main>

      <div className="lw-foot">
        <SiteFooter />
      </div>
    </>
  );
}