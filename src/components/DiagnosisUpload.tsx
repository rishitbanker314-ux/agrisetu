'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
      // 1. Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${fieldId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('crop_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Call Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('diagnostic-module', {
        body: { field_id: fieldId, storage_path: filePath },
      });

      if (functionError) throw functionError;
      
      setDiagnosis(data);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze image.');
    } finally {
      setIsUploading(false);
    }
  }, [fieldId]);

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Crop Disease Diagnosis</h3>
      
      {!diagnosis && !isUploading && (
        <label className="flex-grow flex flex-col items-center justify-center w-full min-h-[12rem] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}

      {isUploading && (
        <div className="flex-grow flex flex-col items-center justify-center w-full min-h-[12rem]">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
          <p className="text-sm text-gray-500">Analyzing crop photo...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {diagnosis && (
        <div className="mt-4 flex-grow flex flex-col justify-center p-4 bg-green-50 border border-green-100 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-semibold text-green-900">{diagnosis.disease_label}</h4>
          </div>
          <p className="text-sm text-green-800 mb-2">Confidence: {(diagnosis.confidence * 100).toFixed(1)}%</p>
          <div className="text-sm text-gray-700 mt-2 p-3 bg-white rounded border border-green-200">
            <strong>Treatment:</strong> {diagnosis.treatment_advice}
          </div>
          <button 
            onClick={() => setDiagnosis(null)}
            className="mt-4 text-sm font-medium text-green-700 underline hover:text-green-800 text-left"
          >
            Upload another photo
          </button>
        </div>
      )}
    </div>
  );
}
