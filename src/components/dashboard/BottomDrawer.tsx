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
              <span className="font-sans font-medium text-ink/80 text-sm">North Field Status</span>
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
              className="flex-grow overflow-hidden"
            >
              <DrawerTabs {...props} />
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
