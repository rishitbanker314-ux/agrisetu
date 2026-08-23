'use client';

import Link from 'next/link';
import { Sprout, User, Bell, CreditCard, Shield, Smartphone } from 'lucide-react';

export default function SettingsPage() {
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
        <h1 className="text-3xl md:text-4xl font-serif text-deep-forest font-medium tracking-tight mb-8">Account Preferences</h1>

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
                <input type="text" defaultValue="John Doe" className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Email Address</label>
                <input type="email" defaultValue="john.doe@example.com" className="w-full bg-paper-ivory border border-soft-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-moss" />
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
                  <input type="checkbox" defaultChecked className="sr-only peer" />
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
                  <input type="checkbox" defaultChecked className="sr-only peer" />
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
              <button className="text-xs font-bold uppercase tracking-widest text-moss hover:text-deep-forest">Update Password &rarr;</button>
            </div>
            
            <div className="bg-white border border-soft-line rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-terracotta" />
                <h2 className="text-lg font-serif text-deep-forest font-medium">Subscription</h2>
              </div>
              <p className="text-sm text-ink/60 mb-4">You are currently on the <strong className="text-deep-forest">Enterprise Plan</strong>. Your next billing date is Nov 1, 2025.</p>
              <button className="text-xs font-bold uppercase tracking-widest text-terracotta hover:text-deep-forest">Manage Billing &rarr;</button>
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
}
