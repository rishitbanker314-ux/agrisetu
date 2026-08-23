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
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b border-soft-line pb-4">
        <h3 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
          <Leaf className="w-5 h-5 text-moss"/>
          Sustainability
        </h3>
        <span className="text-xs font-medium bg-moss/10 text-moss px-2 py-1 rounded uppercase tracking-widest">ESG Score</span>
      </div>

      <div className="flex-grow flex flex-col justify-center gap-6 bg-paper-ivory/50 border border-soft-line rounded-lg p-5">
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-serif \${score >= 75 ? 'text-moss' : score >= 50 ? 'text-marigold' : 'text-terracotta'}`}>
                {score}
              </span>
              <span className="text-sm font-sans font-medium text-ink/50 mb-1">/ 100</span>
            </div>
            <p className="text-xs font-sans font-medium text-ink/70 uppercase tracking-widest mt-1">Farm ESG Score</p>
          </div>
          
          <div className="bg-moss/5 border border-moss/20 rounded-lg p-3 text-right min-w-[120px]">
            <p className="text-[10px] font-sans font-medium text-moss uppercase tracking-wider mb-1 flex justify-end items-center gap-1">
              <Wind className="w-3 h-3" /> CARBON VALUE
            </p>
            <p className="text-xl font-serif text-deep-forest">${carbonCreditsValue}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-sans font-medium text-ink/80 mb-1 uppercase tracking-widest">
              <span>Nitrogen Fertilizer</span>
              <span>{fertilizer} kg/ha</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="250" 
              value={fertilizer} 
              onChange={(e) => setFertilizer(Number(e.target.value))}
              className="w-full h-1 bg-soft-line rounded-full cursor-pointer accent-moss"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-sans font-medium text-ink/80 mb-1 uppercase tracking-widest">
              <span>Water Usage</span>
              <span>{water} mm</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="800" 
              value={water} 
              onChange={(e) => setWater(Number(e.target.value))}
              className="w-full h-1 bg-soft-line rounded-full cursor-pointer accent-sky-600"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
