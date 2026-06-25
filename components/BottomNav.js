'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ─── Line icons (stroke = currentColor, so active/inactive colour just works) ──
const svgProps = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
};

function IconMap({ size = 22 }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <path d="M9 4 L3 6 V20 L9 18 L15 20 L21 18 V4 L15 6 L9 4 Z" />
      <path d="M9 4 V18" /><path d="M15 6 V20" />
    </svg>
  );
}
function IconList({ size = 22 }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4 a1.5 1.5 0 0 1 1.5 -1.5 h3 A1.5 1.5 0 0 1 15 4 v1 H9 Z" />
      <line x1="8.5" y1="10" x2="15.5" y2="10" /><line x1="8.5" y1="14" x2="15.5" y2="14" />
    </svg>
  );
}
function IconWards({ size = 22 }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <line x1="3" y1="21" x2="21" y2="21" />
      <rect x="5" y="11" width="3.4" height="10" rx="1" />
      <rect x="10.3" y="6" width="3.4" height="15" rx="1" />
      <rect x="15.6" y="14" width="3.4" height="7" rx="1" />
    </svg>
  );
}
function IconMore({ size = 22 }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
function IconClose({ size = 22 }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
function IconAbout({ size = 20 }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconReview({ size = 20 }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <path d="M12 3 L19 6 V11 C19 16 16 19.5 12 21 C8 19.5 5 16 5 11 V6 Z" />
      <path d="M9 11.5 l2.2 2.2 L15 9.5" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: '/', label: 'Map', Icon: IconMap },
  { href: '/list', label: 'List', Icon: IconList },
  { href: '/leaderboard', label: 'Wards', Icon: IconWards },
];

const MORE_ITEMS = [
  { href: '/about', label: 'About', Icon: IconAbout },
  { href: '/review', label: 'Review Queue', Icon: IconReview },
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
                  <span style={{ display: 'inline-flex', lineHeight: 1 }}><item.Icon size={20} /></span>
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
                gap: '3px',
                textDecoration: 'none',
                color: isActive ? '#F77F00' : 'rgba(255,255,255,0.5)',
                transition: 'color 0.15s',
              }}
            >
              <span style={{ display: 'inline-flex', lineHeight: 1 }}><item.Icon /></span>
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
            gap: '3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: moreActive || moreOpen ? '#F77F00' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.15s',
          }}
        >
          <span style={{ display: 'inline-flex', lineHeight: 1 }}>{moreOpen ? <IconClose /> : <IconMore />}</span>
          <span style={{ fontSize: '10px', fontWeight: moreActive || moreOpen ? '700' : '500', letterSpacing: '0.3px' }}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}
