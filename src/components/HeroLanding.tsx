'use client';

import { useState } from 'react';
import PageLoader from './editorial/PageLoader';
import SiteHeader from './editorial/SiteHeader';
import EditorialHero from './editorial/EditorialHero';
import FieldAtlasReveal from './editorial/FieldAtlasReveal';
import SignalTranslation from './editorial/SignalTranslation';
import CropCycleTimeline from './editorial/CropCycleTimeline';
import FieldNotes from './editorial/FieldNotes';
import FinalCTA from './editorial/FinalCTA';
import SiteFooter from './editorial/SiteFooter';

export default function HeroLanding() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="bg-paper-ivory min-h-screen font-sans selection:bg-moss/30 selection:text-deep-forest">
      {loading && <PageLoader onComplete={() => setLoading(false)} />}
      
      {!loading && (
        <>
          <SiteHeader />
          <main>
            <EditorialHero />
            <FieldAtlasReveal />
            <SignalTranslation />
            <CropCycleTimeline />
            <FieldNotes />
            <FinalCTA />
          </main>
          <SiteFooter />
        </>
      )}
    </div>
  );
}
