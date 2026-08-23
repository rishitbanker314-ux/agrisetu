'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function EditorialHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.10]);
  const contourY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  return (
    <section ref={containerRef} className="relative min-h-[100svh] w-full bg-paper-ivory pt-32 pb-16 overflow-hidden flex flex-col md:flex-row">
      
      {/* Left Text Column */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 lg:px-24 z-10"
      >
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100px' }}
          transition={{ duration: 1.5, ease: 'circOut' }}
          className="w-[1px] bg-soft-line absolute left-8 top-0 hidden md:block"
        />
        
        <div className="flex items-center gap-4 mb-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xs uppercase tracking-[0.2em] font-sans text-moss"
          >
            Agricultural Intelligence Platform
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-moss">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
            </svg>
          </motion.div>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.05] text-deep-forest mb-8 tracking-tight">
          <motion.span
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="block overflow-hidden"
          >
            <span className="block">The farm is</span>
          </motion.span>
          <motion.span
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="block overflow-hidden"
          >
            <span className="block italic text-moss">speaking.</span>
          </motion.span>
          <motion.span
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="block overflow-hidden"
          >
            <span className="block">We translate.</span>
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-lg md:text-xl text-ink/80 max-w-md font-sans mb-10 leading-relaxed"
        >
          We turn satellite signals, soil intelligence and market dynamics into clear, actionable guidance for every acre.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-16"
        >
          <Link href="/en/dashboard" className="bg-terracotta text-paper-ivory px-6 py-3 rounded-md text-sm font-medium hover:bg-[#b05c33] transition-colors flex items-center gap-2">
            Explore the intelligence <span className="text-lg">&rarr;</span>
          </Link>
          <Link href="#how-it-works" className="text-sm font-sans text-ink hover:text-moss relative group pb-1">
            See how it works &rarr;
            <span className="absolute left-0 bottom-0 w-full h-[1px] bg-ink/30 group-hover:bg-moss transition-colors"></span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          className="flex items-center gap-4 mt-auto pb-4"
        >
          <div className="w-12 h-12 rounded-full border border-soft-line flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-deep-forest">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="font-serif text-lg text-ink leading-tight">Millions of acres.</p>
            <p className="text-xs font-sans text-moss italic">One source of truth.</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Image Column */}
      <div className="relative w-full md:w-1/2 h-[50vh] md:h-auto mt-12 md:mt-0 flex-shrink-0 flex items-center">
        
        {/* Organic Masking Wrapper */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
          className="absolute inset-y-0 right-0 w-full h-[120%] -top-[10%] md:w-[120%] md:-right-[20%] overflow-hidden"
          style={{ 
            clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)', // Rough organic shape
          }}
        >
          <motion.div
            style={{ scale: imageScale }}
            className="w-full h-full relative"
          >
            <Image
              src="/hero-field.jpg"
              alt="Aerial view of farmlands"
              fill
              className="object-cover"
              priority
            />
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[#F3EFE4]/10 mix-blend-multiply pointer-events-none"></div>
          </motion.div>
        </motion.div>

        {/* Contour Lines Overlay */}
        <motion.div
          style={{ y: contourY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, delay: 2 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <svg className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%]" stroke="var(--color-paper-ivory)" strokeWidth="0.5" fill="none">
            <path d="M 0,200 Q 300,100 500,300 T 1000,200" opacity="0.6" />
            <path d="M 0,220 Q 300,120 500,320 T 1000,220" opacity="0.4" />
            <path d="M 0,240 Q 300,140 500,340 T 1000,240" opacity="0.2" />
            <path d="M 400,0 Q 500,300 300,600 T 800,1000" opacity="0.5" />
            <path d="M 420,0 Q 520,300 320,600 T 820,1000" opacity="0.3" />
            <path d="M 600,0 Q 700,400 900,300 T 1200,800" opacity="0.4" />
          </svg>
        </motion.div>

        {/* Annotations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute top-[20%] left-[20%] md:left-[30%] flex flex-col items-center pointer-events-none"
        >
          <p className="text-white text-xs font-serif italic mb-1 drop-shadow-md">Healthy Vegetation</p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="opacity-80">
            <path d="M12 4v16M8 8l4-4 4 4" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 2.8 }}
          className="absolute bottom-[30%] left-[10%] md:left-[15%] flex flex-col items-center pointer-events-none"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="opacity-80 mb-1">
            <path d="M12 20V4M8 16l4 4 4-4" />
          </svg>
          <p className="text-white text-xs font-serif italic drop-shadow-md">Soil Moisture Optimal</p>
        </motion.div>

        {/* Crop Cycle Rail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 hidden sm:flex"
        >
          <p className="text-[10px] uppercase tracking-widest font-sans text-deep-forest rotate-90 origin-bottom mb-12">Crop Cycle</p>
          
          <div className="flex flex-col items-center gap-4 relative">
            <div className="w-[1px] h-full absolute left-1/2 -translate-x-1/2 bg-deep-forest/20 -z-10"></div>
            
            <div className="w-8 h-8 rounded-full bg-deep-forest text-paper-ivory flex items-center justify-center relative shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V8" /><path d="M12 8c-3 0-6-3-6-6s3 6 6 6z" /></svg>
              <div className="absolute right-10 whitespace-nowrap text-right">
                <p className="text-xs font-sans font-medium text-deep-forest">Sowing</p>
                <p className="text-[10px] text-moss">May - Jun</p>
              </div>
            </div>
            
            <div className="w-6 h-6 rounded-full bg-paper-ivory border border-deep-forest/20 flex items-center justify-center relative">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-moss"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" /></svg>
            </div>
            
            <div className="w-6 h-6 rounded-full bg-paper-ivory border border-deep-forest/20 flex items-center justify-center relative">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-moss"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
