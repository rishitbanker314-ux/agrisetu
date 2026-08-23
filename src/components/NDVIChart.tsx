'use client';

import { Activity } from 'lucide-react';
import type { LiveFieldData } from '@/hooks/useFieldData';

interface NDVIChartProps {
  fieldData: LiveFieldData | null;
}

export default function NDVIChart({ fieldData }: NDVIChartProps) {
  // @ts-ignore - temporal data
  const ndviProgression = fieldData?.temporal?.ndviProgression as number[] || [];
  
  if (!ndviProgression.length) return <div className="p-4 text-center text-ink/50 text-sm">No NDVI data available</div>;

  const maxNdvi = 1.0;
  const minNdvi = 0.0;
  const days = ndviProgression.length;
  
  // Calculate SVG path
  const width = 800;
  const height = 200;
  
  const getCoordinates = (value: number, index: number) => {
    const x = (index / (days - 1)) * width;
    // Invert Y because SVG origin (0,0) is top-left
    const y = height - ((value - minNdvi) / (maxNdvi - minNdvi)) * height;
    return `${x},${y}`;
  };

  const linePath = ndviProgression.map((val, i) => {
    return i === 0 ? `M ${getCoordinates(val, i)}` : `L ${getCoordinates(val, i)}`;
  }).join(' ');

  // Create area path by drawing the line, then down to bottom right, to bottom left, and close
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  // Get current and projected (Day 30, Day 60, Day 90) values for markers
  const currentNdvi = ndviProgression[0];
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
            Historical & Predicted NDVI Trends
          </h3>
          <p className="text-sm text-ink/60 mt-1">90-Day Simulation Model</p>
        </div>
        <div className="bg-moss/10 px-3 py-1.5 rounded-md flex items-center gap-2">
          <Activity className="w-4 h-4 text-moss" />
          <span className="text-sm font-bold text-moss">Current: {currentNdvi.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex-grow relative mt-4 h-64 w-full bg-paper-ivory/50 rounded-xl border border-soft-line p-4">
        {/* Y-axis Labels */}
        <div className="absolute left-4 top-4 bottom-8 flex flex-col justify-between text-[10px] font-sans font-medium text-ink/40 z-10">
          <span>1.0</span>
          <span>0.5</span>
          <span>0.0</span>
        </div>
        
        {/* Y-axis grid lines */}
        <div className="absolute left-10 right-4 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-soft-line/50 border-dashed"></div>
          <div className="w-full border-t border-soft-line/50 border-dashed"></div>
          <div className="w-full border-t border-soft-line border-dashed"></div>
        </div>
        
        {/* SVG Chart */}
        <div className="absolute left-12 right-6 top-4 bottom-8">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible preserve-3d">
            <defs>
              <linearGradient id="ndviGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#86efac" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            <path
              d={areaPath}
              fill="url(#ndviGradient)"
            />
            
            <path
              d={linePath}
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Current Day Marker */}
            <circle cx="0" cy={height - (currentNdvi * height)} r="4" fill="#14532d" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
        
        {/* X-axis Labels */}
        <div className="absolute bottom-2 left-12 right-6 flex justify-between text-[10px] font-sans font-medium text-ink/50 uppercase">
          <span>Today</span>
          <span>+30 Days</span>
          <span>+60 Days</span>
          <span>+90 Days</span>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-ink/60 bg-white border border-soft-line p-3 rounded-md flex items-start gap-2">
        <Activity className="w-4 h-4 shrink-0 text-moss mt-0.5" />
        <p>This model extrapolates 90 days of NDVI data by analyzing the 7-day hyper-local weather forecast, soil moisture retention, and seasonal crop progression algorithms.</p>
      </div>
    </div>
  );
}
