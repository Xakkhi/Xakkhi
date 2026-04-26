'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Map', icon: '🗺️' },
  { href: '/list', label: 'List', icon: '📋' },
  { href: '/leaderboard', label: 'Leaders', icon: '🏆' },
  { href: '/about', label: 'About', icon: 'ℹ️' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
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
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? '700' : '500',
                letterSpacing: '0.3px',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
