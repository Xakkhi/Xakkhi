'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Admin auth context. The public app never uses this — citizens stay anonymous.
// It only powers the quiet /login page, the /review gate, and admin-only
// controls. isAdmin = (there is a logged-in user) AND (their email is on the
// allow-list). The same allow-list is enforced in the DB, so the UI flag here
// is just for showing/hiding admin controls — not a security boundary by itself.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isAdminEmail } from '../data/admins';

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  loading: true,
  logout: async () => {},
});

export function useAdmin() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initial session (also handles the magic-link redirect, which the client
    // detects in the URL automatically and turns into a session).
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = isAdminEmail(user?.email);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
