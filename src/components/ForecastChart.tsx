'use client';

import { CloudRain, Thermometer } from 'lucide-react';
import { LiveFieldData } from '@/hooks/useFieldData';

export default function ForecastChart({ fieldData }: { fieldData?: LiveFieldData | null }) {
  if (!fieldData?.forecast) return null;

  const { maxTemps, minTemps, precipitation } = fieldData.forecast;
  
  // Find max values for scaling
  const maxT = Math.max(...maxTemps) + 5; // Add padding
  const maxP = Math.max(...precipitation, 10); // Ensure at least 10mm scale

  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b border-soft-line pb-4">
        <h3 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
          7-Day Forecast
        </h3>
      </div>
      
      <div className="flex-grow flex flex-col justify-end gap-1 relative pt-4 h-48">
        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-sans font-medium text-ink/40 pb-6">
          <span>{Math.round(maxT)}°C</span>
          <span>0°C</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex justify-between items-end h-full ml-8 pb-6 border-b border-soft-line relative">
          {days.map((day, i) => {
            const tempHeight = `${Math.max((maxTemps[i] / maxT) * 100, 5)}%`;
            const rainHeight = `${Math.max((precipitation[i] / maxP) * 100, 0)}%`;
            
            return (
              <div key={day} className="flex flex-col items-center justify-end h-full w-full relative group">
                {/* Temp Bar */}
                <div 
                  className="w-1/2 bg-terracotta/80 rounded-t-sm transition-all group-hover:bg-terracotta"
                  style={{ height: tempHeight }}
                ></div>
                {/* Rain Bar (Overlay/Stacked conceptually, but placed next to it) */}
                <div 
                  className="absolute bottom-0 w-1/2 bg-sky-600/80 rounded-t-sm translate-x-1/2 transition-all group-hover:bg-sky-600"
                  style={{ height: rainHeight }}
                ></div>
                
                {/* Tooltip on hover */}
                <div className="absolute -top-10 bg-deep-forest text-paper-ivory text-[10px] font-sans px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none shadow-sm">
                  {Math.round(maxTemps[i])}°C, {Math.round(precipitation[i])}mm
                </div>
              </div>
            );
          })}
        </div>
        
        {/* X-axis Labels */}
        <div className="flex justify-between ml-8 text-[9px] font-sans font-medium text-ink/50 uppercase pt-2">
          {days.map((day, i) => (
            <span key={i} className="w-full text-center">D{i+1}</span>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4 mt-4 pt-4 border-t border-soft-line justify-center">
        <div className="flex items-center gap-1.5 text-xs font-sans text-ink/70">
          <span className="w-3 h-3 bg-terracotta rounded-sm"></span>
          Max Temp
        </div>
        <div className="flex items-center gap-1.5 text-xs font-sans text-ink/70">
          <span className="w-3 h-3 bg-sky-600 rounded-sm"></span>
          Rainfall
        </div>
      </div>
    </div>
  );
}
