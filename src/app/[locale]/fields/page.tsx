'use client';

import Link from 'next/link';
import { Sprout, Map as MapIcon, Plus, ChevronRight, Settings, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Field {
  id: string;
  name: string;
  crop: string;
  area: string;
  status: string;
  created_at: string;
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
    const newField = {
      owner_id: userId,
      name: formData.get('name') as string,
      crop: formData.get('crop') as string,
      area: (formData.get('area') as string) + ' ha',
      status: 'Healthy'
    };

    const { data, error } = await supabase
      .from('fields')
      .insert(newField)
      .select()
      .single();

    if (!error && data) {
      setFields([data, ...fields]);
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest">
      <header className="bg-white border-b border-soft-line z-[9999] flex items-center justify-between px-6 h-16 shrink-0 relative shadow-sm">
        <Link href="/en/dashboard" className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-deep-forest" />
          <span className="font-serif text-xl tracking-tight text-ink font-medium">AgriSetu</span>
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
            onClick={() => setIsModalOpen(true)}
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
                  <button className="text-ink/40 hover:text-ink transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-xl font-serif text-deep-forest font-medium mb-1">{field.name}</h3>
                <p className="text-xs uppercase tracking-widest text-ink/50 mb-4">{field.crop} &bull; {field.area}</p>
                
                <div className="flex justify-between items-end border-t border-soft-line pt-4 mt-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Current Status</div>
                    <div className={`text-sm font-medium ${field.status === 'Water Stress' ? 'text-terracotta' : 'text-moss'}`}>
                      {field.status}
                    </div>
                  </div>
                  <Link href="/en/dashboard" className="w-8 h-8 rounded-full bg-paper-ivory flex items-center justify-center text-ink hover:bg-moss hover:text-white transition-colors">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-soft-line">
              <h2 className="text-2xl font-serif text-deep-forest">Register New Field</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-ink/40 hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddField} className="p-6 space-y-4">
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
              <button disabled={isSaving} type="submit" className="w-full flex items-center justify-center gap-2 bg-deep-forest text-white py-3 rounded-md text-sm font-medium hover:bg-moss transition-colors mt-6 disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Field
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
