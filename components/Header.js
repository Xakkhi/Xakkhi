'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [socialOpen, setSocialOpen] = useState(false);

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
        <span
          style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: '800',
            fontFamily: 'Fraunces, serif',
            letterSpacing: '-0.5px',
          }}
        >
          Xakkhi
        </span>
        <span
          style={{
            color: '#F77F00',
            fontSize: '18px',
            fontWeight: '700',
            fontFamily: 'Noto Sans Bengali, sans-serif',
            marginLeft: '4px',
          }}
        >
          সাক্ষী
        </span>
      </Link>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Social media dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSocialOpen(!socialOpen)}
            style={{
              color: 'rgba(255,255,255,0.7)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '18px',
              lineHeight: 1,
            }}
            aria-label="Social media links"
          >
            @
          </button>
          {socialOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '36px',
                background: 'white',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                minWidth: '160px',
                zIndex: 200,
              }}
            >
              {[
                { label: '📸 Instagram', href: 'https://instagram.com/xakkhi' },
                { label: '𝕏 Twitter / X', href: 'https://twitter.com/xakkhi' },
                { label: '✈️ Telegram', href: 'https://t.me/xakkhi' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#1C1C1C',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                  onClick={() => setSocialOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Menu / more */}
        <button
          style={{
            color: 'rgba(255,255,255,0.7)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '20px',
            lineHeight: 1,
          }}
          aria-label="Menu"
        >
          ⋯
        </button>
      </div>

      {/* Close social dropdown on outside click */}
      {socialOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
          }}
          onClick={() => setSocialOpen(false)}
        />
      )}
    </header>
  );
}
