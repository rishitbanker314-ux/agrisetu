'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="relative w-full bg-deep-forest text-paper-ivory py-40 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
      
      {/* Background animated contour lines */}
      <motion.div 
        animate={{ 
          x: [0, -100, 0],
          y: [0, 50, 0]
        }}
        transition={{ 
          duration: 20, 
          ease: 'linear', 
          repeat: Infinity 
        }}
        className="absolute inset-0 pointer-events-none opacity-20"
      >
        <svg className="w-[200%] h-[200%] -ml-[50%] -mt-[50%]" stroke="currentColor" strokeWidth="1" fill="none">
          <path d="M 0,200 Q 300,100 500,300 T 1000,200 T 1500,400 T 2000,200" />
          <path d="M 0,300 Q 300,200 500,400 T 1000,300 T 1500,500 T 2000,300" />
          <path d="M 0,400 Q 300,300 500,500 T 1000,400 T 1500,600 T 2000,400" />
        </svg>
      </motion.div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif text-5xl md:text-6xl mb-6 tracking-tight"
        >
          Stop guessing. <br/>
          <span className="italic text-moss">Start knowing.</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-sans text-xl text-paper-ivory/80 mb-12"
        >
          See the signals behind every season.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link href="/en/dashboard" className="inline-block bg-terracotta text-paper-ivory px-8 py-4 rounded-full text-lg font-sans hover:bg-[#b05c33] hover:-translate-y-1 transition-all shadow-lg shadow-terracotta/20">
            Open AgriSetu &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
