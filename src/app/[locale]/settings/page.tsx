'use client';

import Link from 'next/link';
import { Sprout, User, Bell, Shield, Smartphone, Save, Loader2, ArrowLeft, LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import NavigationSidebar from '@/components/NavigationSidebar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    whatsappAlerts: false,
    emailSummary: false,
    appNotifications: true,
  });

  useEffect(() => {
    queueMicrotask(() => setIsMounted(true));
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
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
              country: profile.country || '',
              whatsappAlerts: profile.whatsapp_alerts || false,
              emailSummary: profile.email_summary || false,
              appNotifications: profile.app_notifications ?? true,
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
        country: settings.country,
        whatsapp_alerts: settings.whatsappAlerts,
        email_summary: settings.emailSummary,
        app_notifications: settings.appNotifications
      });

    setIsSaving(false);
    if (!error) {
      toast.success('Settings saved successfully!');
    }
  };

  const handleResetPassword = async () => {
    if (!settings.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(settings.email);
    if (error) {
      toast.error(`Error sending reset email: ${error.message}`);
    } else {
      toast.success('Password reset link sent to your email!');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/en/login');
  };


  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-paper-ivory flex flex-col font-sans selection:bg-moss/30 selection:text-deep-forest">
      <header className="bg-white border-b border-soft-line z-[9999] flex items-center justify-between px-4 md:px-6 h-16 shrink-0 relative shadow-sm">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-ink/70 hover:bg-moss/10 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/en" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Sprout className="w-6 h-6 text-deep-forest" />
          <span className="font-serif text-xl tracking-tight text-ink font-medium hidden sm:block">AgriCrate</span>
        </Link>
        <div className="text-xs font-medium uppercase tracking-widest text-ink/50">Settings</div>
        <NavigationSidebar 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen} 
          user={user} 
        />
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
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })} 
                    className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Country</label>
                  <select 
                    value={settings.country}
                    onChange={(e) => setSettings({ ...settings, country: e.target.value })} 
                    className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss"
                  >
                    <option value="">Select a country...</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Russia">Russia</option>
                    <option value="India">India</option>
                    <option value="China">China</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>



            {/* Security */}
            <section className="bg-white border border-soft-line rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-moss" />
                <h2 className="text-lg font-serif text-deep-forest font-medium">Security</h2>
              </div>
              <p className="text-sm text-ink/60 mb-4">Manage your password and secure your account with Supabase authentication.</p>
              <div className="flex items-center justify-between">
                <button 
                  onClick={handleResetPassword}
                  className="text-xs font-bold uppercase tracking-widest text-moss hover:text-deep-forest transition-colors"
                >
                  Update Password &rarr;
                </button>

                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-terracotta hover:bg-terracotta/10 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </section>
            
          </div>
        )}
      </main>
    </div>
  );
}
