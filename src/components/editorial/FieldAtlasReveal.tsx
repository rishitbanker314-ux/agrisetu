'use client';

import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRef, useState } from 'react';
import Image from 'next/image';

export default function FieldAtlasReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [activeChapter, setActiveChapter] = useState(1);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest < 0.33) setActiveChapter(1);
    else if (latest < 0.66) setActiveChapter(2);
    else setActiveChapter(3);
  });

  // Animations for Observe (Chapter 1)
  const observeOpacity = useTransform(scrollYProgress, [0, 0.1, 0.3, 0.4], [0, 1, 1, 0]);
  
  // Animations for Understand (Chapter 2)
  const understandOpacity = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  
  // Animations for Act (Chapter 3)
  const actOpacity = useTransform(scrollYProgress, [0.6, 0.7, 1, 1], [0, 1, 1, 1]);
  const routePathLength = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);

  return (
    <section id="how-it-works" ref={containerRef} className="relative w-full bg-paper-ivory/50 h-[300vh]">
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Sticky Visuals */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex items-center justify-center p-8">
          <div className="relative w-full max-w-lg aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
            <Image
              src="/hero-field.jpg"
              alt="Field Atlas Base"
              fill
              className="object-cover grayscale mix-blend-multiply opacity-50"
            />
            
            {/* Chapter 1 Visual: Observe */}
            <motion.div style={{ opacity: observeOpacity }} className="absolute inset-0">
              <div className="absolute inset-0 bg-sage mix-blend-overlay opacity-60"></div>
              <svg className="absolute inset-0 w-full h-full" stroke="var(--color-moss)" strokeWidth="1" fill="none">
                <path d="M 0,50 Q 100,20 200,80 T 400,50" opacity="0.8" />
                <path d="M 0,70 Q 100,40 200,100 T 400,70" opacity="0.6" />
                <path d="M 0,90 Q 100,60 200,120 T 400,90" opacity="0.4" />
              </svg>
            </motion.div>

            {/* Chapter 2 Visual: Understand */}
            <motion.div style={{ opacity: understandOpacity }} className="absolute inset-0 flex items-center justify-center">
              <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-marigold shadow-[0_0_15px_rgba(214,169,56,0.8)]"></div>
              <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-terracotta shadow-[0_0_15px_rgba(198,106,61,0.8)]"></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-32 border border-deep-forest/20 bg-paper-ivory/90 backdrop-blur-sm rounded-lg p-4 transform -translate-x-1/2 -translate-y-1/2 shadow-lg">
                <p className="text-[10px] font-sans text-moss uppercase tracking-widest mb-2">Soil Moisture</p>
                <div className="w-full h-1 bg-soft-line rounded-full overflow-hidden mb-4">
                  <div className="w-[70%] h-full bg-moss"></div>
                </div>
                <p className="text-[10px] font-sans text-moss uppercase tracking-widest mb-2">Canopy Temp</p>
                <div className="w-full h-1 bg-soft-line rounded-full overflow-hidden">
                  <div className="w-[45%] h-full bg-terracotta"></div>
                </div>
              </div>
            </motion.div>

            {/* Chapter 3 Visual: Act */}
            <motion.div style={{ opacity: actOpacity }} className="absolute inset-0">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  style={{ pathLength: routePathLength }}
                  d="M 20,80 Q 40,60 60,70 T 80,30"
                  fill="none"
                  stroke="var(--color-terracotta)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <motion.circle
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  cx="80" cy="30" r="3" fill="var(--color-terracotta)"
                />
              </svg>
              <div className="absolute top-[20%] right-[15%] bg-terracotta text-white text-[10px] font-sans px-2 py-1 rounded shadow-md">
                Next action
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Text content tracking with scroll */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <div className="mb-12">
            <h2 className="font-serif text-4xl md:text-5xl text-deep-forest mb-4">Every field carries a pattern.</h2>
            <p className="font-sans text-lg text-ink/70">AgriSetu brings the scattered signals together, so growers can see what is changing before it becomes a problem.</p>
          </div>

          <div className="relative h-64 border-l border-soft-line pl-8">
            <motion.div 
              className="absolute left-0 top-0 w-[2px] bg-moss transition-all duration-300"
              style={{
                height: '33%',
                transform: `translateY(${(activeChapter - 1) * 100}%)`,
                left: '-1px'
              }}
            />

            <div className="relative h-full">
              {/* Chapter 1 Text */}
              <motion.div 
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: activeChapter === 1 ? 1 : 0, pointerEvents: activeChapter === 1 ? 'auto' : 'none' }}
              >
                <p className="text-xs font-sans text-moss uppercase tracking-widest mb-2">01 — Observe</p>
                <h3 className="font-serif text-2xl text-ink mb-3">Satellite imagery reveals the field from above.</h3>
                <p className="font-sans text-ink/70">High-resolution multispectral data translates invisible stress into clear visual markers. We read the subtle changes in chlorophyll before they impact yield.</p>
              </motion.div>

              {/* Chapter 2 Text */}
              <motion.div 
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: activeChapter === 2 ? 1 : 0, pointerEvents: activeChapter === 2 ? 'auto' : 'none' }}
              >
                <p className="text-xs font-sans text-moss uppercase tracking-widest mb-2">02 — Understand</p>
                <h3 className="font-serif text-2xl text-ink mb-3">Soil, weather and crop signals explain what the field needs.</h3>
                <p className="font-sans text-ink/70">By integrating ground sensors with hyperlocal forecasts, we build a complete diagnostic view. You see exactly why a zone is underperforming.</p>
              </motion.div>

              {/* Chapter 3 Text */}
              <motion.div 
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: activeChapter === 3 ? 1 : 0, pointerEvents: activeChapter === 3 ? 'auto' : 'none' }}
              >
                <p className="text-xs font-sans text-moss uppercase tracking-widest mb-2">03 — Act</p>
                <h3 className="font-serif text-2xl text-ink mb-3">Clear recommendations turn uncertainty into the next right move.</h3>
                <p className="font-sans text-ink/70">Intelligence without action is noise. We distill complex data into simple, timely directives: when to irrigate, when to spray, and when to harvest.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
