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
    <div className="bg-white rounded-md shadow-sm border-2 border-gray-300 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-4">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase">
          7-Day Forecast
        </h3>
      </div>
      
      <div className="flex-grow flex flex-col justify-end gap-1 relative pt-4 h-48">
        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-gray-400 pb-6">
          <span>{Math.round(maxT)}°C</span>
          <span>0°C</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex justify-between items-end h-full ml-8 pb-6 border-b-2 border-gray-200 relative">
          {days.map((day, i) => {
            const tempHeight = `${Math.max((maxTemps[i] / maxT) * 100, 5)}%`;
            const rainHeight = `${Math.max((precipitation[i] / maxP) * 100, 0)}%`;
            
            return (
              <div key={day} className="flex flex-col items-center justify-end h-full w-full relative group">
                {/* Temp Bar */}
                <div 
                  className="w-1/2 bg-orange-400 border border-orange-600 rounded-t-sm"
                  style={{ height: tempHeight }}
                ></div>
                {/* Rain Bar (Overlay/Stacked conceptually, but placed next to it) */}
                <div 
                  className="absolute bottom-0 w-1/2 bg-blue-400 border border-blue-600 rounded-t-sm translate-x-1/2 opacity-80"
                  style={{ height: rainHeight }}
                ></div>
                
                {/* Tooltip on hover */}
                <div className="absolute -top-10 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                  {Math.round(maxTemps[i])}°C, {Math.round(precipitation[i])}mm
                </div>
              </div>
            );
          })}
        </div>
        
        {/* X-axis Labels */}
        <div className="flex justify-between ml-8 text-[9px] font-bold text-gray-500 uppercase">
          {days.map((day, i) => (
            <span key={i} className="w-full text-center">D{i+1}</span>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4 mt-4 pt-4 border-t-2 border-gray-100 justify-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
          <span className="w-3 h-3 bg-orange-400 border border-orange-600 rounded-sm"></span>
          Max Temp
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
          <span className="w-3 h-3 bg-blue-400 border border-blue-600 rounded-sm"></span>
          Rainfall
        </div>
      </div>
    </div>
  );
}
