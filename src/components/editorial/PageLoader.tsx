'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function PageLoader({ onComplete }: { onComplete: () => void }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for initial animation
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isReady ? '-100%' : 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (isReady) onComplete();
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper-ivory text-deep-forest"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-deep-forest">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            d="M12 22V8"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            d="M12 8c-3 0-6-3-6-6s3 6 6 6z"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            d="M12 12c3 0 6-3 6-6s-3 6-6 6z"
          />
        </svg>
        <div className="font-sans text-xs tracking-widest uppercase text-moss">
          Field Atlas / 01
        </div>
      </motion.div>
    </motion.div>
  );
}
