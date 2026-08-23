'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DiagnosisUploadProps {
  fieldId: string;
}

export default function DiagnosisUpload({ fieldId }: DiagnosisUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

      // 2. Call Edge Function with base64 image directly (Bypassing Storage Bucket)
      const { data, error: functionError } = await supabase.functions.invoke('diagnostic-module', {
        body: { 
          field_id: fieldId, 
          image_base64: base64Data,
          mime_type: file.type || 'image/jpeg'
        },
      });

      if (functionError) throw functionError;
      
      if (data && data.error) {
        throw new Error(data.error);
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
        <div className="flex-grow flex flex-col items-center justify-center w-full min-h-[16rem] bg-paper-ivory/50 border border-soft-line rounded-lg">
          <Loader2 className="w-8 h-8 text-moss animate-spin mb-4" />
          <p className="text-sm font-sans font-medium text-ink/70">Vision AI is analyzing...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-sm flex items-start shadow-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {diagnosis && (
        <div className="flex-grow flex flex-col bg-white border border-soft-line rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 border-b border-soft-line pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-moss" />
              <h4 className="font-serif text-lg text-deep-forest">{diagnosis.disease_label}</h4>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-sans font-medium bg-moss/10 text-moss uppercase tracking-widest">
              Confidence: {(diagnosis.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="text-sm text-ink/80 bg-paper-ivory/50 p-4 rounded-md border border-soft-line prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-deep-forest">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {diagnosis.treatment_advice}
            </ReactMarkdown>
          </div>
          
          <button 
            onClick={() => setDiagnosis(null)}
            className="mt-4 w-full text-center text-sm font-sans font-medium text-deep-forest bg-white border border-soft-line py-2 rounded-md hover:bg-moss/5 transition-colors"
          >
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
}
