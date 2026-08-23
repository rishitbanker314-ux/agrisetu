'use client';

import Link from 'next/link';
import { Sprout, FileText, Loader2, Plus, X, Calendar, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FieldNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  field_id: string;
  fields?: {
    name: string;
    crop: string;
  };
}

interface Field {
  id: string;
  name: string;
  crop: string;
}

export default function FieldNotesPage() {
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    field_id: ''
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Load Fields
        const { data: fieldsData } = await supabase
          .from('fields')
          .select('id, name, crop')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        
        if (fieldsData) {
          setFields(fieldsData);
          if (fieldsData.length > 0) {
            setNewNote(prev => ({ ...prev, field_id: fieldsData[0].id }));
          }
        }

        // Load Notes
        const { data: notesData } = await supabase
          .from('field_notes')
          .select(`
            *,
            fields (
              name,
              crop
            )
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (notesData) setNotes(notesData as FieldNote[]);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newNote.field_id || !newNote.title.trim() || !newNote.content.trim()) return;
    
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('field_notes')
      .insert({
        owner_id: userId,
        field_id: newNote.field_id,
        title: newNote.title.trim(),
        content: newNote.content.trim()
      })
      .select(`
        *,
        fields (
          name,
          crop
        )
      `)
      .single();

    setIsSubmitting(false);

    if (error) {
      alert(`Error creating note: ${error.message}`);
    } else if (data) {
      setNotes([data as FieldNote, ...notes]);
      setIsModalOpen(false);
      setNewNote({ ...newNote, title: '', content: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const { error } = await supabase.from('field_notes').delete().eq('id', id);
    if (!error) {
      setNotes(notes.filter(n => n.id !== id));
    } else {
      alert(`Error deleting note: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest relative">
      <header className="bg-white border-b border-soft-line z-[40] flex items-center justify-between px-6 h-16 shrink-0 shadow-sm relative">
        <Link href="/en/dashboard" className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-deep-forest" />
          <span className="font-serif text-xl tracking-tight text-ink font-medium">AgriSetu</span>
        </Link>
        <div className="text-xs font-medium uppercase tracking-widest text-ink/50">Field Notes</div>
      </header>

      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-deep-forest font-medium tracking-tight mb-2">My Field Notes</h1>
            <p className="text-sm text-ink/60">Keep track of observations, tasks, and crop progress.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-deep-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-moss transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create New Note
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-moss" />
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white border border-soft-line rounded-xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-paper-ivory rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-moss/50" />
            </div>
            <h3 className="text-xl font-serif text-deep-forest mb-2">No notes yet</h3>
            <p className="text-sm text-ink/60 mb-6 max-w-md mx-auto">You haven't created any field notes yet. Click the button above to log your first observation.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-moss font-medium hover:underline"
            >
              Write your first note &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white border border-soft-line rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                <button 
                  onClick={() => handleDelete(note.id)}
                  className="absolute top-4 right-4 text-ink/30 hover:text-terracotta opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Note"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-xs font-medium text-ink/50 uppercase tracking-widest mb-3">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-xl font-serif text-deep-forest font-medium mb-2">{note.title}</h3>
                
                <div className="flex items-center gap-1 text-xs font-medium text-moss mb-4 bg-moss/5 w-fit px-2 py-1 rounded">
                  <MapPin className="w-3 h-3" />
                  {note.fields?.name || 'Unknown Field'} <span className="opacity-50">({note.fields?.crop || 'No Crop'})</span>
                </div>
                
                <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-soft-line flex justify-between items-center bg-paper-ivory">
              <h2 className="text-xl font-serif text-deep-forest font-medium">New Field Note</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-ink/50 hover:text-ink hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNote} className="p-6 overflow-y-auto flex-grow space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Select Field</label>
                {fields.length === 0 ? (
                  <div className="text-sm text-terracotta bg-terracotta/10 p-3 rounded-md">
                    You need to save a field on the Dashboard map before creating notes.
                  </div>
                ) : (
                  <select 
                    value={newNote.field_id}
                    onChange={(e) => setNewNote({ ...newNote, field_id: e.target.value })}
                    className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss"
                    required
                  >
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.crop})</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Note Title</label>
                <input 
                  type="text" 
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="e.g. Aphids observation in north corner"
                  className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" 
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Details / Observations</label>
                <textarea 
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Describe what you saw, actions taken, or tasks for tomorrow..."
                  rows={6}
                  className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-3 text-sm text-ink focus:outline-none focus:border-moss resize-none" 
                  required
                />
              </div>

              <div className="pt-4 border-t border-soft-line flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || fields.length === 0}
                  className="bg-deep-forest text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-moss transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
