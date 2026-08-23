import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Sprout, LogOut, User as UserIcon, Bell, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface AppHeaderProps {
  user: User | null;
  crop: string;
  setCrop: (crop: string) => void;
}

export default function AppHeader({ user, crop, setCrop }: AppHeaderProps) {
  const t = useTranslations('Index');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<{title: string, message: string, time: Date}[]>([]);
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      setNotifications(prev => [{...customEvent.detail, time: new Date()}, ...prev]);
      setUnread(true);
      setIsNotifOpen(true);
      // Auto close after 5 seconds if we just popped it open
      setTimeout(() => setIsNotifOpen(false), 5000);
    };
    window.addEventListener('add-notification', handleNewNotification);
    return () => window.removeEventListener('add-notification', handleNewNotification);
  }, []);

  return (
    <header className="bg-paper-ivory border-b border-soft-line z-[9999] flex items-center justify-between px-4 h-16 shrink-0 relative shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-ink/70 hover:bg-moss/10 rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/en" className="flex items-center gap-2">
          <div className="text-deep-forest">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-serif text-xl tracking-tight text-ink font-medium hidden sm:block">
            AgriSetu
          </span>
        </Link>
        <span className="hidden lg:block text-xs uppercase tracking-widest text-ink/50 ml-2 pl-4 border-l border-soft-line">
          Agricultural Intelligence
        </span>
      </div>

      {/* Center: Field/Crop selectors */}
      <div className="flex items-center gap-1 md:gap-2 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
        <select 
          className="hidden md:block bg-transparent border border-soft-line hover:border-moss px-3 py-1.5 rounded-sm text-sm font-sans font-medium text-ink outline-none cursor-pointer focus:border-moss"
          defaultValue="north-field"
        >
          <option value="north-field">North Field</option>
          <option value="west-field">West Field</option>
          <option value="lowland">Lowland Plot</option>
        </select>

        <span className="hidden md:inline text-soft-line">&mdash;</span>

        <select 
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="bg-white md:bg-transparent border border-soft-line hover:border-moss px-2 md:px-3 py-1 md:py-1.5 rounded-sm text-xs md:text-sm font-sans font-medium text-ink outline-none cursor-pointer focus:border-moss capitalize"
        >
          {['wheat', 'rice', 'corn', 'cotton', 'sugarcane', 'soybean', 'potato', 'tomato', 'onion', 'apple', 'grapes', 'coffee', 'tea', 'millet', 'sorghum', 'barley', 'oats', 'peanut'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="hidden lg:block text-xs text-ink/50 bg-moss/5 px-2 py-1 rounded-sm ml-2 font-medium">
          Rabi 2025–26
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-xs font-bold text-ink">12.4 ha</span>
          <span className="text-[10px] text-ink/50 uppercase tracking-widest">Updated 5m ago</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setUnread(false);
            }}
            className="p-2 text-ink hover:bg-moss/10 rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terracotta rounded-full border border-paper-ivory"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-80 bg-white border border-soft-line shadow-xl rounded-lg overflow-hidden z-50"
              >
                <div className="bg-paper-ivory p-3 border-b border-soft-line flex justify-between items-center">
                  <span className="font-sans font-medium text-sm text-deep-forest">Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={() => setNotifications([])} className="text-xs text-ink/50 hover:text-ink">Clear All</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-ink/50">No new notifications</div>
                  ) : (
                    notifications.map((n, idx) => (
                      <div key={idx} className="p-3 border-b border-soft-line/50 hover:bg-moss/5 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-deep-forest uppercase tracking-widest">{n.title}</span>
                          <span className="text-[10px] text-ink/50">
                            {n.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-sm text-ink/80 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-soft-line px-2 py-1.5 rounded-full cursor-pointer hover:bg-moss/5 transition-colors">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 bg-deep-forest rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-paper-ivory" />
                </div>
              )}
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 text-ink hover:text-terracotta rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link 
            href="/en/login" 
            className="bg-deep-forest text-paper-ivory text-xs md:text-sm font-sans font-medium py-1.5 px-3 md:px-4 rounded-full hover:bg-moss transition-colors"
          >
            SIGN IN
          </Link>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-[9998]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-paper-ivory border-r border-soft-line z-[9999] shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-soft-line flex items-center gap-2">
                <Sprout className="w-6 h-6 text-moss" />
                <span className="font-serif text-xl tracking-tight text-deep-forest font-medium">AgriSetu</span>
              </div>
              <div className="p-4 flex-grow flex flex-col gap-2">
                <Link href="/en/dashboard" className="px-4 py-2 bg-moss/10 text-moss font-medium rounded-md">Dashboard</Link>
                <Link href="/en/fields" className="px-4 py-2 text-ink/70 hover:bg-moss/5 font-medium rounded-md">My Fields</Link>
                <Link href="/en/field-notes" className="px-4 py-2 text-ink/70 hover:bg-moss/5 font-medium rounded-md">Field Notes</Link>
                <Link href="/en/reports" className="px-4 py-2 text-ink/70 hover:bg-moss/5 font-medium rounded-md">Reports</Link>
                <Link href="/en/settings" className="px-4 py-2 text-ink/70 hover:bg-moss/5 font-medium rounded-md">Settings</Link>
              </div>
              <div className="p-4 border-t border-soft-line">
                {user ? (
                  <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-terracotta hover:bg-terracotta/10 rounded-md font-medium transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <Link href="/en/login" className="w-full flex items-center justify-center px-4 py-2 bg-deep-forest text-white rounded-md font-medium">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
