'use client';

import Link from 'next/link';
import { Sprout, TrendingUp, ShieldCheck, Leaf, ArrowLeft } from 'lucide-react';

export default function SolutionPage() {
  return (
    <div className="min-h-screen bg-deep-forest flex flex-col font-sans selection:bg-moss/30 selection:text-white text-paper-ivory">
      <header className="bg-transparent absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-24">
        <Link href="/" className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-moss" />
          <span className="font-serif text-2xl tracking-tight text-white font-bold">AgriSetu</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-white/70 flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="flex-grow pt-32 pb-16 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif text-white font-medium tracking-tight mb-6">Built for Resilience</h1>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed font-light">Transform unpredictable environmental variables into actionable data. Our solution protects your yield and optimizes resource allocation across every acre.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <TrendingUp className="w-8 h-8 text-moss mb-6" />
            <h3 className="text-2xl font-serif text-white mb-4">Yield Optimization</h3>
            <p className="text-white/60 leading-relaxed">Identify underperforming zones within your fields before they impact your bottom line. Apply targeted interventions only where they are needed.</p>
          </div>

          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <ShieldCheck className="w-8 h-8 text-terracotta mb-6" />
            <h3 className="text-2xl font-serif text-white mb-4">Risk Mitigation</h3>
            <p className="text-white/60 leading-relaxed">Early warning systems for disease outbreaks, pest infestations, and extreme weather events. Protect your investment with 48-hour advance notice.</p>
          </div>

          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <Leaf className="w-8 h-8 text-emerald-400 mb-6" />
            <h3 className="text-2xl font-serif text-white mb-4">Sustainable Input</h3>
            <p className="text-white/60 leading-relaxed">Reduce fertilizer and water usage by up to 30%. Our variable rate application maps ensure you are environmentally and economically sustainable.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
