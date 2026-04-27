'use client';

import { useEffect, useState } from 'react';

export default function QRCodeModal() {
  const [url, setUrl] = useState('https://xakkhi.in/report');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200&margin=10&color=1C1C1C&bgcolor=FAFAF8`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28,28,28,0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#FAFAF8',
          borderRadius: '20px',
          padding: '32px 28px',
          maxWidth: '340px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: '800',
            fontFamily: 'Fraunces, serif',
            color: '#1C1C1C',
            marginBottom: '4px',
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
            color: 'rgba(28,28,28,0.5)',
            fontSize: '13px',
            marginBottom: '24px',
            marginTop: '4px',
          }}
        >
          Dibrugarh's Civic Eye
        </p>

        {/* QR Code */}
        <div
          style={{
            background: '#FAFAF8',
            border: '2px solid rgba(28,28,28,0.1)',
            borderRadius: '14px',
            padding: '12px',
            display: 'inline-block',
            marginBottom: '20px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt="QR code to report on phone"
            width={180}
            height={180}
            style={{ display: 'block', borderRadius: '6px' }}
          />
        </div>

        <div
          style={{
            background: '#1C1C1C',
            color: 'white',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>
            📱 Use your phone to report
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Scan the QR code with your phone camera. Reports require a live
            photo and GPS — only possible from a phone.
          </p>
        </div>

        {/* Steps */}
        <div style={{ textAlign: 'left' }}>
          {[
            '📷 Open your phone camera',
            '🔳 Point at the QR code above',
            '🔗 Tap the link that appears',
            '📍 Allow location + camera',
          ].map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                fontSize: '13px',
                color: '#1C1C1C',
              }}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#F77F00',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>

        {/* URL hint */}
        <div
          style={{
            marginTop: '16px',
            padding: '8px 12px',
            background: 'rgba(247,127,0,0.08)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#F77F00',
            fontWeight: '600',
            wordBreak: 'break-all',
          }}
        >
          {url}
        </div>
      </div>
    </div>
  );
}
