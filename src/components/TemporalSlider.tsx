'use client';

import { useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TemporalSliderProps {
  dateOffset: number;
  setDateOffset: (days: number) => void;
  maxDays?: number;
}

export default function TemporalSlider({ dateOffset, setDateOffset, maxDays = 90 }: TemporalSliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate the target date based on offset
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + dateOffset);

  const handleDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateOffset(Number(e.target.value));
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[50] flex flex-col items-center w-full max-w-2xl px-4 pointer-events-none">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto mb-4 bg-white/95 backdrop-blur-md border-4 border-gray-900 rounded-xl shadow-2xl p-4 w-[90vw] max-w-2xl flex flex-col md:flex-row items-center gap-4"
          >
            {/* Playhead Info */}
            <div className="flex flex-col min-w-[140px] bg-gray-900 text-white p-3 rounded-lg border-2 border-gray-700 relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 border-2 border-gray-900 hover:bg-red-600 md:hidden"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Simulation Date</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">
                  {targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <span className="text-xs font-bold mt-1 text-emerald-400">
                {dateOffset === 0 ? 'Live (Today)' : `+${dateOffset} Days Future`}
              </span>
            </div>

            {/* Slider Controls */}
            <div className="flex-grow flex items-center gap-4 w-full">
              <button 
                onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
                disabled={dateOffset === 0}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg border-2 border-gray-900 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900" />
              </button>
              
              <div className="relative flex-grow flex items-center h-12">
                {/* Custom Range Input */}
                <input 
                  type="range" 
                  min="0" 
                  max={maxDays} 
                  value={dateOffset} 
                  onChange={handleDrag}
                  className="w-full h-4 bg-gray-300 rounded-full appearance-none cursor-pointer border-2 border-gray-900 accent-emerald-500"
                  style={{
                    background: `linear-gradient(to right, #10b981 ${(dateOffset / maxDays) * 100}%, #d1d5db ${(dateOffset / maxDays) * 100}%)`
                  }}
                />
                {/* Timeline markers */}
                <div className="absolute top-10 w-full flex justify-between px-1 text-[10px] font-black text-gray-500 uppercase tracking-widest pointer-events-none">
                  <span>Today</span>
                  <span>+30D</span>
                  <span>+60D</span>
                  <span>+90D</span>
                </div>
              </div>

              <button 
                onClick={() => setDateOffset(Math.min(maxDays, dateOffset + 1))}
                disabled={dateOffset === maxDays}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg border-2 border-gray-900 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-900" />
              </button>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="hidden md:flex p-2 bg-gray-200 hover:bg-gray-300 rounded-lg border-2 border-gray-900 transition-colors self-start"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl border-2 border-gray-700 hover:border-emerald-500 flex items-center gap-3 font-bold uppercase tracking-wider text-sm transition-all hover:scale-105"
        >
          <Clock className="w-5 h-5 text-emerald-400" />
          Time Travel
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs">
            {dateOffset === 0 ? 'Live' : `+${dateOffset}D`}
          </span>
        </motion.button>
      )}
    </div>
  );
}
