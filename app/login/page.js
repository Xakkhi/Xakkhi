'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../components/AuthProvider';

export default function LoginPage() {
  const { user, isAdmin, loading, logout } = useAdmin();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function sendLink(e) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) setError(error.message);
    else setSent(true);
    setBusy(false);
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Fraunces, serif', color: '#1C1C1C' }}>
            Xakkhi{' '}
            <span style={{ color: '#F77F00', fontFamily: 'Noto Sans Bengali, sans-serif' }}>সাক্ষী</span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.45)', marginTop: '4px' }}>Admin sign-in</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>Loading…</div>
        ) : user ? (
          // Already signed in — show status
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#1C1C1C', fontWeight: '700' }}>Signed in as</div>
            <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.6)', margin: '4px 0 12px', wordBreak: 'break-all' }}>{user.email}</div>

            <div style={{
              display: 'inline-block', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              background: isAdmin ? '#F0FDF4' : '#FFF8F0',
              color: isAdmin ? '#16A34A' : '#D97706',
            }}>
              {isAdmin ? '✓ Admin access' : 'No admin access for this account'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px' }}>
              {isAdmin && (
                <Link href="/review" style={{
                  padding: '12px', borderRadius: '12px', background: '#1C1C1C', color: 'white',
                  textDecoration: 'none', fontWeight: '700', fontSize: '14px',
                }}>
                  Open Review Queue
                </Link>
              )}
              <button onClick={logout} style={{
                padding: '12px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.12)', background: 'white',
                color: '#1C1C1C', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              }}>
                Log out
              </button>
            </div>
          </div>
        ) : sent ? (
          // Magic link sent
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1C' }}>Check your email</div>
            <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.55)', marginTop: '6px', lineHeight: 1.5 }}>
              We sent a sign-in link to <strong>{email}</strong>. Open it on this device to continue.
            </div>
            <button onClick={() => setSent(false)} style={{
              marginTop: '16px', background: 'none', border: 'none', color: '#F77F00', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
            }}>
              Use a different email
            </button>
          </div>
        ) : (
          // Email form
          <form onSubmit={sendLink} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              style={{
                width: '100%', marginTop: '8px', padding: '12px 14px', borderRadius: '12px',
                border: '1.5px solid rgba(28,28,28,0.15)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {error && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#DC2626', fontWeight: '600' }}>{error}</div>
            )}
            <button type="submit" disabled={busy} style={{
              width: '100%', marginTop: '14px', padding: '13px', borderRadius: '12px', border: 'none',
              background: '#F77F00', color: 'white', fontWeight: '800', fontSize: '15px',
              cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1,
            }}>
              {busy ? 'Sending…' : 'Send login link'}
            </button>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(28,28,28,0.4)', textAlign: 'center', lineHeight: 1.5 }}>
              Admins only. Citizens never need to log in — reporting is fully anonymous.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
