'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function SignalTranslation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Converging animations based on scroll
  const topY = useTransform(scrollYProgress, [0.2, 0.5], ['-100px', '0px']);
  const topOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  
  const bottomY = useTransform(scrollYProgress, [0.2, 0.5], ['100px', '0px']);
  const bottomOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  const centralOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const centralScale = useTransform(scrollYProgress, [0.4, 0.6], [0.9, 1]);

  const lineScaleY = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);

  return (
    <section ref={containerRef} className="w-full bg-deep-forest text-paper-ivory py-32 relative overflow-hidden">
      
      {/* Background organic shape */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-moss/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="font-serif text-4xl md:text-5xl lg:text-6xl mb-24"
        >
          From scattered signals <br/>
          <span className="italic text-moss">to one clear direction.</span>
        </motion.h2>

        <div className="relative h-[400px] flex flex-col items-center justify-between max-w-lg mx-auto">
          
          {/* Vertical converging line */}
          <motion.div 
            style={{ scaleY: lineScaleY, originY: 0 }}
            className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-moss/40 -translate-x-1/2 z-0"
          ></motion.div>

          {/* Above Layer */}
          <motion.div style={{ y: topY, opacity: topOpacity }} className="relative z-10 bg-deep-forest px-6 py-2 border border-moss/30 rounded-full">
            <span className="text-xs font-sans uppercase tracking-widest text-paper-ivory/80">Above</span>
            <span className="mx-2 text-moss">&mdash;</span>
            <span className="text-sm font-sans text-paper-ivory">Satellite & Weather patterns</span>
          </motion.div>

          {/* Within Layer (Central) */}
          <motion.div 
            style={{ opacity: centralOpacity, scale: centralScale }}
            className="relative z-20 flex flex-col items-center"
          >
            <div className="bg-moss/20 px-4 py-1 rounded-full text-[10px] uppercase tracking-widest text-moss mb-3">Within</div>
            <div className="w-4 h-4 rounded-full bg-terracotta shadow-[0_0_20px_rgba(198,106,61,0.5)] mb-3 relative">
              <div className="absolute inset-0 rounded-full border border-terracotta animate-ping"></div>
            </div>
            <h3 className="font-serif text-3xl text-terracotta">A clearer next move.</h3>
          </motion.div>

          {/* Ahead Layer */}
          <motion.div style={{ y: bottomY, opacity: bottomOpacity }} className="relative z-10 bg-deep-forest px-6 py-2 border border-moss/30 rounded-full">
            <span className="text-xs font-sans uppercase tracking-widest text-paper-ivory/80">Ahead</span>
            <span className="mx-2 text-moss">&mdash;</span>
            <span className="text-sm font-sans text-paper-ivory">Market & Risk signals</span>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
