'use client';

import { useState } from 'react';

const ANDROID_STEPS = [
  'Tap the lock icon 🔒 in your browser address bar',
  'Tap "Permissions" or "Site settings"',
  'Find "Location" and set it to "Allow"',
  'Refresh this page',
];

const IOS_STEPS = [
  'Open the Settings app on your iPhone',
  'Scroll down and tap "Safari" (or your browser)',
  'Tap "Location" and choose "Ask" or "Allow"',
  'Return to this page and refresh',
];

export default function LocationHelp({ onRetry }) {
  const [open, setOpen] = useState(false);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const steps = isIOS ? IOS_STEPS : ANDROID_STEPS;
  const deviceLabel = isIOS ? 'iPhone / iPad' : 'Android';

  return (
    <div
      style={{
        margin: '0 16px',
        borderRadius: '12px',
        border: '1.5px solid rgba(220,38,38,0.3)',
        overflow: 'hidden',
        background: '#FFF8F8',
      }}
    >
      {/* Error header */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ fontSize: '22px', lineHeight: 1, marginTop: '1px' }}>📍</span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: '700',
                fontSize: '15px',
                color: '#1C1C1C',
                marginBottom: '4px',
              }}
            >
              Location access required
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(28,28,28,0.65)', margin: 0, lineHeight: 1.4 }}>
              Xakkhi needs your live GPS to verify the issue location and
              assign it to the correct ward.
            </p>
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={onRetry}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '11px',
            background: '#F77F00',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>

      {/* Expandable how-to */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(220,38,38,0.06)',
          border: 'none',
          borderTop: '1px solid rgba(220,38,38,0.15)',
          cursor: 'pointer',
          color: '#DC2626',
          fontSize: '13px',
          fontWeight: '600',
        }}
      >
        How to enable on {deviceLabel}
        <span style={{ fontSize: '11px', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {open && (
        <ol
          style={{
            margin: 0,
            padding: '12px 16px 16px 32px',
            background: 'rgba(220,38,38,0.03)',
            borderTop: '1px solid rgba(220,38,38,0.1)',
          }}
        >
          {steps.map((step, i) => (
            <li
              key={i}
              style={{
                fontSize: '13px',
                color: '#1C1C1C',
                lineHeight: 1.5,
                marginBottom: i < steps.length - 1 ? '8px' : 0,
              }}
            >
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
