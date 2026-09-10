'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { Sprout, CloudRain, Leaf, Wheat, ShoppingBasket, LineChart, LucideIcon } from 'lucide-react';

interface Stage {
  name: string;
  icon: LucideIcon;
  offset: number;
}

const DesktopStageNode = ({ stage, i, scrollYProgress }: { stage: Stage; i: number; scrollYProgress: MotionValue<number> }) => {
  const xPos = 5 + (i * 18);
  const yPos = i < 2 ? 80 : (i === 2 ? 50 : 15);
  
  const scale = useTransform(scrollYProgress, 
    [stage.offset - 0.1, stage.offset, stage.offset + 0.1], 
    [0.8, 1.2, 1]
  );
  const backgroundColor = useTransform(scrollYProgress, 
    [stage.offset - 0.1, stage.offset], 
    ['var(--color-paper-ivory)', 'var(--color-paper-ivory)']
  );
  const borderColor = useTransform(scrollYProgress, 
    [stage.offset - 0.1, stage.offset], 
    ['var(--color-soft-line)', 'var(--color-moss)']
  );
  const color = useTransform(scrollYProgress, 
    [stage.offset - 0.1, stage.offset], 
    ['var(--color-ink)', 'var(--color-moss)']
  );

  return (
    <div 
      className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: xPos + '%', top: yPos + '%' }}
    >
      <motion.div 
        style={{ scale, backgroundColor, borderColor, color }}
        className="w-12 h-12 rounded-full border-2 flex items-center justify-center bg-paper-ivory z-10 transition-colors"
      >
        <stage.icon size={18} strokeWidth={1.5} />
      </motion.div>
      <p className="mt-4 text-xs font-sans uppercase tracking-wider text-ink font-medium whitespace-nowrap">
        {stage.name}
      </p>
    </div>
  );
};

const MobileStageNode = ({ stage, scrollYProgress }: { stage: Stage; scrollYProgress: MotionValue<number> }) => {
  const borderColor = useTransform(scrollYProgress, 
    [stage.offset - 0.1, stage.offset], 
    ['var(--color-soft-line)', 'var(--color-moss)']
  );
  const color = useTransform(scrollYProgress, 
    [stage.offset - 0.1, stage.offset], 
    ['var(--color-ink)', 'var(--color-moss)']
  );

  return (
    <div className="flex items-center gap-6 relative z-10">
      <motion.div 
        style={{ borderColor, color }}
        className="w-12 h-12 rounded-full border-2 bg-paper-ivory flex flex-shrink-0 items-center justify-center"
      >
        <stage.icon size={18} strokeWidth={1.5} />
      </motion.div>
      <p className="text-sm font-sans uppercase tracking-wider text-ink font-medium">
        {stage.name}
      </p>
    </div>
  );
};

export default function CropCycleTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const stages = [
    { name: 'Sowing', icon: Sprout, offset: 0 },
    { name: 'Establishment', icon: CloudRain, offset: 0.2 },
    { name: 'Nutrition', icon: Leaf, offset: 0.4 },
    { name: 'Flowering', icon: Wheat, offset: 0.6 },
    { name: 'Harvest', icon: ShoppingBasket, offset: 0.8 },
    { name: 'Market signals', icon: LineChart, offset: 1.0 },
  ];

  return (
    <section ref={containerRef} className="w-full bg-paper-ivory py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 md:w-1/3">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl text-deep-forest mb-6"
          >
            Every season<br/>leaves clues.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-sans text-ink/70"
          >
            AgriCrate keeps the whole season in view &mdash; from sowing to harvest and every decision between them.
          </motion.p>
        </div>

        {/* Desktop Arc Timeline */}
        <div className="hidden md:block relative h-[400px] w-full mt-10">
          <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
            {/* Background Path */}
            <path 
              d="M 50,250 C 300,250 400,50 950,50" 
              fill="none" 
              stroke="var(--color-soft-line)" 
              strokeWidth="2" 
              strokeDasharray="8 8"
            />
            {/* Active Path */}
            <motion.path 
              d="M 50,250 C 300,250 400,50 950,50" 
              fill="none" 
              stroke="var(--color-moss)" 
              strokeWidth="3" 
              style={{ pathLength: scrollYProgress }}
            />
          </svg>

          {/* Timeline Nodes */}
          {stages.map((stage, i) => (
            <DesktopStageNode key={stage.name} stage={stage} i={i} scrollYProgress={scrollYProgress} />
          ))}
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="md:hidden relative mt-16 pl-8">
          <motion.div 
            style={{ scaleY: scrollYProgress, originY: 0 }}
            className="absolute left-[39px] top-0 bottom-0 w-[2px] bg-moss z-0"
          ></motion.div>
          <div className="absolute left-[39px] top-0 bottom-0 w-[2px] bg-soft-line border-dashed z-[-1]"></div>

          <div className="flex flex-col gap-12">
            {stages.map((stage) => (
              <MobileStageNode key={stage.name} stage={stage} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
