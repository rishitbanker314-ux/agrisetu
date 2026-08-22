'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { ShieldCheck, Leaf } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/en` // Redirect to the dashboard in english
        }
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-sm shadow-sm border-2 border-gray-300 overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-800 border-b-4 border-green-900 p-8 text-center relative">
          <div className="bg-white border-2 border-green-900 w-16 h-16 rounded-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Leaf className="w-8 h-8 text-green-800" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">AgriSetu</h1>
          <p className="text-green-100 text-sm font-bold mt-2 uppercase tracking-widest">BRICS Agricultural Intelligence</p>
        </div>

        {/* Body */}
        <div className="p-8 bg-gray-50">
          <div className="text-center mb-8">
            <h2 className="text-xl font-black text-gray-900 uppercase">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1 font-bold">Sign in to access your farm dashboard</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-900 font-black uppercase tracking-widest py-3 px-4 rounded-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="mt-8 pt-6 border-t-2 border-gray-200 flex items-center justify-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-green-700" />
            Secure Auth via Supabase
          </div>
        </div>
      </div>
    </div>
  );
}
