import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="w-full bg-paper-ivory text-ink py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-t border-soft-line pt-12">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-deep-forest">
            <path d="M12 22V8" />
            <path d="M12 8c-3 0-6-3-6-6s3 6 6 6z" />
            <path d="M12 12c3 0 6-3 6-6s-3 6-6 6z" />
          </svg>
          <span className="font-serif text-xl font-medium tracking-tight text-ink">AgriSetu</span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center gap-6 md:gap-8 text-sm font-sans text-ink/80">
          <Link href="#" className="hover:text-moss transition-colors">Platform</Link>
          <Link href="#" className="hover:text-moss transition-colors">Solutions</Link>
          <Link href="#" className="hover:text-moss transition-colors">Field notes</Link>
          <Link href="#" className="hover:text-moss transition-colors">About</Link>
        </nav>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-sans text-ink/50 w-full md:w-auto mt-8 md:mt-0 justify-between md:justify-start">
          <Link href="#" className="hover:text-moss transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-moss transition-colors">Terms</Link>
          <span>&copy; {new Date().getFullYear()} AgriSetu</span>
          <div className="flex items-center gap-1 border-l border-soft-line pl-6">
            <span className="uppercase tracking-wider">EN</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

      </div>
    </footer>
  );
}
