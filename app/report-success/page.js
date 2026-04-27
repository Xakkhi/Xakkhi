'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ReportSuccessPage() {
  const [reportId] = useState(() => {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    return `XK-${year}-${num}`;
  });

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#FAFAF8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      {/* Success icon */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#F0FDF4',
          border: '3px solid #16A34A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          marginBottom: '20px',
        }}
      >
        ✓
      </div>

      <h1
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '26px',
          fontWeight: '800',
          color: '#1C1C1C',
          margin: '0 0 8px',
          letterSpacing: '-0.5px',
        }}
      >
        Report Filed!
      </h1>

      <p style={{ color: 'rgba(28,28,28,0.55)', fontSize: '15px', margin: '0 0 24px', lineHeight: 1.5 }}>
        Your civic report has been submitted anonymously. The ward commissioner
        and DMC have been notified.
      </p>

      {/* Report ID */}
      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid rgba(0,0,0,0.08)',
          marginBottom: '24px',
          width: '100%',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(28,28,28,0.45)', marginBottom: '4px', letterSpacing: '0.5px' }}>
          REPORT ID
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '22px',
            fontWeight: '800',
            color: '#F77F00',
            letterSpacing: '1px',
          }}
        >
          {reportId}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.4)', marginTop: '4px' }}>
          Save this to track your report
        </div>
      </div>

      {/* What happens next */}
      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid rgba(0,0,0,0.08)',
          marginBottom: '28px',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <div style={{ fontWeight: '800', fontSize: '14px', color: '#1C1C1C', marginBottom: '12px' }}>
          What happens next
        </div>
        {[
          { icon: '📋', text: 'Report visible on map immediately' },
          { icon: '👥', text: 'Ward commissioner notified' },
          { icon: '🏛️', text: 'DMC accountability chain activated' },
          { icon: '✅', text: 'Citizens can verify when resolved' },
        ].map(({ icon, text }) => (
          <div
            key={text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 0',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              fontSize: '13px',
              color: '#1C1C1C',
            }}
          >
            <span style={{ fontSize: '18px', width: '24px', flexShrink: 0 }}>{icon}</span>
            {text}
          </div>
        ))}
      </div>

      {/* Privacy badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#16A34A',
          fontWeight: '600',
          marginBottom: '28px',
        }}
      >
        🔒 Your identity was never recorded
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        <Link
          href="/"
          style={{
            display: 'block',
            width: '100%',
            padding: '16px',
            background: '#F77F00',
            color: 'white',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: '800',
            fontSize: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 14px rgba(247,127,0,0.3)',
          }}
        >
          🗺️ Back to Map
        </Link>

        <Link
          href="/report"
          style={{
            display: 'block',
            width: '100%',
            padding: '15px',
            background: 'white',
            color: '#1C1C1C',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '15px',
            textAlign: 'center',
            border: '1.5px solid rgba(28,28,28,0.15)',
          }}
        >
          + Report Another Issue
        </Link>
      </div>
    </div>
  );
}
