'use client';

import Link from 'next/link';
import { Calendar, Filter, FileText, Download, Menu, Sprout, Loader2, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import NavigationSidebar from '@/components/NavigationSidebar';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { generateFieldIntelligence } from '@/lib/fieldIntelligence';

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
    areaHectares?: number;
    estimatedValue?: number;
    diseaseRisk?: string;
    soilMoisture?: number;
    soilPh?: number;
    forecast?: {
      maxTemps: number[];
      minTemps: number[];
      precipitation: number[];
    };
    temporal?: {
      ndviProgression: number[];
      diseaseRisk: string[];
      estimatedValue: number[];
    };
  };
}

interface Field {
  id: string;
  name: string;
  crop: string;
  lat: number;
  lng: number;
  boundary?: any[];
  area?: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterCrop, setFilterCrop] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const uniqueCrops = Array.from(new Set(reports.map(r => r.metadata?.crop).filter(Boolean)));

  const filteredReports = reports
    .filter(r => filterCrop ? r.metadata?.crop?.toLowerCase() === filterCrop.toLowerCase() : true)
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
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
    
    try {
      // Run the Intelligent Decision Engine
      const intelligence = await generateFieldIntelligence(
        field.lat, 
        field.lng, 
        field.boundary, 
        field.crop, 
        field.area || 1 // default to 1 hectare if unknown
      );

      // We use the most immediate forecast metrics for the report snapshot
      const currentEstimatedValue = intelligence.temporal.estimatedValue[0] || 0;
      const currentDiseaseRisk = intelligence.temporal.diseaseRisk[0] || 'Low';

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
          ndvi: intelligence.ndvi,
          areaHectares: field.area || 0,
          estimatedValue: currentEstimatedValue,
          diseaseRisk: currentDiseaseRisk,
          soilMoisture: intelligence.soil.moisture,
          soilPh: intelligence.soil.pH,
          forecast: intelligence.forecast,
          temporal: intelligence.temporal
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
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);
        
      if (!error) {
        setReports(reports.filter(r => r.id !== reportId));
        setReportToDelete(null);
      } else {
        console.error("Failed to delete report:", error);
        toast.error("Could not delete the report. Please try again.");
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest">
      <header className="bg-white border-b border-soft-line z-[9999] flex items-center justify-between px-4 md:px-6 h-16 shrink-0 relative shadow-sm">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-ink/70 hover:bg-moss/10 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/en" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Sprout className="w-6 h-6 text-deep-forest" />
          <span className="font-serif text-xl tracking-tight text-ink font-medium hidden sm:block">AgriSetu</span>
        </Link>
        <div className="text-xs font-medium uppercase tracking-widest text-ink/50">Reports & Insights</div>
        <NavigationSidebar 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen} 
          user={user} 
        />
      </header>

      <main className="flex-grow p-6 md:p-12 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-deep-forest font-medium tracking-tight mb-2">Intelligence Reports</h1>
            <p className="text-ink/60 max-w-xl leading-relaxed">Download and review highly detailed satellite-derived analytics, soil assessments, and yield predictions.</p>
          </div>
          <div className="flex gap-3 relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`bg-white border border-soft-line text-ink px-4 py-2 rounded-full text-sm font-medium hover:bg-moss/5 transition-colors flex items-center gap-2 shadow-sm ${showFilterDropdown || filterCrop ? 'bg-moss/5 border-moss text-moss' : ''}`}
            >
              <Filter className="w-4 h-4" /> Filter {filterCrop && `(${filterCrop})`}
            </button>
            
            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-soft-line rounded-xl shadow-lg z-50 overflow-hidden p-4">
                <div className="mb-4">
                  <h4 className="text-xs font-medium uppercase tracking-widest text-ink/50 mb-2">Sort By Date</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSortOrder('newest')}
                      className={`flex-1 py-1.5 text-xs rounded-md border ${sortOrder === 'newest' ? 'bg-moss text-white border-moss' : 'bg-paper-ivory text-ink/70 border-soft-line hover:border-moss/50'}`}
                    >
                      Newest
                    </button>
                    <button 
                      onClick={() => setSortOrder('oldest')}
                      className={`flex-1 py-1.5 text-xs rounded-md border ${sortOrder === 'oldest' ? 'bg-moss text-white border-moss' : 'bg-paper-ivory text-ink/70 border-soft-line hover:border-moss/50'}`}
                    >
                      Oldest
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium uppercase tracking-widest text-ink/50 mb-2">Filter by Crop</h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setFilterCrop(null)}
                      className={`px-3 py-1 text-xs rounded-full border ${!filterCrop ? 'bg-moss/10 text-deep-forest border-moss' : 'bg-paper-ivory text-ink/70 border-soft-line hover:border-moss/50'}`}
                    >
                      All
                    </button>
                    {uniqueCrops.map(c => (
                      <button 
                        key={c}
                        onClick={() => setFilterCrop(c as string)}
                        className={`px-3 py-1 text-xs rounded-full border capitalize ${filterCrop === c ? 'bg-moss/10 text-deep-forest border-moss' : 'bg-paper-ivory text-ink/70 border-soft-line hover:border-moss/50'}`}
                      >
                        {c as string}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
            {filteredReports.map((report, idx) => (
              <div key={report.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-moss/5 transition-colors ${idx !== filteredReports.length - 1 ? 'border-b border-soft-line' : ''}`}>
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
                  <button 
                    onClick={() => setReportToDelete(report.id)}
                    className="flex items-center justify-center w-9 h-9 text-ink/40 hover:text-terracotta hover:bg-terracotta/10 transition-colors bg-white border border-soft-line rounded-full shadow-sm ml-1"
                    title="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-soft-line w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif text-deep-forest font-medium mb-2">Delete Report</h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-6">
                Are you sure you want to permanently delete this report? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setReportToDelete(null)}
                  className="flex-1 bg-paper-ivory border border-soft-line text-ink hover:bg-soft-line/50 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteReport(reportToDelete)}
                  className="flex-1 bg-terracotta text-white hover:bg-terracotta/90 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
