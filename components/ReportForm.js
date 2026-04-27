'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_LIST } from '../data/categories';
import { isWithinDibrugarh, detectWard, compressPhoto, isLivePhoto } from '../lib/ward-detector';
import LocationHelp from './LocationHelp';
import QRCodeModal from './QRCodeModal';

const SEVERITY_COLORS = {
  minor: '#D97706',
  moderate: '#F77F00',
  severe: '#DC2626',
  critical: '#1C1C1C',
};

export default function ReportForm() {
  const router = useRouter();
  const photoInputRef = useRef(null);

  // Anti-fraud guards
  const [isDesktop, setIsDesktop] = useState(false);
  const [locationStatus, setLocationStatus] = useState('detecting'); // detecting | found | denied | out-of-bounds
  const [location, setLocation] = useState(null); // { lat, lng, ward }

  // Form fields
  const [photo, setPhoto] = useState(null); // compressed Blob
  const [photoPreview, setPhotoPreview] = useState(null); // object URL
  const [photoError, setPhotoError] = useState(null);
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [landmark, setLandmark] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Desktop detection + GPS on mount
  useEffect(() => {
    const noTouch = !('ontouchstart' in window) && navigator.maxTouchPoints === 0;
    if (noTouch) {
      setIsDesktop(true);
      return;
    }
    requestGPS();
  }, []);

  // Cleanup photo preview URL on unmount
  useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview); };
  }, [photoPreview]);

  function requestGPS() {
    setLocationStatus('detecting');
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (!isWithinDibrugarh(lat, lng)) {
          setLocationStatus('out-of-bounds');
          return;
        }
        const ward = detectWard(lat, lng);
        setLocation({ lat, lng, ward });
        setLocationStatus('found');
      },
      () => setLocationStatus('denied'),
      { timeout: 12000, maximumAge: 0, enableHighAccuracy: true }
    );
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    if (!isLivePhoto(file)) {
      setPhotoError('This looks like an older photo. Please take a fresh photo now.');
    }

    const compressed = await compressPhoto(file, 500);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  }

  function handleCategorySelect(id) {
    if (category === id) return;
    setCategory(id);
    setSubCategory(null);
    setSeverity(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    // Day 4: Supabase insert goes here
    // For now, simulate a brief network delay and redirect to success
    await new Promise((r) => setTimeout(r, 800));
    router.push('/report-success');
  }

  const cat = category ? CATEGORIES[category] : null;
  const canSubmit = !!photo && !!category && !!severity && locationStatus === 'found' && !submitting;

  // ─── Desktop gate ───────────────────────────────────────────────────────────
  if (isDesktop) return <QRCodeModal />;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#FAFAF8',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Page sub-header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px 12px',
          background: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#F5F5F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontSize: '18px',
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <div>
          <div style={{ fontWeight: '800', fontSize: '17px', color: '#1C1C1C', lineHeight: 1.2 }}>
            Report an Issue
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.5)', marginTop: '1px' }}>
            Anonymous · Dibrugarh only
          </div>
        </div>
      </div>

      <div style={{ padding: '0 0 100px' }}>
        {/* ── Location status bar ─────────────────────────────────────────── */}
        <LocationBar
          status={locationStatus}
          location={location}
          onRetry={requestGPS}
        />

        {/* ── STEP 1 · Photo ──────────────────────────────────────────────── */}
        <Section step={1} title="Take a Photo" required>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />

          {!photoPreview ? (
            <button
              onClick={() => photoInputRef.current?.click()}
              style={{
                width: '100%',
                aspectRatio: '4/3',
                border: '2.5px dashed rgba(28,28,28,0.2)',
                borderRadius: '14px',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '44px', lineHeight: 1 }}>📷</span>
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#1C1C1C' }}>
                Tap to take photo
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)', textAlign: 'center', lineHeight: 1.4 }}>
                Rear camera · Live capture only<br />No gallery uploads allowed
              </div>
            </button>
          ) : (
            <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Captured issue"
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(28,28,28,0.75)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                }}
              >
                📷 Retake
              </button>
            </div>
          )}

          {photoError && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: '#FFF0F0',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#DC2626',
              }}
            >
              ⚠️ {photoError}
            </div>
          )}
        </Section>

        {/* ── STEP 2 · Category ───────────────────────────────────────────── */}
        <Section step={2} title="Issue Type" required>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            {CATEGORY_LIST.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCategorySelect(c.id)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: '12px',
                    border: `2px solid ${active ? c.color : 'rgba(28,28,28,0.12)'}`,
                    background: active ? `${c.color}15` : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    gridColumn: CATEGORY_LIST.indexOf(c) === 4 ? '1 / -1' : 'auto',
                  }}
                >
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{c.emoji}</span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: active ? c.color : '#1C1C1C',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── STEP 3 · Sub-category (conditional) ─────────────────────────── */}
        {cat && (
          <Section step={3} title="Specific Issue">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {cat.subTypes.map((sub) => {
                const active = subCategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSubCategory(active ? null : sub)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      border: `1.5px solid ${active ? cat.color : 'rgba(28,28,28,0.15)'}`,
                      background: active ? `${cat.color}18` : 'white',
                      color: active ? cat.color : '#1C1C1C',
                      fontSize: '13px',
                      fontWeight: active ? '700' : '500',
                      cursor: 'pointer',
                    }}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── STEP 4 · Severity ───────────────────────────────────────────── */}
        {cat && (
          <Section step={4} title="How Bad Is It?" required>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(cat.severities).map(([level, desc]) => {
                const active = severity === level;
                const color = SEVERITY_COLORS[level];
                return (
                  <button
                    key={level}
                    onClick={() => setSeverity(active ? null : level)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: `2px solid ${active ? color : 'rgba(28,28,28,0.1)'}`,
                      background: active ? `${color}12` : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                        marginTop: '4px',
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: '700',
                          fontSize: '14px',
                          color: active ? color : '#1C1C1C',
                          marginBottom: '2px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {level}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.55)', lineHeight: 1.4 }}>
                        {desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── STEP 5 · Landmark ───────────────────────────────────────────── */}
        <Section step={cat ? 5 : 3} title="Landmark / Address" hint="Optional">
          <textarea
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. near Fun World, opposite DMC office, behind railway station…"
            maxLength={200}
            rows={2}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1.5px solid rgba(28,28,28,0.15)',
              background: 'white',
              fontSize: '14px',
              color: '#1C1C1C',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '11px', color: 'rgba(28,28,28,0.35)', marginTop: '4px' }}>
            {landmark.length}/200
          </div>
        </Section>

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '8px 16px 16px' }}>
          {/* Checklist */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '12px',
              border: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            {[
              { label: 'Photo taken', done: !!photo },
              { label: 'Issue type selected', done: !!category },
              { label: 'Severity chosen', done: !!severity },
              { label: 'GPS location found', done: locationStatus === 'found' },
            ].map(({ label, done }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 0',
                  fontSize: '13px',
                  color: done ? '#16A34A' : 'rgba(28,28,28,0.45)',
                }}
              >
                <span style={{ fontSize: '14px' }}>{done ? '✓' : '○'}</span>
                {label}
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '17px',
              borderRadius: '14px',
              border: 'none',
              background: canSubmit ? '#F77F00' : 'rgba(28,28,28,0.1)',
              color: canSubmit ? 'white' : 'rgba(28,28,28,0.3)',
              fontSize: '17px',
              fontWeight: '800',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s, color 0.2s',
              boxShadow: canSubmit ? '0 4px 16px rgba(247,127,0,0.35)' : 'none',
            }}
          >
            {submitting ? 'Submitting…' : '→ Submit Report'}
          </button>

          <div
            style={{
              textAlign: 'center',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#16A34A',
              fontWeight: '600',
            }}
          >
            <span>🔒</span> Anonymous · No personal data stored
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function LocationBar({ status, location, onRetry }) {
  if (status === 'detecting') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <span style={{ fontSize: '16px', animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⏳</span>
        <div>
          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1C1C1C' }}>Detecting your location…</div>
          <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.45)' }}>GPS required to file a report</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'found') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: '#F0FDF4',
          borderBottom: '1px solid rgba(22,163,74,0.15)',
        }}
      >
        <span style={{ fontSize: '18px' }}>📍</span>
        <div>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#16A34A' }}>
            Ward {location.ward.wardNumber} · {location.ward.areaName}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(22,163,74,0.7)' }}>
            GPS verified · {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '16px' }}>✓</span>
      </div>
    );
  }

  if (status === 'out-of-bounds') {
    return (
      <div style={{ padding: '12px 16px', background: '#FFF8F8', borderBottom: '1px solid rgba(220,38,38,0.15)' }}>
        <div style={{ fontWeight: '700', fontSize: '13px', color: '#DC2626', marginBottom: '4px' }}>
          📍 Location outside Dibrugarh
        </div>
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'rgba(28,28,28,0.6)', lineHeight: 1.4 }}>
          Xakkhi only accepts reports within Dibrugarh city limits. Please move
          to Dibrugarh and try again.
        </p>
        <button
          onClick={onRetry}
          style={{
            padding: '7px 16px',
            background: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Retry GPS
        </button>
      </div>
    );
  }

  // denied
  return (
    <div style={{ padding: '12px 16px 16px', background: '#FFF8F8', borderBottom: '1px solid rgba(220,38,38,0.1)' }}>
      <LocationHelp onRetry={onRetry} />
    </div>
  );
}

function Section({ step, title, hint, required, children }) {
  return (
    <div
      style={{
        padding: '20px 16px 4px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        marginBottom: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            background: '#1C1C1C',
            color: 'white',
            fontSize: '10px',
            fontWeight: '700',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {step}
        </span>
        <span style={{ fontWeight: '800', fontSize: '16px', color: '#1C1C1C' }}>{title}</span>
        {required && (
          <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: '600' }}>required</span>
        )}
        {hint && (
          <span style={{ color: 'rgba(28,28,28,0.4)', fontSize: '12px' }}>{hint}</span>
        )}
      </div>
      {children}
      <div style={{ height: '16px' }} />
    </div>
  );
}
