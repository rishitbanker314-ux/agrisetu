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
  const [fieldId, setFieldId] = useState('demo-field-123');
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]); // New Delhi default
  const [crop, setCrop] = useState('wheat');
  const [dateOffset, setDateOffset] = useState(0);
  
  // Fields state
  const [savedFields, setSavedFields] = useState<any[]>([]);

  useEffect(() => {
    async function loadFields() {
      if (!user) {
        setSavedFields([]);
        return;
      }
      
      // Ensure profile exists to avoid FK constraint errors when inserting fields
      await supabase.from('profiles').upsert({ 
        id: user.id,
        role: 'farmer' // Provide a default valid role 
      }, { onConflict: 'id' });

      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching fields:', error);
      } else if (data && data.length > 0) {
        setSavedFields(data);
        // If we just loaded and this is the first time, center on the first field
        setCenter([data[0].lat, data[0].lng]);
        setFieldId(data[0].id);
        if (data[0].crop) setCrop(data[0].crop);
      }
    }
    
    loadFields();
  }, [user]);

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
          savedFields={savedFields}
          onSaveField={async () => {
            if (!user) {
              alert("Please log in to save fields.");
              return;
            }
            const newName = `New Field - ${new Date().toLocaleDateString()}`;
            const { data, error } = await supabase.from('fields').insert({
              owner_id: user.id,
              name: newName,
              lat: center[0],
              lng: center[1],
              crop: crop,
              area: '0',
              status: 'active'
            }).select().single();
            
            if (error) {
              console.error(error);
              alert(`Failed to save field: ${error.message || JSON.stringify(error)}`);
            } else if (data) {
              setSavedFields(prev => [data, ...prev]);
              setFieldId(data.id);
            }
          }}
          onSelectField={(field) => {
            setCenter([field.lat, field.lng]);
            setFieldId(field.id);
            if (field.crop) setCrop(field.crop);
          }}
        />
      </main>
    </div>
  );
}
