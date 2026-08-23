'use client';

import Link from 'next/link';
import { Sprout, Satellite, Cpu, CloudRain, ArrowLeft } from 'lucide-react';

export default function PlatformPage() {
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

      <main className="flex-grow pt-32 pb-16 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif text-deep-forest font-medium tracking-tight mb-6">The Intelligence Engine</h1>
          <p className="text-lg md:text-xl text-ink/70 leading-relaxed font-light">AgriSetu combines multi-spectral satellite imagery, hyper-local weather forecasting, and generative AI to create the world's most advanced agricultural operating system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-soft-line shadow-sm hover:shadow-lg transition-all">
            <div className="bg-moss/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Satellite className="w-8 h-8 text-moss" />
            </div>
            <h3 className="text-2xl font-serif text-deep-forest mb-4">Orbital Monitoring</h3>
            <p className="text-ink/60 leading-relaxed">Continuous 10-meter resolution monitoring of your fields using Sentinel-2 and Landsat data streams, providing daily updates on NDVI, EVI, and soil moisture index.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-soft-line shadow-sm hover:shadow-lg transition-all">
            <div className="bg-terracotta/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <CloudRain className="w-8 h-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-serif text-deep-forest mb-4">Hyper-Local Climate</h3>
            <p className="text-ink/60 leading-relaxed">Micro-climate forecasting models accurate to within 1km². Receive predictive alerts for frost, extreme heat, and unseasonal rainfall before they impact your yield.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-soft-line shadow-sm hover:shadow-lg transition-all">
            <div className="bg-deep-forest/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Cpu className="w-8 h-8 text-deep-forest" />
            </div>
            <h3 className="text-2xl font-serif text-deep-forest mb-4">Generative Insights</h3>
            <p className="text-ink/60 leading-relaxed">Our proprietary agronomic LLM analyzes millions of data points to generate natural-language recommendations, acting as an expert agronomist in your pocket.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
