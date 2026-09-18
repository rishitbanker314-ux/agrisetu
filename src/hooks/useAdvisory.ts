import { useState, useEffect } from 'react';
import { LiveFieldData } from './useFieldData';
import { generateDeterministicAdvisory } from '@/lib/advisoryRules';

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
        
        // Simulating network delay to make the UI feel like it's processing data
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const recommendation = generateDeterministicAdvisory(fieldData, crop, language);
        setAdvisory(recommendation);
      } catch (err: any) {
        console.error("Advisory Error:", err);
        setError(err.message || 'Failed to generate advisory');
      } finally {
        setLoading(false);
      }
    }

    fetchAdvisory();
  }, [fieldData, crop, language]);

  return { advisory, loading, error };
}
