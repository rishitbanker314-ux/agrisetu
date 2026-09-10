'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { FileText, Download, ArrowLeft, Loader2, Sprout, MapPin, Activity, Droplets, TrendingUp, AlertTriangle, Thermometer, Trash2, Mail } from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  id: string;
  title: string;
  type: string;
  date: string;
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

export default function ReportViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      if (!params.id) return;
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', params.id as string)
        .single();
        
      if (data) {
        setReport(data);
      }
      setIsLoading(false);
      
      // Auto-trigger print if requested via query param
      if (searchParams.get('print') === 'true' && data) {
        setTimeout(() => {
          window.print();
        }, 500); // Small delay to ensure render
      }
    }
    fetchReport();
  }, [params.id, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-ivory flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-moss" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-paper-ivory flex flex-col justify-center items-center">
        <h2 className="text-2xl font-serif text-deep-forest mb-4">Report Not Found</h2>
        <button onClick={() => router.back()} className="text-moss hover:underline">Return to Reports</button>
      </div>
    );
  }

  const getNdviAssessment = (ndvi: number) => {
    if (ndvi > 0.7) return "Vegetation is highly dense and healthy. Photosynthetic activity is optimal. Standard irrigation and monitoring are recommended.";
    if (ndvi > 0.4) return "Vegetation shows moderate health. Some stress factors may be present. Consider checking soil moisture and nutrient levels.";
    return "Vegetation is sparse or under significant stress. Immediate intervention, such as targeted watering or fertilization, is strongly advised.";
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id);
        
      if (!error) {
        router.push('/en/reports');
      } else {
        console.error("Failed to delete report:", error);
        toast.error("Could not delete the report. Please try again.");
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleEmailReport = async () => {
    if (!report) return;
    try {
      setIsEmailing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        toast.error("You must be logged in with an email to use this feature.");
        setIsEmailing(false);
        return;
      }

      // Use html-to-image and jspdf to bypass html2canvas CSS parsing bugs
      const htmlToImage = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      
      const element = document.getElementById('printable-report');
      if (!element) return;

      // Temporarily force desktop width so the layout doesn't squash or crop
      const originalCssText = element.style.cssText;
      element.style.width = '1024px';
      element.style.maxWidth = '1024px';
      element.style.margin = '0';
      
      // Give the browser a tiny moment to reflow the layout
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Generate high-quality JPEG to keep payload size within Vercel's 4.5MB limit
      const dataUrl = await htmlToImage.toJpeg(element, {
        quality: 0.8,
        pixelRatio: 1.5,
        backgroundColor: '#ffffff',
        width: 1024,
        height: element.scrollHeight,
        style: {
          transform: 'none',
          boxShadow: 'none',
        }
      });

      // Revert styles
      element.style.cssText = originalCssText;

      // Create PDF and paginate the image
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Calculate height based on the 1024px forced width
      const pdfHeight = (element.scrollHeight * pdfWidth) / 1024;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight; // Negative position to shift the image up for the new page
        pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      // Generate base64 PDF
      const pdfBase64 = pdf.output('datauristring');

      // Send to backend
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          pdfBase64,
          reportId: report.id.split('-')[0],
          reportType: report.type
        }),
      });

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Report is too large to send via email currently.');
        }
        let errorMessage = 'Failed to send email';
        try {
          const err = await response.json();
          errorMessage = err.error || errorMessage;
        } catch (parseErr) {
          // If response isn't JSON (like a Vercel 500 HTML page)
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      toast.success(`Report successfully sent to ${user.email}!`);
    } catch (err: any) {
      console.error("Failed to email report:", err);
      toast.error(`Failed to send email: ${err.message}`);
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-paper-ivory font-sans selection:bg-moss/30 selection:text-deep-forest">
      {/* Non-printable Header & Controls */}
      <div className="print:hidden bg-white border-b border-soft-line px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-ink/60 hover:text-ink transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="text-ink/40 hover:text-terracotta bg-white border border-soft-line hover:bg-terracotta/10 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
          </button>
          <button 
            onClick={handleEmailReport}
            disabled={isEmailing}
            className="text-deep-forest hover:text-white bg-white border border-deep-forest hover:bg-deep-forest px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEmailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} 
            <span className="hidden sm:inline">{isEmailing ? 'Sending...' : 'Send to Email'}</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-deep-forest text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-moss transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <main id="printable-report" className="max-w-4xl mx-auto md:my-12 bg-white md:border border-soft-line md:shadow-lg print:border-none print:shadow-none print:m-0 print:p-0 p-8 md:p-16">
        
        {/* Document Header */}
        <header className="flex justify-between items-start border-b-2 border-deep-forest/20 pb-8 mb-8">
          <div className="flex items-center gap-3">
            <Sprout className="w-10 h-10 text-deep-forest" />
            <div>
              <h1 className="font-serif text-3xl tracking-tight text-ink font-medium">AgriCrate</h1>
              <div className="text-xs font-medium uppercase tracking-widest text-ink/50 mt-1">Agricultural Intelligence</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-ink/60">{report.type}</div>
            <div className="text-lg font-serif text-deep-forest mt-1">{report.date}</div>
            <div className="text-xs text-ink/40 mt-1">ID: {report.id.split('-')[0]}</div>
          </div>
        </header>

        {/* Report Title */}
        <div className="mb-12">
          <h2 className="text-4xl font-serif text-deep-forest font-medium tracking-tight mb-3">{report.title}</h2>
          <p className="text-ink/60 leading-relaxed max-w-2xl">This document contains an automated analysis generated by AgriCrate's satellite monitoring systems, summarizing field health, location data, and actionable agronomic insights.</p>
        </div>

        {/* Data Grid */}
        {report.metadata ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            
            {/* Field Identity */}
            <div className="bg-paper-ivory p-6 rounded-xl border border-soft-line">
              <div className="flex items-center gap-2 text-moss mb-4">
                <MapPin className="w-5 h-5" />
                <h3 className="font-medium">Location & Crop</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-ink/50 uppercase tracking-widest font-medium">Primary Crop</div>
                  <div className="text-lg text-ink font-medium capitalize">{report.metadata.crop}</div>
                </div>
                <div>
                  <div className="text-xs text-ink/50 uppercase tracking-widest font-medium">Coordinates</div>
                  <div className="text-lg text-ink font-medium font-mono text-sm">{report.metadata.lat.toFixed(6)}, {report.metadata.lng.toFixed(6)}</div>
                </div>
              </div>
            </div>

            {/* Health Metrics */}
            <div className="bg-paper-ivory p-6 rounded-xl border border-soft-line">
              <div className="flex items-center gap-2 text-moss mb-4">
                <Activity className="w-5 h-5" />
                <h3 className="font-medium">Health Metrics</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-ink/50 uppercase tracking-widest font-medium">Current NDVI Score</div>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl text-deep-forest font-medium">{report.metadata.ndvi.toFixed(2)}</div>
                    <div className="text-sm text-ink/60 mb-1">/ 1.00</div>
                  </div>
                </div>
                {/* Visual Indicator Bar */}
                <div className="w-full h-2 bg-soft-line rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full ${report.metadata.ndvi > 0.7 ? 'bg-moss' : report.metadata.ndvi > 0.4 ? 'bg-marigold' : 'bg-terracotta'}`}
                    style={{ width: `${Math.max(0, Math.min(100, report.metadata.ndvi * 100))}%` }}
                  />
                </div>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="bg-paper-ivory p-6 rounded-xl border border-soft-line text-ink/50 italic mb-12">
            No detailed telemetry data is available for this report.
          </div>
        )}

        {/* Intelligent Forecasting Section */}
        {report.metadata && (report.metadata.estimatedValue !== undefined || report.metadata.diseaseRisk) && (
          <div className="mb-12">
            <h3 className="text-2xl font-serif text-deep-forest font-medium mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-moss" /> Intelligent Forecasting
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Economic Yield */}
              <div className="bg-moss/5 p-6 rounded-xl border border-moss/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-ink/60 uppercase tracking-widest font-medium">Estimated Value</div>
                  <TrendingUp className="w-4 h-4 text-moss" />
                </div>
                <div className="text-3xl font-serif text-deep-forest font-medium">
                  {report.metadata.estimatedValue ? `₹${report.metadata.estimatedValue.toLocaleString('en-IN')}` : 'Calculating...'}
                </div>
                <div className="text-sm text-ink/60 mt-1">Per Hectare (Based on live Mandi rates)</div>
              </div>

              {/* Disease Risk */}
              <div className={`p-6 rounded-xl border ${report.metadata.diseaseRisk === 'CRITICAL' ? 'bg-terracotta/5 border-terracotta/20' : report.metadata.diseaseRisk === 'High' ? 'bg-marigold/10 border-marigold/20' : 'bg-paper-ivory border-soft-line'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-ink/60 uppercase tracking-widest font-medium">16-Day Pest Risk</div>
                  <AlertTriangle className={`w-4 h-4 ${report.metadata.diseaseRisk === 'CRITICAL' ? 'text-terracotta' : report.metadata.diseaseRisk === 'High' ? 'text-marigold' : 'text-moss'}`} />
                </div>
                <div className={`text-2xl font-medium ${report.metadata.diseaseRisk === 'CRITICAL' ? 'text-terracotta' : report.metadata.diseaseRisk === 'High' ? 'text-marigold' : 'text-deep-forest'}`}>
                  {report.metadata.diseaseRisk}
                </div>
                <div className="text-sm text-ink/60 mt-1">Forecasted fungal & blight conditions</div>
              </div>

              {/* Soil Metrics */}
              <div className="bg-paper-ivory p-6 rounded-xl border border-soft-line">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-ink/60 uppercase tracking-widest font-medium">Soil Status</div>
                  <Thermometer className="w-4 h-4 text-moss" />
                </div>
                <div className="flex items-baseline gap-4 mt-2">
                  <div>
                    <div className="text-2xl font-medium text-deep-forest">{report.metadata.soilMoisture || '--'}%</div>
                    <div className="text-xs text-ink/50 mt-1">Moisture</div>
                  </div>
                  <div>
                    <div className="text-2xl font-medium text-deep-forest">{report.metadata.soilPh ? report.metadata.soilPh.toFixed(1) : '--'}</div>
                    <div className="text-xs text-ink/50 mt-1">pH Level</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Detailed AI Insights Section */}
        {report.metadata && (
          <div className="mb-12">
            <h3 className="text-2xl font-serif text-deep-forest font-medium mb-6 flex items-center gap-3">
              <Droplets className="w-6 h-6 text-moss" /> Agronomic Assessment & Recommendations
            </h3>
            <div className="prose prose-stone max-w-none">
              <p className="text-ink leading-relaxed">
                Based on the multi-spectral satellite imagery captured and processed for the coordinates <strong>{report.metadata.lat.toFixed(4)}, {report.metadata.lng.toFixed(4)}</strong>, the following agronomic assessment has been generated for your <strong>{report.metadata.crop}</strong> crop. This analysis utilizes the normalized difference vegetation index (NDVI) alongside localized weather models and soil parameter estimations.
              </p>
              
              <div className="bg-moss/5 border-l-4 border-moss p-6 my-6 rounded-r-xl">
                <h4 className="text-lg font-medium text-deep-forest mb-2">NDVI Assessment ({report.metadata.ndvi.toFixed(2)})</h4>
                <p className="text-ink/80 leading-relaxed m-0">
                  {getNdviAssessment(report.metadata.ndvi)}
                </p>
              </div>

              <h4 className="text-xl font-serif text-deep-forest font-medium mt-8 mb-4">Crop-Specific Directives</h4>
              <p className="text-ink leading-relaxed">
                {report.metadata.crop === 'Wheat' || report.metadata.crop === 'Rice' || report.metadata.crop === 'Maize' ? 
                  `Cereal crops like ${report.metadata.crop} require precise nitrogen management. Given the current soil moisture of ${report.metadata.soilMoisture || 'optimal'}%, ensure that any top-dressing is timed before forecasted precipitation to maximize root uptake and minimize volatilization losses.` : 
                 report.metadata.crop === 'Cotton' || report.metadata.crop === 'Sugarcane' ? 
                  `Cash crops such as ${report.metadata.crop} demand deep root-zone moisture tracking. Your current soil pH of ${report.metadata.soilPh ? report.metadata.soilPh.toFixed(1) : 'around 7.0'} is generally acceptable, but monitor for micronutrient lockout if heavy rains alter the topsoil chemistry.` :
                  `For ${report.metadata.crop}, closely monitor vegetative vigor. The current temporal trends suggest standard growth, but watch for moisture stress during critical flowering stages.`
                }
              </p>

              <h4 className="text-xl font-serif text-deep-forest font-medium mt-8 mb-4">Pest & Disease Advisory</h4>
              <p className="text-ink leading-relaxed">
                {report.metadata.diseaseRisk === 'CRITICAL' ? 
                  `URGENT: The 16-day forecast indicates extended periods of high humidity and optimal temperatures for fungal proliferation. You are at CRITICAL risk for blight, rust, or mildew. Preventative fungicide application is highly recommended immediately.` :
                 report.metadata.diseaseRisk === 'High' ?
                  `WARNING: Conditions are becoming highly favorable for disease outbreaks. The combination of incoming precipitation and temperature spikes creates an environment suitable for pathogen development. Scout fields every 2-3 days.` :
                  `The current microclimate models show a low-to-medium risk for widespread fungal infections. However, localized pest pressure may still exist. Maintain standard integrated pest management protocols.`
                }
              </p>
              
              <p className="text-ink leading-relaxed mt-6">
                Continual monitoring is advised. Weather fluctuations in the upcoming week may require adjustments to your irrigation schedule. Please review the 16-day telemetry below for precise daily planning.
              </p>
            </div>
          </div>
        )}

        {/* 16-Day Forecast Table */}
        {report.metadata && report.metadata.forecast && report.metadata.temporal && (
          <div className="mb-12">
            <h3 className="text-2xl font-serif text-deep-forest font-medium mb-6">16-Day Microclimate & Agronomic Forecast</h3>
            <div className="overflow-x-auto rounded-xl border border-soft-line bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-paper-ivory text-ink border-b border-soft-line">
                    <th className="p-4 font-medium text-sm uppercase tracking-widest text-ink/60">Day</th>
                    <th className="p-4 font-medium text-sm uppercase tracking-widest text-ink/60">Max Temp</th>
                    <th className="p-4 font-medium text-sm uppercase tracking-widest text-ink/60">Min Temp</th>
                    <th className="p-4 font-medium text-sm uppercase tracking-widest text-ink/60">Precipitation</th>
                    <th className="p-4 font-medium text-sm uppercase tracking-widest text-ink/60">Est. NDVI</th>
                    <th className="p-4 font-medium text-sm uppercase tracking-widest text-ink/60">Pest Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-line">
                  {report.metadata.forecast.maxTemps.map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() + index);
                    const dayLabel = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    const maxT = report.metadata!.forecast!.maxTemps[index];
                    const minT = report.metadata!.forecast!.minTemps[index];
                    const precip = report.metadata!.forecast!.precipitation[index];
                    const ndviSim = report.metadata!.temporal!.ndviProgression[index];
                    const risk = report.metadata!.temporal!.diseaseRisk[index];

                    return (
                      <tr key={index} className="hover:bg-moss/5 transition-colors">
                        <td className="p-4 text-ink font-medium">{dayLabel}</td>
                        <td className="p-4 text-deep-forest">{maxT ? `${maxT.toFixed(1)}°C` : '--'}</td>
                        <td className="p-4 text-ink/70">{minT ? `${minT.toFixed(1)}°C` : '--'}</td>
                        <td className="p-4">
                          <span className={precip > 0 ? 'text-[#2563eb] font-medium' : 'text-ink/50'}>
                            {precip !== undefined ? `${precip.toFixed(1)} mm` : '--'}
                          </span>
                        </td>
                        <td className="p-4 text-moss font-medium">{ndviSim !== undefined ? ndviSim.toFixed(2) : '--'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-sm text-xs font-medium uppercase tracking-wider ${
                            risk === 'CRITICAL' ? 'bg-terracotta/20 text-terracotta' :
                            risk === 'High' ? 'bg-marigold/20 text-marigold' :
                            'bg-moss/10 text-moss'
                          }`}>
                            {risk || 'Low'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <footer className="mt-16 pt-8 border-t border-soft-line text-center text-xs text-ink/40">
          <p>Generated by AgriCrate Intelligence on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          <p className="mt-1">This report is for informational purposes only. Consult local agronomists for major interventions.</p>
        </footer>

      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="print:hidden fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
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
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-paper-ivory border border-soft-line text-ink hover:bg-soft-line/50 px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteReport}
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
