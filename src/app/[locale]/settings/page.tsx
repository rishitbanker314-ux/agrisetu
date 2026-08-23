'use client';

import Link from 'next/link';
import { Sprout, User, Bell, CreditCard, Shield, Smartphone, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappAlerts: false,
    emailSummary: false,
  });

  useEffect(() => {
    setIsMounted(true);
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setSettings(prev => ({ ...prev, email: user.email || '' }));

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

          if (profile) {
            setSettings(prev => ({
              ...prev,
              name: profile.name || '',
              phone: profile.phone || '',
              whatsappAlerts: profile.whatsapp_alerts || false,
              emailSummary: profile.email_summary || false,
            }));
          }
        }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    
    // In a real app we might also update the email in auth if it changed, 
    // but for now we'll just update the profile table.
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: settings.name,
        phone: settings.phone,
        whatsapp_alerts: settings.whatsappAlerts,
        email_summary: settings.emailSummary
      });

    setIsSaving(false);
    if (!error) {
      alert('Settings saved successfully!');
    }
  };

  const handleResetPassword = async () => {
    if (!settings.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(settings.email);
    if (error) {
      alert(`Error sending reset email: ${error.message}`);
    } else {
      alert('Password reset link sent to your email!');
    }
  };

  const handleBilling = () => {
    alert('Billing and subscriptions are currently managed directly through your account executive. Please contact support to upgrade or modify your plan.');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest">
      <header className="bg-white border-b border-soft-line z-[9999] flex items-center justify-between px-6 h-16 shrink-0 relative shadow-sm">
        <Link href="/en/dashboard" className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-deep-forest" />
          <span className="font-serif text-xl tracking-tight text-ink font-medium">AgriSetu</span>
        </Link>
        <div className="text-xs font-medium uppercase tracking-widest text-ink/50">Settings</div>
      </header>

      <main className="flex-grow p-6 md:p-12 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-deep-forest font-medium tracking-tight">Account Preferences</h1>
          <button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-deep-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-moss transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-moss" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Section */}
            <section className="bg-white border border-soft-line rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-soft-line pb-4">
                <User className="w-5 h-5 text-moss" />
                <h2 className="text-lg font-serif text-deep-forest font-medium">Profile Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={settings.name} 
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })} 
                    className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" 
                  />
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="bg-white border border-soft-line rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-soft-line pb-4">
                <Bell className="w-5 h-5 text-moss" />
                <h2 className="text-lg font-serif text-deep-forest font-medium">Alerts & Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-paper-ivory rounded-lg border border-soft-line">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-terracotta" />
                    <div>
                      <div className="text-sm font-bold text-deep-forest">WhatsApp Alerts</div>
                      <div className="text-xs text-ink/60">Receive critical weather and crop health alerts instantly</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.whatsappAlerts}
                      onChange={(e) => setSettings({ ...settings, whatsappAlerts: e.target.checked })} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-moss"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-paper-ivory rounded-lg border border-soft-line">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-moss" />
                    <div>
                      <div className="text-sm font-bold text-deep-forest">Weekly Email Summary</div>
                      <div className="text-xs text-ink/60">Receive a weekly digest of your fields' performance</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.emailSummary}
                      onChange={(e) => setSettings({ ...settings, emailSummary: e.target.checked })} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-moss"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Security & Plan */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-soft-line rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-moss" />
                  <h2 className="text-lg font-serif text-deep-forest font-medium">Security</h2>
                </div>
                <p className="text-sm text-ink/60 mb-4">Manage your password and secure your account with Supabase authentication.</p>
                <button 
                  onClick={handleResetPassword}
                  className="text-xs font-bold uppercase tracking-widest text-moss hover:text-deep-forest transition-colors"
                >
                  Update Password &rarr;
                </button>
              </div>
              
              <div className="bg-white border border-soft-line rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-terracotta" />
                  <h2 className="text-lg font-serif text-deep-forest font-medium">Subscription</h2>
                </div>
                <p className="text-sm text-ink/60 mb-4">You are currently on the <strong className="text-deep-forest">Enterprise Plan</strong>. Your next billing date is Nov 1, 2025.</p>
                <button 
                  onClick={handleBilling}
                  className="text-xs font-bold uppercase tracking-widest text-terracotta hover:text-deep-forest transition-colors"
                >
                  Manage Billing &rarr;
                </button>
              </div>
            </section>
            
          </div>
        )}
      </main>
    </div>
  );
}
