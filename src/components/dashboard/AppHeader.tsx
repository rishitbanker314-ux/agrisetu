'use client';

import Link from 'next/link';
import Image from 'next/image';
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
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
            <Image src="/logo.jpeg" alt="AgriCrate Logo" width={40} height={40} className="object-cover max-w-none" />
          </div>
          <span className="font-serif text-xl tracking-tight text-ink font-medium hidden sm:block">
            AgriCrate
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
        {user && savedFields && savedFields.length > 0 && (
          <div className="hidden sm:flex flex-col items-end mr-2">
            {(() => {
              const currentField = savedFields.find(f => f.id?.toString() === fieldId?.toString()) || savedFields[0];
              const displayArea = currentField?.area || '0 ha';
              let relativeTimeStr = 'Just now';
              
              if (currentField) {
                const targetDate = new Date(currentField.updated_at || currentField.created_at);
                if (!isNaN(targetDate.getTime())) {
                  const diffMs = Date.now() - targetDate.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMins / 60);
                  const diffDays = Math.floor(diffHours / 24);
                  
                  if (diffMins < 1) {
                    relativeTimeStr = 'Just now';
                  } else if (diffMins < 60) {
                    relativeTimeStr = `Updated ${diffMins}m ago`;
                  } else if (diffHours < 24) {
                    relativeTimeStr = `Updated ${diffHours}h ago`;
                  } else {
                    relativeTimeStr = `Updated ${diffDays}d ago`;
                  }
                }
              }
              
              return (
                <>
                  <span className="text-xs font-bold text-ink">{displayArea}</span>
                  <span className="text-[10px] text-ink/50 uppercase tracking-widest">{relativeTimeStr}</span>
                </>
              );
            })()}
          </div>
        )}


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
