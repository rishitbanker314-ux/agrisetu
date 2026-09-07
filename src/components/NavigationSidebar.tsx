import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Sprout, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface NavigationSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  user: User | null;
}

export default function NavigationSidebar({ isOpen, setIsOpen, user }: NavigationSidebarProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
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
              <Link href="/en" className="px-4 py-2 text-ink/70 hover:bg-moss/5 font-medium rounded-md">Home</Link>
              <Link href="/en/dashboard" className="px-4 py-2 text-ink/70 hover:bg-moss/5 font-medium rounded-md">Dashboard</Link>
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
  );
}
