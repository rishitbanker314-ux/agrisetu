'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function SiteHeader() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  const navItems = [
    { label: 'Platform', href: '#' },
    { label: 'Solutions', href: '#' },
    { label: 'Field notes', href: '#' },
    { label: 'About', href: '#' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-paper-ivory/90 backdrop-blur-md border-b border-soft-line py-3 shadow-sm'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-deep-forest group-hover:text-moss transition-colors">
              <path d="M12 22V8" />
              <path d="M12 8c-3 0-6-3-6-6s3 6 6 6z" />
              <path d="M12 12c3 0 6-3 6-6s-3 6-6 6z" />
            </svg>
            <span className="font-serif text-xl font-medium tracking-tight text-ink">AgriSetu</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="text-sm font-sans text-ink hover:text-moss transition-colors relative group"
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-moss transition-all group-hover:w-full"></span>
              </motion.a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <motion.a
              href="/en/login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm font-sans text-ink hover:text-moss transition-colors"
            >
              Log in
            </motion.a>
            <motion.a
              href="/en/dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              className="bg-deep-forest text-paper-ivory px-5 py-2.5 rounded-full text-sm font-sans hover:bg-ink hover:-translate-y-0.5 transition-all"
            >
              Open the field view &rarr;
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-ink"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <motion.div 
        initial={{ opacity: 0, y: '-100%' }}
        animate={{ opacity: mobileMenuOpen ? 1 : 0, y: mobileMenuOpen ? 0 : '-100%' }}
        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        className={`fixed inset-0 z-50 bg-paper-ivory p-6 md:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-deep-forest">
              <path d="M12 22V8" />
              <path d="M12 8c-3 0-6-3-6-6s3 6 6 6z" />
              <path d="M12 12c3 0 6-3 6-6s-3 6-6 6z" />
            </svg>
            <span className="font-serif text-xl font-medium tracking-tight text-ink">AgriSetu</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-8 text-2xl font-serif">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="text-ink" onClick={() => setMobileMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <div className="h-[1px] w-full bg-soft-line my-4"></div>
          <a href="/en/login" className="text-lg font-sans text-ink">Log in</a>
          <a href="/en/dashboard" className="bg-deep-forest text-paper-ivory text-center py-4 rounded-full text-lg font-sans w-full">
            Open the field view &rarr;
          </a>
        </nav>
      </motion.div>
    </>
  );
}
