import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Sprout, LogOut, User as UserIcon, Bell, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';

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

  return (
    <header className="bg-paper-ivory border-b border-soft-line z-50 flex items-center justify-between px-4 h-16 shrink-0 relative shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 text-ink/70 hover:bg-moss/10 rounded-md">
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
        
        <button className="p-2 text-ink hover:bg-moss/10 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terracotta rounded-full border border-paper-ivory"></span>
        </button>

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
    </header>
  );
}
