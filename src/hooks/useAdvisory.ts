import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LiveFieldData } from './useFieldData';

export function useAdvisory(fieldData: LiveFieldData | null, crop: string = 'wheat', language: string = 'en') {
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdvisory() {
      if (!fieldData) return;

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: functionError } = await supabase.functions.invoke('advisory-engine', {
          body: { crop, language, fieldData },
        });

        if (functionError) throw functionError;
        if (data.error) throw new Error(data.error);
        
        setAdvisory(data.recommendation_text);
      } catch (err: any) {
        console.error("Advisory Error:", err);
        setError(err.message || 'Failed to fetch advisory');
      } finally {
        setLoading(false);
      }
    }

    // Add a slight debounce to prevent spamming the AI on rapid map clicks
    const timeoutId = setTimeout(() => {
      fetchAdvisory();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [fieldData, crop, language]);

  return { advisory, loading, error };
}
