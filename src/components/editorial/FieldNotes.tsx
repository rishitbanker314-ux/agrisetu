'use client';

import { motion } from 'framer-motion';

const capabilities = [
  {
    number: '01',
    title: 'Live telemetry',
    description: 'Continuous satellite parsing translates invisible field stress into clear NDVI markers.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 50 Q 30 20 50 50 T 90 50" opacity="0.6"/>
        <path d="M10 60 Q 30 30 50 60 T 90 60" opacity="0.3"/>
      </svg>
    )
  },
  {
    number: '02',
    title: 'AI agronomist',
    description: 'An intelligence engine that reads soil moisture, canopy temp, and weather to recommend exactly when to act.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="50" cy="50" r="30" strokeDasharray="4 4" opacity="0.8"/>
        <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.2"/>
      </svg>
    )
  },
  {
    number: '03',
    title: 'Crop diagnostics',
    description: 'Identify nutrient deficiencies or pest pressures before they become visible to the naked eye.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M50 90 C 50 90 20 60 20 30 C 20 10 50 20 50 20 C 50 20 80 10 80 30 C 80 60 50 90 50 90 Z" opacity="0.7"/>
        <path d="M50 90 V 20" opacity="0.4"/>
      </svg>
    )
  },
  {
    number: '04',
    title: 'Market intelligence',
    description: 'Hyperlocal commodity tracking lets you know whether to sell immediately or hold for peak pricing.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 80 L 40 50 L 60 60 L 80 20" opacity="0.8"/>
        <circle cx="80" cy="20" r="4" fill="currentColor"/>
      </svg>
    )
  },
  {
    number: '05',
    title: 'Voice guidance',
    description: 'Ask questions naturally in the field. Receive spoken, actionable advice in your local language.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M30 50 V 50 M40 30 V 70 M50 10 V 90 M60 30 V 70 M70 50 V 50" strokeLinecap="round" opacity="0.7"/>
      </svg>
    )
  },
  {
    number: '06',
    title: 'Predictive alerts',
    description: 'Receive early warnings for frost, drought, or extreme rainfall events days before they hit.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="50" cy="50" r="40" opacity="0.2"/>
        <circle cx="50" cy="50" r="30" opacity="0.5"/>
        <circle cx="50" cy="50" r="20" opacity="0.8"/>
      </svg>
    )
  }
];

export default function FieldNotes() {
  return (
    <section className="w-full bg-paper-ivory py-32 px-6">
      <div className="max-w-6xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-24"
        >
          <h2 className="font-serif text-3xl text-deep-forest mb-4 border-b border-soft-line pb-8 inline-block pr-12">
            Field capabilities
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {capabilities.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div 
                key={item.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                className={`flex flex-col ${!isEven ? 'md:mt-32' : ''}`}
              >
                <div className="text-moss mb-8">
                  {item.icon}
                </div>
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-sans text-sm text-moss">{item.number} /</span>
                  <h3 className="font-serif text-2xl text-ink">{item.title}</h3>
                </div>
                <p className="font-sans text-ink/70 leading-relaxed max-w-sm ml-10">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
