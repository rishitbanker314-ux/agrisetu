'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Activity, AlertCircle } from 'lucide-react';
import DrawerTabs from './DrawerTabs';

interface BottomDrawerProps {
  fieldData: any;
  crop: string;
  advisory: string;
  advisoryLoading: boolean;
  fieldId: string;
  center: [number, number];
  savedFields?: any[];
  setCrop?: (crop: string) => void;
  onFieldChange?: (id: string) => void;
}

export default function BottomDrawer(props: BottomDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Derive summary data
  const ndvi = props.fieldData?.ndvi?.toFixed(2) || '—';
  const hasAlerts = props.fieldData?.weather?.alerts?.length > 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
      <motion.div 
        layout
        className="w-full max-w-5xl bg-paper-ivory rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-x border-soft-line pointer-events-auto flex flex-col"
        initial={false}
        animate={{ 
          height: isOpen ? '85vh' : 'auto' 
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      >
        {/* Handle & Summary Row */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 cursor-pointer hover:bg-moss/5 transition-colors flex items-center justify-between border-b border-soft-line/50 shrink-0"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${hasAlerts ? 'bg-terracotta' : 'bg-moss'} animate-pulse`}></div>
              <span className="font-sans font-medium text-ink/80 text-sm">{props.fieldData?.name ? `${props.fieldData.name} Status` : 'Field Intelligence'}</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-xs font-sans text-ink/60">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> NDVI: {ndvi}</span>
              {hasAlerts && <span className="flex items-center gap-1 text-terracotta"><AlertCircle className="w-3 h-3" /> Weather Alert</span>}
            </div>
          </div>

          <div className="flex items-center gap-4 text-deep-forest">
            <span className="text-sm font-sans font-medium hidden sm:block">
              {isOpen ? 'Close intelligence' : 'Open intelligence'}
            </span>
            <div className="bg-moss/10 p-1 rounded-full">
              {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Drawer Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col overflow-hidden"
            >
              {/* Context Selectors */}
              <div className="bg-moss/5 border-b border-soft-line px-4 py-3 flex items-center justify-between sm:justify-start gap-4 overflow-x-auto shrink-0">
                <span className="text-xs font-medium text-deep-forest uppercase tracking-widest hidden sm:block">Intelligence Context:</span>
                
                <div className="flex items-center gap-2">
                  <select 
                    className="bg-white border border-soft-line hover:border-moss px-3 py-1.5 rounded-md text-sm font-sans font-medium text-ink outline-none cursor-pointer focus:border-moss focus:ring-1 focus:ring-moss/30 shadow-sm transition-all"
                    value={props.fieldId?.toString() || ''}
                    onChange={(e) => {
                      // Prevent closing drawer when clicking select
                      e.stopPropagation();
                      if (props.onFieldChange) props.onFieldChange(e.target.value);
                    }}
                  >
                    {(!props.savedFields || props.savedFields.length === 0) ? (
                      <option value="" disabled>No fields available</option>
                    ) : (
                      props.savedFields.map((f: any) => (
                        <option key={f.id} value={f.id.toString()}>{f.name || 'Unnamed Field'}</option>
                      ))
                    )}
                  </select>

                  <span className="text-soft-line">&mdash;</span>

                  <select 
                    value={props.crop}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (props.setCrop) props.setCrop(e.target.value);
                    }}
                    className="bg-white border border-soft-line hover:border-moss px-3 py-1.5 rounded-md text-sm font-sans font-medium text-ink outline-none cursor-pointer focus:border-moss focus:ring-1 focus:ring-moss/30 shadow-sm transition-all capitalize"
                  >
                    {['wheat', 'rice', 'corn', 'cotton', 'sugarcane', 'soybean', 'potato', 'tomato', 'onion', 'apple', 'grapes', 'coffee', 'tea', 'millet', 'sorghum', 'barley', 'oats', 'peanut'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <p className="text-[10px] text-ink/50 ml-auto hidden md:block">
                  Changing these parameters instantly recalculates all predictive AI models and temporal forecasts below.
                </p>
              </div>

              <div className="flex-grow overflow-hidden relative">
                <DrawerTabs {...props} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
