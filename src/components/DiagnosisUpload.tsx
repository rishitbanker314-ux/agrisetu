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
    <div className="bg-white rounded-md shadow-sm border-2 border-gray-300 p-6 flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-4">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <ImagePlus className="w-6 h-6 text-purple-700"/>
          CROP DISEASE DIAGNOSTIC
        </h3>
        <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-1 rounded-sm uppercase tracking-widest border border-purple-200">Vision AI</span>
      </div>
      
      {!diagnosis && !isUploading && (
        <label className="flex-grow flex flex-col items-center justify-center w-full min-h-[16rem] border-4 border-dashed border-gray-300 bg-gray-50 rounded-sm cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all duration-300">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="bg-white p-3 rounded-sm border-2 border-gray-200 mb-4">
              <UploadCloud className="w-8 h-8 text-gray-700" />
            </div>
            <p className="mb-2 text-sm text-gray-900 font-bold uppercase tracking-widest">Click to upload image</p>
            <p className="text-xs font-bold text-gray-500">JPG, PNG up to 10MB</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}

      {isUploading && (
        <div className="flex-grow flex flex-col items-center justify-center w-full min-h-[16rem] bg-gray-50 border-2 border-gray-200 rounded-sm">
          <Loader2 className="w-10 h-10 text-purple-700 animate-spin mb-4" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Vision AI is analyzing...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-sm flex items-start shadow-sm">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {diagnosis && (
        <div className="flex-grow flex flex-col bg-gray-50 border-2 border-gray-200 rounded-sm p-5">
          <div className="flex items-center justify-between mb-4 border-b-2 border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-700" />
              <h4 className="font-black text-lg text-gray-900 uppercase">{diagnosis.disease_label}</h4>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-widest">
              Confidence: {(diagnosis.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="text-sm text-gray-700 bg-white p-4 rounded-sm border-2 border-gray-200 prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {diagnosis.treatment_advice}
            </ReactMarkdown>
          </div>
          
          <button 
            onClick={() => setDiagnosis(null)}
            className="mt-4 w-full text-center text-sm font-black text-gray-900 bg-white border-2 border-gray-300 py-3 rounded-sm hover:bg-gray-100 transition-colors uppercase tracking-widest"
          >
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
}
