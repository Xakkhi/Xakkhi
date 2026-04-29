'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import FilterChips from '../components/FilterChips';

const MapView = dynamic(() => import('../components/MapView'), { ssr: false });

export default function HomePage() {
  const [filters, setFilters] = useState({
    category: null,
    severity: null,
    status: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Reports will be fetched from Supabase on Day 4
  const reports = [];

  return (
    <>
      {/* Fullscreen loading overlay — fixed so it covers header, nav, filters, everything */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: '#111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '48px',
                fontWeight: '800',
                fontFamily: 'Fraunces, serif',
                color: '#FFFFFF',
                letterSpacing: '-1px',
                lineHeight: 1.1,
              }}
            >
              Xakkhi{' '}
              <span
                style={{
                  color: '#F77F00',
                  fontFamily: 'Noto Sans Bengali, sans-serif',
                  fontWeight: '700',
                }}
              >
                সাক্ষী
              </span>
            </div>
            <p
              style={{
                marginTop: '20px',
                color: '#6B7280',
                fontSize: '15px',
                fontWeight: '500',
              }}
            >
              Loading...
            </p>
          </div>
        </div>
      )}

    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      <FilterChips filters={filters} onChange={setFilters} />

      {/* Map fills remaining space */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <MapView filters={filters} reports={reports} />

        {/* Bottom CTA — z-index 1 is above MapView root (z-index 0) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px',
            background: 'linear-gradient(to top, rgba(250,250,248,0.95) 60%, transparent)',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
            zIndex: 1,
          }}
        >
          <Link
            href="/report"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#F77F00',
              color: 'white',
              borderRadius: '14px',
              padding: '16px',
              fontWeight: '800',
              fontSize: '16px',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(247,127,0,0.4)',
              letterSpacing: '-0.2px',
            }}
          >
            <span style={{ fontSize: '20px' }}>+</span>
            Report an Issue
          </Link>

          <Link
            href="/leaderboard"
            style={{
              width: '54px',
              height: '54px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1C1C1C',
              color: 'white',
              borderRadius: '14px',
              textDecoration: 'none',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '20px' }}>📊</span>
            <span style={{ fontSize: '9px', fontWeight: '700', opacity: 0.7, marginTop: '1px' }}>
              {reports.length}
            </span>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
