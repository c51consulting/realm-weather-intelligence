'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">R</span> REALM Weather Intelligence
        </Link>
        {user && (
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition hidden sm:inline">Dashboard</Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:inline">{user.email}</span>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">Sign In</Link>
          )
        )}
        <Link href="/login?tab=register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition">
          Check Weather Risk
        </Link>
      </div>
    </nav>
  );
}
