'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import AppHeader from './dashboard/AppHeader';
import MapWorkspace from './dashboard/MapWorkspace';
import { useFieldData } from '@/hooks/useFieldData';
import { useAdvisory } from '@/hooks/useAdvisory';
import { toast } from 'sonner';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialFieldId = searchParams.get('fieldId');
  
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
        
        // Find if the requested field exists, otherwise default to first
        const requestedField = initialFieldId ? data.find((f: any) => f.id.toString() === initialFieldId) : null;
        const targetField = requestedField || data[0];
        
        // If we just loaded and this is the first time, center on the target field
        if (targetField.lat != null && targetField.lng != null) {
          setCenter([targetField.lat, targetField.lng]);
        }
        setFieldId(targetField.id);
        if (targetField.crop) setCrop(targetField.crop);
      }
    }
    
    loadFields();
  }, [user]);

  // Sync field selection when navigating back/forth with different query params
  useEffect(() => {
    if (initialFieldId && savedFields.length > 0) {
      const target = savedFields.find((f: any) => f.id.toString() === initialFieldId);
      if (target && target.id !== fieldId) {
        setFieldId(target.id);
        if (target.lat != null && target.lng != null) {
          setCenter([target.lat, target.lng]);
        }
        if (target.crop) setCrop(target.crop);
      }
    }
  }, [initialFieldId, savedFields]); // Removed fieldId from dependencies so it doesn't force rollback

  // Fetch real-time data
  const { data: fieldData, loading } = useFieldData(center[0], center[1]);
  const temporalNdvi = (fieldData as any)?.temporal?.ndviProgression?.[dateOffset] ?? fieldData?.ndvi ?? 0.5;
  
  // Fetch AI Advisory
  const { advisory, loading: advisoryLoading } = useAdvisory(fieldData, crop, 'en');

  // Automated Real-Time Notifications
  useEffect(() => {
    if (!fieldData || !fieldData.weather || !fieldData.soil || !fieldData.forecast) return;
    
    // We only want to alert once per field load/change to avoid spamming the user.
    // However, since we don't have a persistence layer for "seen" alerts in this demo,
    // we use a slight delay so it feels organic when a user switches fields.
    const timer = setTimeout(() => {
      const triggerNotification = (title: string, message: string) => {
        window.dispatchEvent(new CustomEvent('add-notification', { detail: { title, message } }));
      };

      // 1. Soil Moisture Checks
      if (fieldData.soil.moisture < 25) {
        triggerNotification('🚨 Critical Soil Moisture', `Moisture level for ${crop} is at a dangerously low ${fieldData.soil.moisture}%. Immediate irrigation is required.`);
      } else if (fieldData.soil.moisture > 75) {
        triggerNotification('💧 Waterlogging Risk', `Soil moisture is very high (${fieldData.soil.moisture}%). Hold off on irrigation to prevent root rot.`);
      }
      
      // 2. Temperature Extremes
      if (fieldData.weather.temperature > 35) {
        triggerNotification('🔥 Heat Stress Warning', `Current temperature is ${fieldData.weather.temperature}°C. Monitor ${crop} for heat stress.`);
      } else if (fieldData.weather.temperature < 5) {
        triggerNotification('❄️ Frost Warning', `Temperature is dangerously low (${fieldData.weather.temperature}°C). Protective measures advised.`);
      }
      
      // 3. Flood Risk from Forecast
      if (fieldData.forecast.precipitation && fieldData.forecast.precipitation.length > 0) {
        const maxPrecip = Math.max(...fieldData.forecast.precipitation);
        if (maxPrecip > 50) {
          triggerNotification('🌧️ Flood Risk Detected', `Heavy rainfall (${maxPrecip.toFixed(1)}mm) forecasted in the coming days. Ensure proper drainage.`);
        }
      }
      
      // 4. Market / Crop Specific Real-Time Note
      // Just to give it that "real" feel, we can add a crop-specific generic alert if no critical weather alerts fired.
      if (fieldData.soil.moisture >= 25 && fieldData.weather.temperature <= 35 && fieldData.weather.temperature >= 5) {
        triggerNotification('✅ Optimal Conditions', `Current weather and soil conditions are optimal for ${crop} growth. NDVI is strong at ${fieldData.ndvi}.`);
      }

    }, 2500); // Wait 2.5 seconds after data loads to trigger notifications

    return () => clearTimeout(timer);
  }, [fieldData?.coordinates?.lat, fieldData?.coordinates?.lng, crop]); // Only re-run when location or crop changes

  const handleFieldChange = (newFieldIdStr: string) => {
    const target = savedFields.find((f: any) => f.id.toString() === newFieldIdStr);
    if (target) {
      setFieldId(target.id);
      if (target.lat != null && target.lng != null) {
        setCenter([target.lat, target.lng]);
      }
      if (target.crop) setCrop(target.crop);
      
      // Update the URL so initialFieldId doesn't fight the state
      const params = new URLSearchParams(searchParams.toString());
      params.set('fieldId', target.id.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleCropChange = async (newCrop: string) => {
    setCrop(newCrop);
    if (fieldId && user) {
      const { error } = await supabase
        .from('fields')
        .update({ crop: newCrop })
        .eq('id', fieldId);
      
      if (error) {
        console.error('Error updating crop:', error);
      } else {
        // Update local savedFields state
        setSavedFields(prev => prev.map((f: any) => f.id === fieldId ? { ...f, crop: newCrop } : f));
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-paper-ivory font-sans selection:bg-moss/30 selection:text-deep-forest">
      <AppHeader 
        user={user} 
        crop={crop} 
        setCrop={handleCropChange}
        savedFields={savedFields}
        fieldId={fieldId}
        onFieldChange={handleFieldChange}
      />
      
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
          onSaveField={async (boundary?: [number, number][], newCenter?: [number, number]) => {
            if (!user) {
              toast.error("Please log in to save fields.");
              return;
            }
            
            const currentField = savedFields.find(f => f.id.toString() === fieldId);
            
            if (currentField && (currentField.lat == null || currentField.lng == null)) {
              // Update existing field that has no coordinates
              const targetLat = newCenter ? newCenter[0] : center[0];
              const targetLng = newCenter ? newCenter[1] : center[1];
              const { data, error } = await supabase.from('fields').update({
                lat: targetLat,
                lng: targetLng,
                boundary: boundary || null
              }).eq('id', currentField.id).select().single();
              
              if (error) {
                console.error(error);
                toast.error(`Failed to update field location: ${error.message || JSON.stringify(error)}`);
              } else if (data) {
                toast.success("Field location saved successfully");
                setSavedFields(prev => prev.map(f => f.id === data.id ? data : f));
              }
            } else {
              // Insert new field
              const newName = `New Field - ${new Date().toLocaleDateString()}`;
              const targetLat = newCenter ? newCenter[0] : center[0];
              const targetLng = newCenter ? newCenter[1] : center[1];
              const { data, error } = await supabase.from('fields').insert({
                owner_id: user.id,
                name: newName,
                lat: targetLat,
                lng: targetLng,
                boundary: boundary || null,
                crop: crop,
                area: '0',
                status: 'active'
              }).select().single();
              
              if (error) {
                console.error(error);
                toast.error(`Failed to save field: ${error.message || JSON.stringify(error)}`);
              } else if (data) {
                toast.success("Field saved successfully");
                setSavedFields(prev => [data, ...prev]);
                setFieldId(data.id);
                const params = new URLSearchParams(searchParams.toString());
                params.set('fieldId', data.id.toString());
                router.replace(`${pathname}?${params.toString()}`);
              }
            }
          }}
          onSelectField={(field) => {
            setCenter([field.lat, field.lng]);
            setFieldId(field.id);
            if (field.crop) setCrop(field.crop);
            
            const params = new URLSearchParams(searchParams.toString());
            params.set('fieldId', field.id.toString());
            router.replace(`${pathname}?${params.toString()}`);
          }}
        />
      </main>
    </div>
  );
}
