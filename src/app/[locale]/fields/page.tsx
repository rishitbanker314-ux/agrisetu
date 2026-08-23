'use client';

import Link from 'next/link';
import { Sprout, Map as MapIcon, Plus, ChevronRight, Settings } from 'lucide-react';

const fields = [
  { id: 1, name: 'North Field', crop: 'Wheat', area: '12.4 ha', status: 'Healthy', lastUpdate: '5m ago' },
  { id: 2, name: 'West Field', crop: 'Corn', area: '8.2 ha', status: 'Water Stress', lastUpdate: '1h ago' },
  { id: 3, name: 'Lowland Plot', crop: 'Rice', area: '15.1 ha', status: 'Harvest Ready', lastUpdate: '2h ago' },
];

export default function FieldsPage() {
  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest">
      {/* Simple Header */}
      <header className="bg-white border-b border-soft-line z-[9999] flex items-center justify-between px-6 h-16 shrink-0 relative shadow-sm">
        <Link href="/en/dashboard" className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-deep-forest" />
          <span className="font-serif text-xl tracking-tight text-ink font-medium">AgriSetu</span>
        </Link>
        <div className="text-xs font-medium uppercase tracking-widest text-ink/50">My Fields</div>
      </header>

      <main className="flex-grow p-6 md:p-12 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-deep-forest font-medium tracking-tight mb-2">Registered Fields</h1>
            <p className="text-ink/60 max-w-xl leading-relaxed">Manage your agricultural plots, monitor crop cycles, and review historical performance data across all registered territories.</p>
          </div>
          <button className="bg-deep-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-moss transition-colors flex items-center gap-2 shadow-lg">
            <Plus className="w-4 h-4" /> Add New Field
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(field => (
            <div key={field.id} className="bg-white border border-soft-line rounded-xl p-5 shadow-sm hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-moss/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="bg-moss/10 p-2 rounded-lg">
                  <MapIcon className="w-5 h-5 text-moss" />
                </div>
                <button className="text-ink/40 hover:text-ink transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-xl font-serif text-deep-forest font-medium mb-1">{field.name}</h3>
              <p className="text-xs uppercase tracking-widest text-ink/50 mb-4">{field.crop} &bull; {field.area}</p>
              
              <div className="flex justify-between items-end border-t border-soft-line pt-4 mt-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Current Status</div>
                  <div className={`text-sm font-medium ${field.status === 'Water Stress' ? 'text-terracotta' : 'text-moss'}`}>
                    {field.status}
                  </div>
                </div>
                <Link href="/en/dashboard" className="w-8 h-8 rounded-full bg-paper-ivory flex items-center justify-center text-ink hover:bg-moss hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
