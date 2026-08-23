'use client';

import Link from 'next/link';
import { Sprout, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
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

      <main className="flex-grow pt-32 pb-16 px-6 md:px-12 max-w-3xl mx-auto w-full text-center">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-serif text-deep-forest font-medium tracking-tight mb-8">Our Mission</h1>
          <div className="w-16 h-1 bg-moss mx-auto mb-8"></div>
          
          <div className="space-y-8 text-lg text-ink/80 leading-relaxed font-serif">
            <p>
              By 2050, the global population will reach 9.7 billion. To feed this growing population, global food production must increase by 70%. At the same time, climate change is making agricultural yields more volatile and unpredictable than ever before.
            </p>
            <p>
              <strong className="text-deep-forest font-bold">AgriSetu</strong> was founded on the belief that the solution to this crisis lies in data. By combining satellite imagery, hyper-local climate models, and artificial intelligence, we are building an intelligence layer for the physical world.
            </p>
            <p>
              We empower farmers, cooperatives, and agribusinesses to make proactive, data-driven decisions. Because when you can predict the future of a field, you can secure the future of food.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
