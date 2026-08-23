'use client';

import Link from 'next/link';
import { Sprout, TrendingUp, ShieldCheck, Leaf, ArrowLeft, ArrowRight, CheckCircle2, BarChart3, Activity } from 'lucide-react';

export default function SolutionPage() {
  return (
    <div className="min-h-screen bg-deep-forest flex flex-col font-sans selection:bg-moss/30 selection:text-white text-paper-ivory relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-moss/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full max-w-2xl h-[400px] bg-emerald-900/40 blur-[150px] rounded-full pointer-events-none"></div>

      <header className="bg-transparent relative z-50 flex items-center justify-between px-6 h-24">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-white/10 p-2 rounded-lg group-hover:bg-moss/20 transition-colors">
            <Sprout className="w-6 h-6 text-moss" />
          </div>
          <span className="font-serif text-2xl tracking-tight text-white font-bold">AgriSetu</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-white/70 flex items-center gap-2 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="flex-grow pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-32 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-moss/20 text-moss border border-moss/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
            <Activity className="w-4 h-4" /> Agronomic Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white font-medium tracking-tight mb-8 leading-tight">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-moss to-emerald-400">Resilience</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light mb-12 max-w-3xl mx-auto">
            Transform unpredictable environmental variables into actionable data. Our solution protects your yield and optimizes resource allocation across every acre.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/en/login" className="w-full sm:w-auto bg-moss text-deep-forest hover:bg-emerald-400 px-8 py-4 rounded-full font-medium transition-all shadow-[0_0_40px_rgba(134,239,172,0.3)] hover:shadow-[0_0_60px_rgba(134,239,172,0.4)] flex items-center justify-center gap-2">
              Start Optimizing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/en/platform" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-medium transition-all flex items-center justify-center">
              Explore Platform
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {/* Feature 1 */}
          <div className="group bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-moss/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-32 h-32 text-moss" />
            </div>
            <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-7 h-7 text-moss" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">Yield Optimization</h3>
            <p className="text-white/60 leading-relaxed mb-8">
              Identify underperforming zones within your fields before they impact your bottom line. Apply targeted interventions only where they are needed, increasing overall farm output by up to 15%.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-moss" /> Variable rate application maps</li>
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-moss" /> Historical yield benchmarking</li>
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-moss" /> Predictive harvest timing</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-terracotta/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-32 h-32 text-terracotta" />
            </div>
            <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-7 h-7 text-terracotta" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">Risk Mitigation</h3>
            <p className="text-white/60 leading-relaxed mb-8">
              Early warning systems for disease outbreaks, pest infestations, and extreme weather events. Protect your investment with 48-hour advance notice using our hyper-local modeling.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-terracotta" /> Frost and heat wave alerts</li>
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-terracotta" /> Spacial disease tracking</li>
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-terracotta" /> Automated crop insurance reports</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-emerald-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <Leaf className="w-32 h-32 text-emerald-400" />
            </div>
            <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Leaf className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">Sustainable Input</h3>
            <p className="text-white/60 leading-relaxed mb-8">
              Reduce fertilizer and water usage by up to 30%. Our variable rate application maps ensure you are environmentally and economically sustainable without sacrificing yield.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Soil moisture index tracking</li>
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Nitrogen optimization</li>
              <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Carbon credit verification</li>
            </ul>
          </div>
        </div>

        {/* Stats / Proof Section */}
        <div className="bg-moss rounded-3xl p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-400/20 blur-3xl rounded-full"></div>
          
          <div className="md:w-1/2 relative z-10">
            <h2 className="text-4xl font-serif text-deep-forest font-medium tracking-tight mb-6">Proven results across millions of acres.</h2>
            <p className="text-deep-forest/80 text-lg leading-relaxed">
              AgriSetu is trusted by commercial farms and agronomists worldwide to make data-driven decisions that impact global food security.
            </p>
          </div>
          
          <div className="md:w-1/2 flex flex-col sm:flex-row gap-8 relative z-10">
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm flex-1">
              <div className="text-4xl font-bold text-deep-forest mb-2">30%</div>
              <div className="text-sm font-medium text-deep-forest/80 uppercase tracking-widest">Input Reduction</div>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm flex-1">
              <div className="text-4xl font-bold text-deep-forest mb-2">15%</div>
              <div className="text-sm font-medium text-deep-forest/80 uppercase tracking-widest">Yield Increase</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
