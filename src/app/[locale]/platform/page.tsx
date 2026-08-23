'use client';

import Link from 'next/link';
import { Sprout, Satellite, Cpu, CloudRain, ArrowLeft, ArrowRight, Database, Network, LineChart, Globe } from 'lucide-react';

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-50 pointer-events-none"></div>

      <header className="bg-transparent relative z-50 flex items-center justify-between px-6 h-24 border-b border-soft-line/50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-deep-forest/5 p-2 rounded-lg group-hover:bg-moss/20 transition-colors">
            <Sprout className="w-6 h-6 text-deep-forest" />
          </div>
          <span className="font-serif text-2xl tracking-tight text-deep-forest font-bold">AgriSetu</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-deep-forest flex items-center gap-2 hover:text-moss transition-colors bg-white px-4 py-2 rounded-full border border-soft-line shadow-sm hover:shadow-md">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="flex-grow pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-deep-forest border border-soft-line px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <Network className="w-4 h-4 text-moss" /> Architecture
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-deep-forest font-medium tracking-tight mb-8 leading-tight">
            The Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-deep-forest to-moss">Engine</span>
          </h1>
          <p className="text-xl md:text-2xl text-ink/70 leading-relaxed font-light mb-12 max-w-3xl mx-auto">
            AgriSetu combines multi-spectral satellite imagery, hyper-local weather forecasting, and generative AI to create the world's most advanced agricultural operating system.
          </p>
        </div>

        {/* Technical Layers Section */}
        <div className="space-y-12 mb-32">
          
          {/* Layer 1: Data */}
          <div className="bg-white rounded-3xl border border-soft-line shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-500">
            <div className="md:w-1/3 bg-slate-50 p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-soft-line group-hover:bg-slate-100 transition-colors">
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-soft-line">
                <Database className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Layer 01</div>
              <h2 className="text-3xl font-serif text-deep-forest mb-4">Data Ingestion</h2>
              <p className="text-ink/60 leading-relaxed">Continuous, global-scale data collection from orbital and terrestrial sources.</p>
            </div>
            <div className="md:w-2/3 p-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <Satellite className="w-6 h-6 text-indigo-400 mb-4" />
                <h4 className="text-lg font-bold text-deep-forest mb-2">Multi-Spectral Satellites</h4>
                <p className="text-sm text-ink/70">10-meter resolution imagery from Sentinel-2 and Landsat 8/9, processed daily to calculate NDVI, EVI, and NDWI indices.</p>
              </div>
              <div>
                <Globe className="w-6 h-6 text-indigo-400 mb-4" />
                <h4 className="text-lg font-bold text-deep-forest mb-2">Topographical Mapping</h4>
                <p className="text-sm text-ink/70">High-resolution DEM (Digital Elevation Model) data to analyze slope, water flow accumulation, and erosion risks.</p>
              </div>
              <div>
                <CloudRain className="w-6 h-6 text-indigo-400 mb-4" />
                <h4 className="text-lg font-bold text-deep-forest mb-2">Hyper-Local Weather</h4>
                <p className="text-sm text-ink/70">Integration with global meteorological networks providing accurate forecasts at a 1km² spatial resolution.</p>
              </div>
            </div>
          </div>

          {/* Layer 2: Compute */}
          <div className="bg-white rounded-3xl border border-soft-line shadow-sm overflow-hidden flex flex-col md:flex-row-reverse group hover:shadow-xl transition-all duration-500">
            <div className="md:w-1/3 bg-slate-50 p-12 flex flex-col justify-center border-b md:border-b-0 md:border-l border-soft-line group-hover:bg-slate-100 transition-colors">
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-soft-line">
                <Cpu className="w-8 h-8 text-terracotta" />
              </div>
              <div className="text-xs font-bold text-terracotta uppercase tracking-widest mb-2">Layer 02</div>
              <h2 className="text-3xl font-serif text-deep-forest mb-4">Compute & AI</h2>
              <p className="text-ink/60 leading-relaxed">Proprietary machine learning models that transform raw data into agronomic intelligence.</p>
            </div>
            <div className="md:w-2/3 p-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <Network className="w-6 h-6 text-terracotta/70 mb-4" />
                <h4 className="text-lg font-bold text-deep-forest mb-2">Agronomic LLM</h4>
                <p className="text-sm text-ink/70">A specialized Large Language Model trained on decades of agronomic research, capable of answering complex farming queries instantly.</p>
              </div>
              <div>
                <LineChart className="w-6 h-6 text-terracotta/70 mb-4" />
                <h4 className="text-lg font-bold text-deep-forest mb-2">Predictive Yield Modeling</h4>
                <p className="text-sm text-ink/70">Machine learning algorithms that predict harvest yields based on historical performance, current biomass, and forecasted weather.</p>
              </div>
            </div>
          </div>

          {/* Layer 3: Application */}
          <div className="bg-white rounded-3xl border border-soft-line shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-500">
            <div className="md:w-1/3 bg-slate-50 p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-soft-line group-hover:bg-slate-100 transition-colors">
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-soft-line">
                <Sprout className="w-8 h-8 text-moss" />
              </div>
              <div className="text-xs font-bold text-moss uppercase tracking-widest mb-2">Layer 03</div>
              <h2 className="text-3xl font-serif text-deep-forest mb-4">Application</h2>
              <p className="text-ink/60 leading-relaxed">The intuitive interfaces and tools that put the power of AgriSetu in the hands of the farmer.</p>
            </div>
            <div className="md:w-2/3 p-12 flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-serif text-deep-forest mb-6">Ready to see it in action?</h3>
              <p className="text-ink/70 mb-8 max-w-md">Experience the application layer firsthand. Map your fields, generate reports, and get AI insights today.</p>
              <Link href="/en/login" className="bg-deep-forest text-white hover:bg-moss px-8 py-4 rounded-full font-medium transition-all shadow-md flex items-center gap-2">
                Open Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
