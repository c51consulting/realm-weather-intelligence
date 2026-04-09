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
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <span className="text-2xl">R</span> REALM Weather Intelligence
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user && (
          <Link href="/dashboard" className="hover:text-blue-300">Dashboard</Link>
        )}
        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400">{user.email}</span>
              <button onClick={handleLogout} className="hover:text-red-300">&nbsp;Logout</button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-blue-300">Login</Link>
          )
        )}
        {user && (
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg font-medium">
            Check Risk
          </Link>
        )}
      </div>
    </nav>
  );
}
