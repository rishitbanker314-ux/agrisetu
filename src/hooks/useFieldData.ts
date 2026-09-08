import { useState, useEffect } from 'react';
import { LiveFieldData, generateFieldIntelligence } from '../lib/fieldIntelligence';

export type { LiveFieldData };

export function useFieldData(lat: number, lng: number, boundary?: any[], crop: string = "Wheat", areaHectares: number = 0) {
  const [data, setData] = useState<LiveFieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const intelligenceData = await generateFieldIntelligence(lat, lng, boundary, crop, areaHectares);
        setData(intelligenceData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lat, lng, boundary ? JSON.stringify(boundary) : "", crop, areaHectares]);

  return { data, loading, error };
}
