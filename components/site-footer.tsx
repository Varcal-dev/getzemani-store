export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-deep">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 md:grid-cols-[1.4fr_2fr] lg:px-10 lg:py-20">
        <div className="max-w-sm">
          <p className="font-serif text-4xl tracking-[-.03em] text-ink">
            Getzemani
          </p>
          <p className="mt-5 text-sm leading-7 text-ink-soft">
            Care, at the pace of a garden.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-3 text-ink-soft">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-ink">
              Shop
            </p>
            <a href="/#shop" className="hover:text-ink">
              Skin
            </a>
            <a href="/#shop" className="hover:text-ink">
              Body
            </a>
            <a href="/#rituals" className="hover:text-ink">
              Wellness
            </a>
            <a href="/#shop" className="hover:text-ink">
              Home
            </a>
          </div>
          <div className="flex flex-col gap-3 text-ink-soft">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-ink">
              Help
            </p>
            <a href="mailto:hello@getzemani.store" className="hover:text-ink">
              Contact
            </a>
            <a href="/#top" className="hover:text-ink">
              Shipping
            </a>
            <a href="/#top" className="hover:text-ink">
              Returns
            </a>
            <a href="/#top" className="hover:text-ink">
              FAQ
            </a>
          </div>
          <div className="flex flex-col gap-3 text-ink-soft">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-ink">
              About
            </p>
            <a href="/#philosophy" className="hover:text-ink">
              Our story
            </a>
            <a href="/#top" className="hover:text-ink">
              Our approach
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] border-t border-line px-5 py-5 text-xs text-ink-soft lg:px-10">
        © 2026 Getzemani
      </div>
    </footer>
  );
}
