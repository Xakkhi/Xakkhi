'use client';

import { useEffect, useRef, useState } from 'react';
import { WARDS, CITY_CENTER } from '../data/wards';
import { CATEGORIES } from '../data/categories';

const MAPPLS_KEY = process.env.NEXT_PUBLIC_MAPPLS_KEY;

// ─── SDK loader ────────────────────────────────────────────────────────────────
// Singleton promise — safe across React StrictMode double-invocations.
let _sdkPromise = null;

function loadMapplsSDK() {
  if (_sdkPromise) return _sdkPromise;
  _sdkPromise = new Promise((resolve, reject) => {
    // Already loaded by a previous mount
    if (window.mappls) { resolve(); return; }

    // Expose callback that the SDK script calls when ready
    window.__mapplsSDKReady = () => resolve();

    const script = document.createElement('script');
    script.src = `https://apis.mappls.com/advancedmaps/api/${MAPPLS_KEY}/map_sdk?layer=vector&v=3.0&callback=__mapplsSDKReady`;
    script.async = true;
    script.onerror = (err) => {
      _sdkPromise = null; // allow retry on next mount
      reject(new Error('Mappls SDK failed to load. Check NEXT_PUBLIC_MAPPLS_KEY.'));
    };
    document.head.appendChild(script);
  });
  return _sdkPromise;
}

// ─── Icon helpers ──────────────────────────────────────────────────────────────
// Build SVG data-URI icons so we don't depend on HTML-marker support.

function wardSVG(wardNumber, hasReports) {
  const fill = hasReports ? '#F77F00' : '#1C1C1C';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">` +
    `<circle cx="14" cy="14" r="12" fill="${fill}" stroke="white" stroke-width="2"/>` +
    `<text x="14" y="14" text-anchor="middle" dominant-baseline="central" ` +
    `fill="white" font-size="10" font-weight="700" font-family="DM Sans,sans-serif">${wardNumber}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function dotSVG(color, size) {
  const r = Math.max(size / 2 - 2, 2);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${color}" stroke="white" stroke-width="2"/>` +
    `</svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MapView({ filters, reports = [] }) {
  const mapRef        = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef    = useRef([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [mapReady, setMapReady]         = useState(false);

  // Init map once
  useEffect(() => {
    if (mapInstanceRef.current) return;
    let cancelled = false;

    async function initMap() {
      try {
        await loadMapplsSDK();
        if (cancelled || mapInstanceRef.current) return;

        const map = new window.mappls.Map(mapRef.current, {
          center: CITY_CENTER,  // [lat, lng]
          zoom: 14,
          zoomControl: false,   // we don't add a custom zoom control; Mappls shows one by default; set true if desired
        });

        // ── Wait for the map's own tiles + style to be fully ready ────────────
        function onReady() {
          if (cancelled) return;

          // ── Ward markers ─────────────────────────────────────────────────────
          WARDS.forEach((ward) => {
            const hasReports = reports.some((r) => r.ward_number === ward.wardNumber);

            const marker = new window.mappls.Marker({
              map,
              position: { lat: ward.lat, lng: ward.lng },
              icon: wardSVG(ward.wardNumber, hasReports),
            });

            window.mappls.addListener(marker, 'click', () => {
              setSelectedWard(ward);
              map.setCenter({ lat: ward.lat, lng: ward.lng });
            });

            markersRef.current.push(marker);
          });

          // ── Report markers ───────────────────────────────────────────────────
          reports.forEach((report) => {
            const cat = CATEGORIES[report.category];
            if (!cat || !report.lat || !report.lng) return;
            const sizeMap = { minor: 10, moderate: 14, severe: 18, critical: 22 };
            const size = sizeMap[report.severity] || 14;

            new window.mappls.Marker({
              map,
              position: { lat: report.lat, lng: report.lng },
              icon: dotSVG(cat.color, size),
            });
          });

          mapInstanceRef.current = map;
          if (!cancelled) setMapReady(true);
        }

        // Mappls v3 (MapLibre-based) fires 'load' when the style is ready.
        // Guard against the rare case where it fired before we attached the listener.
        if (typeof map.loaded === 'function' && map.loaded()) {
          onReady();
        } else {
          map.on('load', onReady);
        }

      } catch (err) {
        console.error('[MapView] Mappls init failed:', err);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (_) { /* ignore */ }
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  // ── Locate me ────────────────────────────────────────────────────────────────
  function handleLocate() {
    if (!mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstanceRef.current.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapInstanceRef.current.setZoom(16);
      },
      () => alert('Location access denied. Please enable location in your browser.')
    );
  }

  const activeCount = reports.filter((r) => r.status === 'unresolved').length;
  const totalCount  = reports.length;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Stats overlay — top left */}
      {mapReady && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(28,28,28,0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            padding: '8px 14px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#DC2626', fontSize: '18px', fontWeight: '800', lineHeight: 1 }}>
              {activeCount}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '500', marginTop: '1px' }}>
              Active
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '800', lineHeight: 1 }}>
              {totalCount}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '500', marginTop: '1px' }}>
              Total
            </div>
          </div>
        </div>
      )}

      {/* Locate me button */}
      {mapReady && (
        <button
          onClick={handleLocate}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '12px',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'white',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            zIndex: 10,
          }}
          aria-label="Locate me"
        >
          📍
        </button>
      )}

      {/* Ward info card */}
      {selectedWard && (
        <WardCard ward={selectedWard} onClose={() => setSelectedWard(null)} reports={reports} />
      )}
    </div>
  );
}

// ─── Ward card ─────────────────────────────────────────────────────────────────

function WardCard({ ward, onClose, reports }) {
  const wardReports = reports.filter((r) => r.ward_number === ward.wardNumber);
  const isVacant    = ward.commissionerPosition === 'Vacant';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '12px',
        right: '12px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      {/* Ward header */}
      <div
        style={{
          background: '#1C1C1C',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#FFE4CC',
                color: '#F77F00',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '20px',
              }}
            >
              Ward {ward.wardNumber}
            </span>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
              {ward.areaName}
            </span>
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '12px',
              marginTop: '2px',
              fontFamily: 'Noto Sans Bengali, sans-serif',
            }}
          >
            {ward.areaNameLocal}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'rgba(28,28,28,0.5)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
            WARD COMMISSIONER
          </div>
          {isVacant ? (
            <div style={{ color: '#DC2626', fontWeight: '700', fontSize: '14px' }}>Vacant</div>
          ) : (
            <>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#1C1C1C' }}>
                {ward.commissionerName}
              </div>
              <div style={{ color: 'rgba(28,28,28,0.5)', fontSize: '12px' }}>
                {ward.commissionerPosition}
              </div>
              {ward.commissionerPhone && (
                <a
                  href={`tel:${ward.commissionerPhone}`}
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    padding: '4px 12px',
                    background: '#F77F00',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textDecoration: 'none',
                  }}
                >
                  📞 Call
                </a>
              )}
            </>
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            background: wardReports.length > 0 ? '#FFF0F0' : '#F5F5F5',
            borderRadius: '12px',
            padding: '10px 16px',
            minWidth: '80px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: wardReports.length > 0 ? '#DC2626' : 'rgba(28,28,28,0.3)',
              lineHeight: 1,
            }}
          >
            {wardReports.length}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(28,28,28,0.5)', marginTop: '2px' }}>
            Reports
          </div>
        </div>
      </div>
    </div>
  );
}
