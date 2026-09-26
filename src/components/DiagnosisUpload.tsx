'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2, ImagePlus, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DiagnosisUploadProps {
  fieldId: string;
}

export default function DiagnosisUpload({ fieldId }: DiagnosisUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mock loading steps for the demo
  const loadingSteps = [
    "Extracting biological features...",
    "Scanning for known pathogens...",
    "Cross-referencing global database...",
    "Correlating with local climate data...",
    "Generating treatment plan..."
  ];

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setDiagnosis(null);

    try {
      // 1. Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;
      setImagePreview(base64Data);

      // Start the mock loading sequence (purely visual for demo)
      let currentStep = 0;
      const stepInterval = setInterval(() => {
        currentStep++;
        if (currentStep < loadingSteps.length) {
          setLoadingStep(currentStep);
        }
      }, 1500); // Change step every 1.5 seconds

      // 2. Call our Next.js API route (which talks to Hugging Face)
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field_id: fieldId, 
          image_base64: base64Data,
          mime_type: file.type || 'image/jpeg'
        }),
      });

      clearInterval(stepInterval);
      setLoadingStep(0);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image.');
      }
      
      setDiagnosis(data);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [fieldId]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 border-b border-soft-line pb-4">
        <h3 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-moss"/>
          Image Analysis
        </h3>
        <span className="text-xs font-medium bg-moss/10 text-moss px-2 py-1 rounded-sm uppercase tracking-widest">Vision AI</span>
      </div>
      
      {!diagnosis && !isUploading && (
        <label className="flex-grow flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed border-soft-line bg-paper-ivory/50 rounded-lg cursor-pointer hover:bg-moss/5 hover:border-moss/30 transition-all duration-300">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="bg-white p-3 rounded-md border border-soft-line mb-4 shadow-sm">
              <UploadCloud className="w-6 h-6 text-deep-forest/70" />
            </div>
            <p className="mb-2 text-sm text-deep-forest font-sans font-medium">Click to upload image</p>
            <p className="text-xs font-sans text-ink/50">JPG, PNG up to 10MB</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}

      {isUploading && (
        <div className="flex-grow flex flex-col items-center justify-center w-full min-h-[16rem] bg-paper-ivory/50 border border-soft-line rounded-lg p-6 text-center">
          <Loader2 className="w-10 h-10 text-moss animate-spin mb-6" />
          <p className="text-sm font-sans font-medium text-moss tracking-widest uppercase mb-2">System Processing</p>
          <div className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-moss transition-all duration-300 ease-out" 
              style={{ width: `${Math.max(10, (loadingStep / (loadingSteps.length - 1)) * 100)}%` }}
            />
          </div>
          <p className="text-sm font-sans font-medium text-ink/80 transition-opacity duration-300">
            {loadingSteps[loadingStep] || loadingSteps[loadingSteps.length - 1]}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-sm flex items-start shadow-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {diagnosis && (
        <div className="flex-grow flex flex-col bg-white border border-soft-line rounded-lg p-5 overflow-y-auto">
          {/* Mock Target Bounding Boxes Over Image */}
          {imagePreview && (
            <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden border border-soft-line bg-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Analyzed Crop" className="object-contain w-full h-full opacity-90" />
              
              {/* Fake UI Overlays for Video Demo */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded backdrop-blur-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                LIVE SCAN
              </div>

              {/* Bounding Box 1 - Main Rot Area */}
              <div className="absolute top-[35%] left-[50%] w-[25%] h-[45%] border-2 border-red-500 rounded-sm bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                 <span className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] font-bold px-1 whitespace-nowrap">ANOMALY 1: NECROSIS</span>
              </div>
              
              {/* Bounding Box 2 - Lower Rot Edge */}
              <div className="absolute top-[70%] left-[38%] w-[20%] h-[18%] border-2 border-yellow-400 rounded-sm bg-yellow-400/10 shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                 <span className="absolute -top-5 left-0 bg-yellow-400 text-black text-[9px] font-bold px-1 whitespace-nowrap">ANOMALY 2: SHRIVELING</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4 border-b border-soft-line pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-moss" />
              <h4 className="font-serif text-lg text-deep-forest">{diagnosis.disease_label}</h4>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-sans font-medium bg-red-500/10 text-red-700 uppercase tracking-widest border border-red-200">
              Confidence: {(diagnosis.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="text-sm text-ink/80 bg-paper-ivory/50 p-4 rounded-md border border-soft-line prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-deep-forest mb-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {diagnosis.treatment_advice}
            </ReactMarkdown>
          </div>

          {diagnosis.cures && diagnosis.cures.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-sans font-bold text-deep-forest/70 uppercase tracking-wider mb-2">Recommended Cures</h5>
              <div className="space-y-2">
                {diagnosis.cures.map((cure: string, idx: number) => (
                  <a 
                    key={idx} 
                    href={`https://www.google.com/search?q=${encodeURIComponent(cure)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm bg-moss/5 border border-moss/20 rounded px-3 py-2 hover:bg-moss/10 transition-colors group"
                  >
                    <span className="text-deep-forest font-medium">{cure}</span>
                    <ExternalLink className="w-4 h-4 text-moss opacity-70 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {diagnosis.alternatives && diagnosis.alternatives.length > 1 && (
            <div className="mb-4">
              <h5 className="text-xs font-sans font-bold text-deep-forest/70 uppercase tracking-wider mb-2">Other Possibilities</h5>
              <div className="space-y-2">
                {diagnosis.alternatives.slice(1, 4).map((alt: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-white border border-soft-line rounded px-3 py-2">
                    <span className="text-ink font-medium">{alt.label}</span>
                    <span className="text-moss font-medium">{(alt.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setDiagnosis(null)}
            className="mt-auto w-full text-center text-sm font-sans font-medium text-deep-forest bg-white border border-soft-line py-2 rounded-md hover:bg-moss/5 transition-colors"
          >
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
}
