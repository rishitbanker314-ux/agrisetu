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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 h-full"></div>
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><ImagePlus className="w-5 h-5"/></span>
        Crop Disease Diagnostic
      </h3>
      
      {!diagnosis && !isUploading && (
        <label className="flex-grow flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl cursor-pointer hover:bg-blue-50/80 hover:border-blue-400 transition-all duration-300">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <UploadCloud className="w-8 h-8 text-blue-500" />
            </div>
            <p className="mb-2 text-sm text-gray-600 font-medium">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-400">JPG, PNG up to 10MB</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}

      {isUploading && (
        <div className="flex-grow flex flex-col items-center justify-center w-full min-h-[16rem] bg-indigo-50/30 rounded-2xl border border-indigo-100">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-20 rounded-full"></div>
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin relative" />
          </div>
          <p className="text-sm font-semibold text-indigo-800 animate-pulse">Gemini Vision AI is analyzing...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-start shadow-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {diagnosis && (
        <div className="flex-grow flex flex-col justify-center bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border border-indigo-100 rounded-2xl p-6">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-6 h-6 text-indigo-600 mr-2" />
            <h4 className="font-bold text-lg text-gray-900">{diagnosis.disease_label}</h4>
          </div>
          
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              Confidence: {(diagnosis.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="text-sm text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm prose prose-sm prose-indigo">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {diagnosis.treatment_advice}
            </ReactMarkdown>
          </div>
          
          <button 
            onClick={() => setDiagnosis(null)}
            className="mt-6 w-full text-center text-sm font-semibold text-indigo-600 bg-white border border-indigo-200 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Analyze another image
          </button>
        </div>
      )}
    </div>
  );
}
