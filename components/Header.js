'use client';

import Link from 'next/link';
import { useState, useEffect, useId } from 'react';

// ─── Brand icons (real brand colours) ──────────────────────────────────────────

function InstagramIcon({ size = 18 }) {
  const gid = 'ig-' + useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={gid} x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#feda75" />
          <stop offset="0.25" stopColor="#fa7e1e" />
          <stop offset="0.5" stopColor="#d62976" />
          <stop offset="0.75" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill={`url(#${gid})`} stroke="none" />
    </svg>
  );
}

// X's brand mark is black; render white on dark surfaces so it stays visible.
function XIcon({ size = 16, onDark = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={onDark ? '#ffffff' : '#000000'}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ size = 18 }) {
  const gid = 'tg-' + useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={`url(#${gid})`}>
      <defs>
        <linearGradient id={gid} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2AABEE" />
          <stop offset="1" stopColor="#229ED9" />
        </linearGradient>
      </defs>
      <path d="M21.94 4.27a1 1 0 0 0-1.05-.16L3.36 11.2c-.86.34-.83 1.58.05 1.87l4.3 1.42 1.62 5.1c.2.64 1 .85 1.49.39l2.4-2.27 4.27 3.13c.5.37 1.22.1 1.36-.5l3.05-13.6a1 1 0 0 0-.41-1.01zM9.7 13.9l8.2-5.07-6.6 6.17c-.13.12-.22.28-.25.46l-.27 2.02z" />
    </svg>
  );
}

const SOCIALS = [
  { name: 'Instagram', label: 'Instagram', href: 'https://instagram.com/xakkhi.dibrugarh', Icon: InstagramIcon },
  { name: 'X', label: 'Twitter / X', href: 'https://twitter.com/xakkhi', Icon: XIcon },
  { name: 'Telegram', label: 'Telegram', href: 'https://t.me/xakkhi', Icon: TelegramIcon },
];

export default function Header() {
  const [socialOpen, setSocialOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // Auto-flip through the social icons; pause while the menu is open
  useEffect(() => {
    if (socialOpen) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SOCIALS.length), 2200);
    return () => clearInterval(t);
  }, [socialOpen]);

  const Current = SOCIALS[idx].Icon;

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        backgroundColor: '#1C1C1C',
        height: '52px',
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Bilingual wordmark */}
      <Link href="/" className="flex items-center gap-1 no-underline">
        <span style={{ color: 'white', fontSize: '20px', fontWeight: '800', fontFamily: 'Fraunces, serif', letterSpacing: '-0.5px' }}>
          Xakkhi
        </span>
        <span style={{ color: '#F77F00', fontSize: '18px', fontWeight: '700', fontFamily: 'Noto Sans Bengali, sans-serif', marginLeft: '4px' }}>
          সাক্ষী
        </span>
      </Link>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Social media — auto-flipping icon */}
        <div style={{ position: 'relative' }}>
          <style>{`@keyframes socialFlip { 0% { transform: rotateX(90deg); opacity: 0; } 55% { opacity: 1; } 100% { transform: rotateX(0deg); opacity: 1; } }`}</style>
          <button
            onClick={() => setSocialOpen(!socialOpen)}
            style={{
              color: 'rgba(255,255,255,0.8)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '120px',
            }}
            aria-label="Social media links"
          >
            <span
              key={idx}
              style={{ display: 'inline-flex', animation: socialOpen ? 'none' : 'socialFlip 0.5s ease-out' }}
            >
              <Current onDark />
            </span>
          </button>

          {socialOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '36px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                minWidth: '180px',
                zIndex: 200,
              }}
            >
              {SOCIALS.map((item, i) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSocialOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '13px 16px',
                    color: '#1C1C1C',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderTop: i > 0 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <span style={{ display: 'inline-flex', color: '#1C1C1C', width: '20px', justifyContent: 'center' }}>
                    <item.Icon size={18} />
                  </span>
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Close social dropdown on outside click */}
      {socialOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
          onClick={() => setSocialOpen(false)}
        />
      )}
    </header>
  );
}
