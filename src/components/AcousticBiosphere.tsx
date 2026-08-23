'use client';

import { Activity, Radio, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AcousticBiosphereProps {
  moisture: number; // Used to simulate health/stress
}

export default function AcousticBiosphere({ moisture }: AcousticBiosphereProps) {
  
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Random pulse interval to make the UI feel alive
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate stress based on moisture (lower moisture = higher stress)
  const stressLevel = Math.max(0, 100 - moisture);
  const healthStatus = stressLevel > 70 ? 'CRITICAL' : stressLevel > 40 ? 'WARNING' : 'STABLE';
  const statusColor = stressLevel > 70 ? 'text-red-500' : stressLevel > 40 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 border-b border-soft-line pb-4">
        <h2 className="text-lg font-sans font-medium text-deep-forest flex items-center gap-2">
          <Radio className="w-5 h-5 text-moss"/>
          Acoustic Biosphere
        </h2>
        <div className="flex items-center gap-2 bg-moss/10 px-3 py-1 rounded text-moss text-[10px] font-medium tracking-widest uppercase">
          <span className={`w-2 h-2 rounded-full ${pulse ? 'bg-moss' : 'bg-moss/30'} transition-colors duration-200`}></span>
          Subsurface Radar Active
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center flex-grow">
        
        {/* Radar Visualization */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-deep-forest rounded-full border-4 border-paper-ivory shadow-xl overflow-hidden flex-shrink-0">
          
          {/* Radar Grid Lines */}
          <div className="absolute inset-0 rounded-full border border-gray-700 m-8"></div>
          <div className="absolute inset-0 rounded-full border border-gray-700 m-16"></div>
          <div className="absolute inset-0 rounded-full border border-gray-700 m-24"></div>
          <div className="absolute w-full h-px bg-gray-700 top-1/2 -translate-y-1/2"></div>
          <div className="absolute h-full w-px bg-gray-700 left-1/2 -translate-x-1/2"></div>

          {/* Sweeping Scanner Element */}
          <div 
            className="absolute inset-0 origin-center animate-spin" 
            style={{ 
              background: 'conic-gradient(from 0deg, transparent 70%, rgba(168, 85, 247, 0.4) 100%)',
              animationDuration: '4s',
              animationTimingFunction: 'linear' 
            }}
          ></div>

          {/* Root/Mycelial Network SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Tree roots branching out */}
            <path d="M50,50 Q45,65 30,75 T15,85 M50,50 Q55,70 70,80 T85,90 M50,50 Q40,40 20,35 M50,50 Q65,45 80,30" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="1.5" 
                  className="opacity-60"
                  style={{ filter: 'drop-shadow(0 0 4px #22c55e)' }} />
            
            <path d="M45,65 Q35,70 25,65 M55,70 Q65,65 75,70 M40,40 Q30,45 25,50 M65,45 Q75,50 85,45" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="0.8" 
                  className="opacity-40" />
                  
            {/* Acoustic Stress Nodes (Purple) */}
            {stressLevel > 20 && (
              <circle cx="30" cy="75" r="2" fill="#d946ef" className="animate-ping" style={{ animationDuration: '2s' }} />
            )}
            {stressLevel > 50 && (
              <circle cx="70" cy="80" r="2.5" fill="#d946ef" className="animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
            )}
            {stressLevel > 80 && (
              <circle cx="20" cy="35" r="3" fill="#d946ef" className="animate-ping" style={{ animationDuration: '1s', animationDelay: '1s' }} />
            )}
            
            {/* Center Node */}
            <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
          </svg>
          
          {/* Depth labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono">0cm</div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono">-10cm</div>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono">-25cm</div>
          <div className="absolute top-28 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono">-50cm</div>
        </div>

        {/* Info Panel */}
        <div className="flex flex-col gap-4 w-full md:w-64">
          <div className="bg-paper-ivory/50 border border-soft-line p-4 rounded-lg">
             <span className="text-[10px] font-sans font-medium text-ink/50 uppercase tracking-widest block mb-1">Mycelial Health</span>
             <div className="flex items-end gap-2">
               <span className="text-3xl font-serif text-deep-forest leading-none">{100 - stressLevel}%</span>
               <span className={`text-xs font-sans font-medium mb-1 ${statusColor}`}>{healthStatus}</span>
             </div>
             <div className="w-full bg-soft-line h-1 mt-3 rounded-full overflow-hidden">
                <div className={`h-full ${stressLevel > 70 ? 'bg-terracotta' : stressLevel > 40 ? 'bg-marigold' : 'bg-moss'}`} style={{ width: `${100 - stressLevel}%` }}></div>
             </div>
          </div>

          <div className="bg-paper-ivory/50 border border-soft-line p-4 rounded-lg">
             <span className="text-[10px] font-sans font-medium text-ink/50 uppercase tracking-widest block mb-1">Acoustic Events (24h)</span>
             <span className="text-3xl font-serif text-deep-forest leading-none">{Math.floor(stressLevel * 24.5)}</span>
          </div>

          <div className="bg-moss/5 border border-moss/20 p-3 rounded-lg flex items-start gap-3">
             <AlertCircle className="w-4 h-4 text-moss flex-shrink-0 mt-0.5" />
             <div>
               <span className="text-xs font-sans font-medium text-moss block mb-1">Detection Logic</span>
               <p className="text-[10px] text-ink/70 font-sans leading-tight">
                 Plant roots emit ultrasonic acoustic emissions (cavitation) during water stress. Radar visualizes stress density before visual wilting occurs.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
