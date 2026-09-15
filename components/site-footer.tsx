export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-olive-deep text-paper">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 py-14 md:flex-row md:items-start md:justify-between lg:px-10">
        <div className="max-w-xs">
          <p className="font-serif text-2xl italic">Getzemani</p>
          <p className="mt-3 text-sm leading-6 text-paper/70">
            Skincare, wellness, and home rituals for people who&apos;d rather feel better than do more.
          </p>
        </div>
        <div className="flex gap-14">
          <div className="flex flex-col gap-3 text-sm text-paper/80">
            <p className="text-paper/50">Shop</p>
            <a href="/#categories" className="hover:text-paper">Skin</a>
            <a href="/#categories" className="hover:text-paper">Body</a>
            <a href="/#categories" className="hover:text-paper">Movement</a>
            <a href="/#categories" className="hover:text-paper">Home</a>
          </div>
          <div className="flex flex-col gap-3 text-sm text-paper/80">
            <p className="text-paper/50">Getzemani</p>
            <a href="#top" className="hover:text-paper">About</a>
            <a href="#top" className="hover:text-paper">Contact</a>
            <a href="#top" className="hover:text-paper">Instagram</a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] border-t border-paper/10 px-5 py-5 text-xs text-paper/50 lg:px-10">
        © 2026 Getzemani
      </div>
    </footer>
  )
}
