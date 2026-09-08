import dynamic from 'next/dynamic';
import type { LiveFieldData } from '@/hooks/useFieldData';
import { Activity } from 'lucide-react';

const NDVIChartClient = dynamic(() => import('./NDVIChartClient'), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
            Live NDVI & Forecast Trends
          </h3>
          <div className="h-4 bg-soft-line rounded w-64 mt-2"></div>
        </div>
      </div>
      <div className="flex-grow bg-paper-ivory/50 rounded-xl border border-soft-line w-full h-64 flex items-center justify-center">
        <span className="text-ink/40 font-medium text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 animate-spin" /> Loading Interactive Chart...
        </span>
      </div>
    </div>
  )
});

interface NDVIChartProps {
  fieldData: LiveFieldData | null;
}

export default function NDVIChart({ fieldData }: NDVIChartProps) {
  return <NDVIChartClient fieldData={fieldData} />;
}
