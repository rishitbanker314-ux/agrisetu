'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import AppHeader from './dashboard/AppHeader';
import MapWorkspace from './dashboard/MapWorkspace';
import { useFieldData } from '@/hooks/useFieldData';
import { useAdvisory } from '@/hooks/useAdvisory';

export default function Dashboard() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Shared State
  const [fieldId] = useState('demo-field-123');
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]); // New Delhi default
  const [crop, setCrop] = useState('wheat');
  const [dateOffset, setDateOffset] = useState(0);

  // Fetch real-time data
  const { data: fieldData, loading } = useFieldData(center[0], center[1]);
  const temporalNdvi = (fieldData as any)?.temporal?.ndviProgression?.[dateOffset] ?? fieldData?.ndvi ?? 0.5;
  
  // Fetch AI Advisory
  const { advisory, loading: advisoryLoading } = useAdvisory(fieldData, crop, 'en');

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-paper-ivory font-sans selection:bg-moss/30 selection:text-deep-forest">
      <AppHeader user={user} crop={crop} setCrop={setCrop} />
      
      <main className="flex-grow relative">
        <MapWorkspace 
          center={center}
          setCenter={setCenter}
          temporalNdvi={temporalNdvi}
          dateOffset={dateOffset}
          setDateOffset={setDateOffset}
          fieldData={fieldData}
          crop={crop}
          advisory={advisory || ""}
          advisoryLoading={advisoryLoading}
          fieldId={fieldId}
        />
      </main>
    </div>
  );
}
