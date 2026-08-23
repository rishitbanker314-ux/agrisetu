'use client';

import Link from 'next/link';
import { Sprout, FileText, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  created_at: string;
  metadata?: {
    crop: string;
    lat: number;
    lng: number;
    ndvi: number;
  };
}

interface Field {
  id: string;
  name: string;
  crop: string;
  lat: number;
  lng: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Load Reports
        const { data: reportsData } = await supabase
          .from('reports')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        if (reportsData) setReports(reportsData);

        // Load Fields
        const { data: fieldsData } = await supabase
          .from('fields')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        if (fieldsData) setFields(fieldsData);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleGenerateReport = async (field: Field) => {
    if (!userId) return;
    setIsGenerating(true);
    setShowFieldSelector(false);
    
    // Simulate generation time, then insert to DB
    setTimeout(async () => {
      // Mock NDVI score calculation based on coordinates (similar to Dashboard)
      const mockNdvi = Number((0.6 + (Math.sin(field.lat * 100) * 0.15)).toFixed(2));

      const newReport = {
        owner_id: userId,
        title: `Field Analysis: ${field.name}`,
        type: 'Crop Health Assessment',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: '1.2 MB',
        metadata: {
          crop: field.crop,
          lat: field.lat,
          lng: field.lng,
          ndvi: mockNdvi
        }
      };
      
      const { data, error } = await supabase
        .from('reports')
        .insert(newReport)
        .select()
        .single();
        
      if (!error && data) {
        setReports([data, ...reports]);
      }
      setIsGenerating(false);
    }, 1500);
  };

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
          <div className="flex gap-3 relative">
            <button className="bg-white border border-soft-line text-ink px-4 py-2 rounded-full text-sm font-medium hover:bg-moss/5 transition-colors flex items-center gap-2 shadow-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button 
              onClick={() => setShowFieldSelector(!showFieldSelector)}
              disabled={isGenerating || isLoading}
              className="bg-deep-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-moss transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} 
              {isGenerating ? 'Generating...' : 'Generate New Report'}
            </button>

            {/* Field Selector Dropdown */}
            {showFieldSelector && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-soft-line rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-3 bg-soft-line/30 border-b border-soft-line text-xs font-medium uppercase tracking-widest text-ink/50">
                  Select a Field
                </div>
                {fields.length === 0 ? (
                  <div className="p-4 text-sm text-ink/50 text-center">
                    No fields saved yet. Save a field on the Dashboard first.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {fields.map(field => (
                      <button
                        key={field.id}
                        onClick={() => handleGenerateReport(field)}
                        className="w-full text-left px-4 py-3 hover:bg-moss/5 border-b border-soft-line last:border-0 transition-colors"
                      >
                        <div className="font-medium text-deep-forest">{field.name}</div>
                        <div className="text-xs text-ink/60 mt-1 capitalize">{field.crop} • {field.lat.toFixed(4)}, {field.lng.toFixed(4)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-moss" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-ink/50 bg-white border border-soft-line rounded-xl shadow-sm">
            No reports generated yet. Click "Generate New Report" to create one.
          </div>
        ) : (
          <div className="bg-white border border-soft-line rounded-xl shadow-sm overflow-hidden">
            {reports.map((report, idx) => (
              <div key={report.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-moss/5 transition-colors ${idx !== reports.length - 1 ? 'border-b border-soft-line' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="bg-terracotta/10 p-3 rounded-lg shrink-0">
                    <FileText className="w-6 h-6 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-deep-forest font-medium mb-1">{report.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-ink/50 mt-2">
                      <span className="bg-soft-line/50 px-2 py-0.5 rounded-sm">{report.type}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                    </div>
                    {report.metadata && (
                      <div className="flex items-center gap-4 text-xs text-ink/70 mt-2 bg-paper-ivory px-3 py-1.5 rounded-md border border-soft-line/50 inline-flex">
                        <span className="capitalize"><strong>Crop:</strong> {report.metadata.crop}</span>
                        <span><strong>NDVI:</strong> {report.metadata.ndvi}</span>
                        <span><strong>Loc:</strong> {report.metadata.lat.toFixed(4)}, {report.metadata.lng.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="self-end md:self-auto flex items-center gap-2 mt-4 md:mt-0">
                  <Link 
                    href={`/en/reports/${report.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-deep-forest hover:bg-moss/10 transition-colors bg-white border border-soft-line px-4 py-2 rounded-full shadow-sm"
                  >
                    View Report
                  </Link>
                  <Link 
                    href={`/en/reports/${report.id}?print=true`}
                    className="flex items-center gap-2 text-sm font-medium text-moss hover:bg-moss hover:text-white transition-colors bg-white border border-soft-line px-4 py-2 rounded-full shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download <span className="text-[10px] opacity-70 font-normal ml-1">PDF</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
