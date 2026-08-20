'use client';

import { useState, useMemo, useEffect } from 'react';
import { Leaf, Award, ArrowUpRight, ArrowDownRight, Wind } from 'lucide-react';
import { LiveFieldData } from '@/hooks/useFieldData';

export default function SustainabilityScore({ fieldData }: { fieldData?: LiveFieldData | null }) {
  const [fertilizer, setFertilizer] = useState(120); // kg/ha
  const [water, setWater] = useState(450); // mm/year
  
  // Smart Defaults: Adjust initial recommended values based on REAL local weather
  useEffect(() => {
    if (fieldData && fieldData.forecast) {
      const precipitation = fieldData.forecast.precipitation.reduce((a, b) => a + b, 0);
      
      // If it rains a lot, less water is needed
      if (precipitation > 30) setWater(200);
      else if (precipitation > 10) setWater(350);
      else setWater(500);

      // Fertilizer is slightly adjusted based on soil moisture (highly dry soil risks fertilizer burn)
      if (fieldData.soil.moisture < 15) setFertilizer(80);
      else setFertilizer(120);
    }
  }, [fieldData]);

  // Algorithms for score and carbon credits
  const score = useMemo(() => {
    // Ideal fertilizer: ~80 kg/ha. Ideal water: ~300 mm.
    const fertScore = Math.max(0, 100 - Math.abs(fertilizer - 80) * 0.5);
    const waterScore = Math.max(0, 100 - Math.abs(water - 300) * 0.1);
    return Math.round((fertScore + waterScore) / 2);
  }, [fertilizer, water]);

  const carbonCreditsValue = useMemo(() => {
    // If score is above 60, they start earning credits
    if (score <= 60) return 0;
    return Math.round((score - 60) * 12.5); // USD value
  }, [score]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-600 h-full"></div>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg"><Leaf className="w-5 h-5"/></span>
          Sustainability
        </h3>
        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider">ESG Score</span>
      </div>

      <div className="flex-grow flex flex-col justify-center gap-6">
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-black \${score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {score}
              </span>
              <span className="text-sm font-bold text-gray-400 mb-1">/ 100</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Farm ESG Score</p>
          </div>
          
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 text-right min-w-[120px]">
            <p className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1 flex justify-end items-center gap-1">
              <Wind className="w-3 h-3" /> Carbon Value
            </p>
            <p className="text-xl font-black text-teal-600">${carbonCreditsValue}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
              <span>Nitrogen Fertilizer</span>
              <span>{fertilizer} kg/ha</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="250" 
              value={fertilizer} 
              onChange={(e) => setFertilizer(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
              <span>Water Usage</span>
              <span>{water} mm</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="800" 
              value={water} 
              onChange={(e) => setWater(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
