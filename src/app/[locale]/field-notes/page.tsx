'use client';

import Link from 'next/link';
import { Sprout, ArrowLeft, ArrowRight } from 'lucide-react';

const articles = [
  { id: 1, title: 'The Impact of El Niño on Global Wheat Yields', category: 'Climate Analysis', date: 'October 14, 2025' },
  { id: 2, title: 'Optimizing Nitrogen Application with Multispectral Imagery', category: 'Agronomy', date: 'October 02, 2025' },
  { id: 3, title: 'Predicting Locust Swarms using Satellite Telemetry', category: 'Risk Management', date: 'September 28, 2025' },
];

export default function FieldNotesPage() {
  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest">
      <header className="bg-transparent absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-24">
        <Link href="/" className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-deep-forest" />
          <span className="font-serif text-2xl tracking-tight text-deep-forest font-bold">AgriSetu</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-deep-forest flex items-center gap-2 hover:text-moss transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="flex-grow pt-32 pb-16 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-serif text-deep-forest font-medium tracking-tight mb-6">Field Notes</h1>
          <p className="text-lg md:text-xl text-ink/70 leading-relaxed font-light">Dispatches from the intersection of agriculture, technology, and global markets. Written by our team of expert agronomists and data scientists.</p>
        </div>

        <div className="space-y-12">
          {articles.map((article) => (
            <article key={article.id} className="group cursor-pointer">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink/50 mb-3">
                <span className="text-moss">{article.category}</span>
                <span>&bull;</span>
                <span>{article.date}</span>
              </div>
              <h2 className="text-3xl font-serif text-deep-forest mb-4 group-hover:text-moss transition-colors">{article.title}</h2>
              <div className="flex items-center gap-2 text-sm font-medium text-ink hover:text-moss transition-colors">
                Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
