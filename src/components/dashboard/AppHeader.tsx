'use client';

import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Sprout, LogOut, User as UserIcon, Bell, Menu, X, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import NavigationSidebar from '../NavigationSidebar';

interface AppHeaderProps {
  user: User | null;
  crop: string;
  setCrop: (crop: string) => void;
  savedFields?: any[];
  fieldId?: number | string | null;
  onFieldChange?: (id: string) => void;
}


export default function AppHeader({ user, crop, setCrop, savedFields = [], fieldId, onFieldChange }: AppHeaderProps) {
  const t = useTranslations('Index');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('menu') === 'open') {
      setIsMobileMenuOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('menu');
      const newQuery = params.toString();
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ''}`);
    }
  }, [searchParams, pathname, router]);


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

      {/* Center: Removed (Moved to BottomDrawer Intelligence Context) */}
      <div className="flex-1"></div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-xs font-bold text-ink">12.4 ha</span>
          <span className="text-[10px] text-ink/50 uppercase tracking-widest">Updated 5m ago</span>
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
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ink hover:text-terracotta hover:bg-terracotta/10 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
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

      <NavigationSidebar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
        user={user} 
      />
    </header>
  );
}
