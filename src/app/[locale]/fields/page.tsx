'use client';

import Link from 'next/link';
import { Sprout, Map as MapIcon, Plus, ChevronRight, Settings, X, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Field {
  id: string;
  name: string;
  crop: string;
  area: string;
  status: string;
  created_at: string;
  lat?: number | null;
  lng?: number | null;
  boundary?: [number, number][] | null;
  region?: string;
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnBoundary, setDrawnBoundary] = useState<any[]>([]);

  useEffect(() => {
    async function loadFields() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('fields')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setFields(data);
      }
      setIsLoading(false);
    }
    loadFields();
  }, []);

  const handleAddField = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    let targetLat = selectedLocation ? selectedLocation[0] : null;
    let targetLng = selectedLocation ? selectedLocation[1] : null;
    const allPts = drawnBoundary.flat();
    if (allPts.length > 2) {
      const sumLat = allPts.reduce((sum, p) => sum + p[0], 0);
      const sumLng = allPts.reduce((sum, p) => sum + p[1], 0);
      targetLat = sumLat / allPts.length;
      targetLng = sumLng / allPts.length;
    }

    const newField = {
      owner_id: userId,
      name: formData.get('name') as string,
      crop: formData.get('crop') as string,
      area: (formData.get('area') as string) + ' ha',
      lat: targetLat || undefined,
      lng: targetLng || undefined,
      boundary: allPts.length > 2 ? drawnBoundary : null,
      region: formData.get('region') as string,
      status: 'Healthy'
    };

    const { data, error } = await supabase
      .from('fields')
      .insert(newField)
      .select()
      .single();

    if (!error && data) {
      setFields([data, ...fields]);
      toast.success('Field registered successfully!');
      setIsModalOpen(false);
    } else {
      toast.error(`Error registering field: ${error?.message}`);
    }
    setIsSaving(false);
  };

  const handleEditField = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingField || !userId) return;
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    let targetLat = selectedLocation ? selectedLocation[0] : null;
    let targetLng = selectedLocation ? selectedLocation[1] : null;
    const allPts = drawnBoundary.flat();
    if (allPts.length > 2) {
      const sumLat = allPts.reduce((sum, p) => sum + p[0], 0);
      const sumLng = allPts.reduce((sum, p) => sum + p[1], 0);
      targetLat = sumLat / allPts.length;
      targetLng = sumLng / allPts.length;
    }

    const updates = {
      name: formData.get('name') as string,
      crop: formData.get('crop') as string,
      area: (formData.get('area') as string) + ' ha',
      lat: targetLat,
      lng: targetLng,
      boundary: allPts.length > 2 ? drawnBoundary : null,
      region: formData.get('region') as string,
    };

    const { error } = await supabase
      .from('fields')
      .update(updates)
      .eq('id', editingField.id);

    if (!error) {
      setFields(fields.map(f => f.id === editingField.id ? { ...f, ...updates } : f));
      toast.success('Field updated successfully!');
      setEditingField(null);
    } else {
      toast.error(`Error updating field: ${error.message}`);
    }
    setIsSaving(false);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field? All associated notes and data will be lost.')) return;
    
    setIsDeleting(true);
    const { error } = await supabase.from('fields').delete().eq('id', fieldId);
    
    if (!error) {
      setFields(fields.filter(f => f.id !== fieldId));
      toast.success('Field deleted successfully');
      setEditingField(null);
    } else {
      toast.error(`Error deleting field: ${error.message}`);
    }
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest">
      <header className="bg-white border-b border-soft-line z-[9999] flex items-center justify-between px-4 md:px-6 h-16 shrink-0 relative shadow-sm">
        <Link href="/en/dashboard" className="text-ink/60 hover:text-moss transition-colors flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
        <Link href="/en" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Sprout className="w-6 h-6 text-deep-forest" />
          <span className="font-serif text-xl tracking-tight text-ink font-medium hidden sm:block">AgriSetu</span>
        </Link>
        <div className="text-xs font-medium uppercase tracking-widest text-ink/50">My Fields</div>
      </header>

      <main className="flex-grow p-6 md:p-12 max-w-6xl mx-auto w-full relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-deep-forest font-medium tracking-tight mb-2">Registered Fields</h1>
            <p className="text-ink/60 max-w-xl leading-relaxed">Manage your agricultural plots, monitor crop cycles, and review historical performance data across all registered territories.</p>
          </div>
          <button 
            onClick={() => {
              setSelectedLocation(null);
              setDrawnBoundary([]);
              setIsDrawing(false);
              setIsModalOpen(true);
            }}
            className="bg-deep-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-moss transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add New Field
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-moss" />
          </div>
        ) : fields.length === 0 ? (
          <div className="text-center py-12 text-ink/50">No fields registered yet. Click "Add New Field" to get started.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div key={field.id} className="bg-white border border-soft-line rounded-xl p-5 shadow-sm hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-moss/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-moss/10 p-2 rounded-lg">
                    <MapIcon className="w-5 h-5 text-moss" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setEditingField(field);
                      setSelectedLocation(field.lat != null && field.lng != null ? [field.lat, field.lng] : null);
                      setDrawnBoundary(field.boundary || []);
                      setIsDrawing(false);
                    }}
                    className="text-ink/40 hover:text-ink transition-colors p-2 -mr-2 -mt-2"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-xl font-serif text-deep-forest font-medium mb-1">{field.name}</h3>
                <p className="text-xs uppercase tracking-widest text-ink/50 mb-4">{field.crop} &bull; {field.area}{field.region ? ` • ${field.region}` : ''}</p>
                
                <div className="flex justify-between items-end border-t border-soft-line pt-4 mt-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Current Status</div>
                    <div className={`text-sm font-medium ${field.status === 'Water Stress' ? 'text-terracotta' : 'text-moss'}`}>
                      {field.status}
                    </div>
                  </div>
                  <Link href={`/en/dashboard?fieldId=${field.id}`} className="w-8 h-8 rounded-full bg-paper-ivory flex items-center justify-center text-ink hover:bg-moss hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <div className="flex-1 border-r border-soft-line flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-soft-line">
                <h2 className="text-2xl font-serif text-deep-forest">Register New Field</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-ink/40 hover:text-ink md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddField} className="p-6 space-y-4 flex-grow overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Field Name</label>
                  <input name="name" required placeholder="e.g., East Plot" className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Crop Type</label>
                  <input name="crop" required placeholder="e.g., Soybeans" className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Area (in Hectares)</label>
                  <input name="area" type="number" step="0.1" required placeholder="e.g., 10.5" className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
                </div>
                <div className="mt-4 p-4 bg-moss/5 border border-moss/20 rounded-lg">
                  <p className="text-xs text-ink/70 mb-2"><strong>Location Coordinates:</strong> {selectedLocation ? `Selected (${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)})` : 'Not selected'}</p>
                  <p className="text-[10px] text-ink/50">Click on the map to pinpoint your field's location.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2 mt-4">Location Name</label>
                  <input name="region" required placeholder="e.g., California, Fresno, or your city" className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
                </div>
                <button disabled={isSaving} type="submit" className="w-full flex items-center justify-center gap-2 bg-deep-forest text-white py-3 rounded-md text-sm font-medium hover:bg-moss transition-colors mt-6 disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Field
                </button>
              </form>
            </div>
            <div className="flex-1 min-h-[300px] relative">
              <div className="absolute top-4 left-4 z-[500]">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isDrawing) {
                      setDrawnBoundary(prev => [...prev, []]);
                    }
                    setIsDrawing(!isDrawing);
                  }}
                  className={`px-4 py-2 rounded-full shadow-md text-sm font-medium transition-colors ${isDrawing ? 'bg-moss text-white' : 'bg-white text-ink hover:bg-moss/10'}`}
                >
                  {isDrawing ? 'Finish Drawing' : 'Draw Custom Boundary'}
                </button>
                {drawnBoundary.length > 0 && !isDrawing && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDrawnBoundary([]);
                    }}
                    className="ml-2 px-4 py-2 bg-white rounded-full shadow-md text-sm font-medium text-terracotta hover:bg-terracotta/10 transition-colors"
                  >
                    Clear Shape
                  </button>
                )}
              </div>
              <div className="absolute top-4 right-4 z-[500] hidden md:block">
                <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full shadow-md text-ink/40 hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Map 
                center={selectedLocation || [28.6139, 77.2090]} 
                zoom={selectedLocation ? 16 : 4} 
                onLocationSelect={(lat, lng) => {
                  if (isDrawing) {
                    setDrawnBoundary(prev => { 
                      if (prev.length === 0) return [[[lat, lng]]]; 
                      const newArr = [...prev]; 
                      newArr[newArr.length - 1] = [...newArr[newArr.length - 1], [lat, lng]]; 
                      return newArr; 
                    });
                  } else {
                    setSelectedLocation([lat, lng]);
                  }
                }}
                activeMarker={selectedLocation ? { lat: selectedLocation[0], lng: selectedLocation[1], boundary: drawnBoundary.flat().length > 2 ? drawnBoundary : undefined } : undefined}
                mapStyle="satellite"
                isDrawingMode={isDrawing}
                drawnBoundary={drawnBoundary}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Field Modal */}
      {editingField && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <div className="flex-1 border-r border-soft-line flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-soft-line bg-paper-ivory">
                <h2 className="text-xl font-serif text-deep-forest font-medium">Edit Field</h2>
                <button onClick={() => setEditingField(null)} className="text-ink/40 hover:text-ink p-1 md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditField} className="p-6 space-y-4 flex-grow overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Field Name</label>
                  <input name="name" defaultValue={editingField.name} required className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Crop Type</label>
                  <input name="crop" defaultValue={editingField.crop} required className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Area (in Hectares)</label>
                  <input name="area" type="number" step="0.1" defaultValue={parseFloat(editingField.area) || 0} required className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
                </div>
                
                <div className="mt-4 p-4 bg-moss/5 border border-moss/20 rounded-lg">
                  <p className="text-xs text-ink/70 mb-2"><strong>Location Coordinates:</strong> {selectedLocation ? `Selected (${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)})` : 'Not selected'}</p>
                  <p className="text-[10px] text-ink/50">Click on the map to pinpoint your field's location.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2 mt-4">Location Name</label>
                  <input name="region" defaultValue={editingField.region} required placeholder="e.g., California, Fresno, or your city" className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
                </div>
                
                <div className="flex gap-3 mt-6 pt-4 border-t border-soft-line">
                  <button 
                    type="button" 
                    onClick={() => handleDeleteField(editingField.id)}
                    disabled={isDeleting || isSaving}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-terracotta/30 text-terracotta py-2.5 rounded-md text-sm font-medium hover:bg-terracotta/5 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={isSaving || isDeleting}
                    className="flex-[2] flex items-center justify-center gap-2 bg-deep-forest text-white py-2.5 rounded-md text-sm font-medium hover:bg-moss transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Changes
                  </button>
                </div>
              </form>
            </div>
            <div className="flex-1 min-h-[300px] relative">
              <div className="absolute top-4 left-4 z-[500]">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isDrawing) setDrawnBoundary(prev => [...prev, []]); 
                    setIsDrawing(!isDrawing);
                  }}
                  className={`px-4 py-2 rounded-full shadow-md text-sm font-medium transition-colors ${isDrawing ? 'bg-moss text-white' : 'bg-white text-ink hover:bg-moss/10'}`}
                >
                  {isDrawing ? 'Finish Drawing' : 'Draw Custom Boundary'}
                </button>
                {drawnBoundary.length > 0 && !isDrawing && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDrawnBoundary([]);
                    }}
                    className="ml-2 px-4 py-2 bg-white rounded-full shadow-md text-sm font-medium text-terracotta hover:bg-terracotta/10 transition-colors"
                  >
                    Clear Shape
                  </button>
                )}
              </div>
              <div className="absolute top-4 right-4 z-[500] hidden md:block">
                <button onClick={() => setEditingField(null)} className="bg-white p-2 rounded-full shadow-md text-ink/40 hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Map 
                center={selectedLocation || [28.6139, 77.2090]} 
                zoom={selectedLocation ? 16 : 4} 
                onLocationSelect={(lat, lng) => {
                  if (isDrawing) {
                    setDrawnBoundary(prev => { 
                      if (prev.length === 0) return [[[lat, lng]]]; 
                      const newArr = [...prev]; 
                      newArr[newArr.length - 1] = [...newArr[newArr.length - 1], [lat, lng]]; 
                      return newArr; 
                    });
                  } else {
                    setSelectedLocation([lat, lng]);
                  }
                }}
                activeMarker={selectedLocation ? { lat: selectedLocation[0], lng: selectedLocation[1], boundary: drawnBoundary.flat().length > 2 ? drawnBoundary : undefined } : undefined}
                mapStyle="satellite"
                isDrawingMode={isDrawing}
                drawnBoundary={drawnBoundary}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
