'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Map', icon: '🗺️' },
  { href: '/list', label: 'List', icon: '📋' },
  { href: '/leaderboard', label: 'Leaders', icon: '🏆' },
];

const MORE_ITEMS = [
  { href: '/about', label: 'About', icon: 'ℹ️' },
  { href: '/review', label: 'Review Queue', icon: '🛡️' },
];

const MORE_PATHS = MORE_ITEMS.map((i) => i.href);

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_PATHS.includes(pathname);

  return (
    <>
      {/* Backdrop + popup menu */}
      {moreOpen && (
        <>
          <div
            onClick={() => setMoreOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'transparent' }}
          />
          <div
            style={{
              position: 'fixed', right: '8px', bottom: '68px', zIndex: 31,
              background: 'white', borderRadius: '14px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.06)',
              overflow: 'hidden', minWidth: '180px',
              animation: 'moreIn 0.16s ease-out',
            }}
          >
            <style>{`@keyframes moreIn { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
            {MORE_ITEMS.map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', textDecoration: 'none',
                    color: isActive ? '#F77F00' : '#1C1C1C',
                    borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    background: isActive ? 'rgba(247,127,0,0.06)' : 'white',
                  }}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: isActive ? '700' : '600' }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <nav
        className="flex shrink-0"
        style={{
          backgroundColor: '#1C1C1C',
          height: '60px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                textDecoration: 'none',
                color: isActive ? '#F77F00' : 'rgba(255,255,255,0.5)',
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '500', letterSpacing: '0.3px' }}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More tab */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: moreActive || moreOpen ? '#F77F00' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.15s',
          }}
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{moreOpen ? '✕' : '⋯'}</span>
          <span style={{ fontSize: '10px', fontWeight: moreActive || moreOpen ? '700' : '500', letterSpacing: '0.3px' }}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}
