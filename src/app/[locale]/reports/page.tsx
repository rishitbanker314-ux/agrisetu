'use client';

import Link from 'next/link';
import { Sprout, FileText, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { useAppStore, Report } from '@/store/appStore';
import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const { reports, addReport } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Hydration safety for Zustand persist
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate generation time
    setTimeout(() => {
      const newReport: Report = {
        id: Date.now().toString(),
        title: `Ad-hoc Drone Analysis #${Math.floor(Math.random() * 1000)}`,
        type: 'On-Demand',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: '1.2 MB'
      };
      addReport(newReport);
      setIsGenerating(false);
    }, 1500);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest">
      <header className="bg-white border-b border-soft-line z-[9999] flex items-center justify-between px-6 h-16 shrink-0 relative shadow-sm">
        <Link href="/en/dashboard" className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-deep-forest" />
          <span className="font-serif text-xl tracking-tight text-ink font-medium">AgriSetu</span>
        </Link>
        <div className="text-xs font-medium uppercase tracking-widest text-ink/50">Reports & Insights</div>
      </header>

      <main className="flex-grow p-6 md:p-12 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-deep-forest font-medium tracking-tight mb-2">Intelligence Reports</h1>
            <p className="text-ink/60 max-w-xl leading-relaxed">Download and review highly detailed satellite-derived analytics, soil assessments, and yield predictions.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-soft-line text-ink px-4 py-2 rounded-full text-sm font-medium hover:bg-moss/5 transition-colors flex items-center gap-2 shadow-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-deep-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-moss transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} 
              {isGenerating ? 'Generating...' : 'Generate New Report'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-soft-line rounded-xl shadow-sm overflow-hidden">
          {reports.map((report, idx) => (
            <div key={report.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-moss/5 transition-colors ${idx !== reports.length - 1 ? 'border-b border-soft-line' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="bg-terracotta/10 p-3 rounded-lg shrink-0">
                  <FileText className="w-6 h-6 text-terracotta" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-deep-forest font-medium mb-1">{report.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-ink/50">
                    <span className="bg-soft-line/50 px-2 py-0.5 rounded-sm">{report.type}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                  </div>
                </div>
              </div>
              <button className="self-end md:self-auto flex items-center gap-2 text-sm font-medium text-moss hover:text-deep-forest transition-colors bg-white border border-soft-line px-4 py-2 rounded-full shadow-sm">
                <Download className="w-4 h-4" /> Download PDF <span className="text-[10px] text-ink/40 font-normal ml-1">({report.size})</span>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
