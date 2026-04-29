'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { WARDS, CITY_CENTER } from '../data/wards';
import { CATEGORIES } from '../data/categories';

export default function MapView({ filters, reports = [] }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Init map once
  useEffect(() => {
    if (leafletMapRef.current) return;

    let cancelled = false;

    async function initMap() {
      try {
        const L = (await import('leaflet')).default;

        // Guard against StrictMode double-invoke: cleanup may have fired during the await
        if (cancelled || leafletMapRef.current) return;

        const map = L.map(mapRef.current, {
          center: CITY_CENTER,
          zoom: 14,
          zoomControl: false,
          attributionControl: true,
        });

        // Muted OSM tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        // Zoom controls (bottom right)
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Ward markers
        WARDS.forEach((ward) => {
          const wardReports = reports.filter((r) => r.ward_number === ward.wardNumber);
          const hasReports = wardReports.length > 0;

          const icon = L.divIcon({
            className: '',
            html: `<div class="ward-marker${hasReports ? ' has-reports' : ''}">${ward.wardNumber}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([ward.lat, ward.lng], { icon })
            .addTo(map)
            .on('click', () => {
              setSelectedWard(ward);
              map.panTo([ward.lat, ward.lng], { animate: true, duration: 0.4 });
            });

          markersRef.current.push(marker);
        });

        // Report markers (colored by category)
        reports.forEach((report) => {
          const cat = CATEGORIES[report.category];
          if (!cat) return;

          const severitySize = { minor: 10, moderate: 14, severe: 18, critical: 22 };
          const size = severitySize[report.severity] || 14;

          const icon = L.divIcon({
            className: '',
            html: `<div style="
              width:${size}px;height:${size}px;border-radius:50%;
              background:${cat.color};border:2px solid white;
              box-shadow:0 1px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          L.marker([report.lat, report.lng], { icon }).addTo(map);
        });

        leafletMapRef.current = map;

        // Force Leaflet to recalculate container size — catches any edge case
        // where the container was measured before layout was complete
        map.invalidateSize();

        if (!cancelled) setMapReady(true);
      } catch (err) {
        console.error('[MapView] Leaflet init failed:', err);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Locate me button handler
  function handleLocate() {
    if (!leafletMapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        leafletMapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 16, {
          animate: true,
        });
      },
      () => alert('Location access denied. Please enable location in your browser.')
    );
  }

  const activeCount = reports.filter((r) => r.status === 'unresolved').length;
  const totalCount = reports.length;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* Map container — z-index:0 creates a stacking context so Leaflet's
          internal panes (z-index 200–1000) are contained here and cannot
          bleed out to cover our overlay elements. */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0 }} />

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

      {/* Ward info card (floating) */}
      {selectedWard && (
        <WardCard ward={selectedWard} onClose={() => setSelectedWard(null)} reports={reports} />
      )}

    </div>
  );
}

function WardCard({ ward, onClose, reports }) {
  const wardReports = reports.filter((r) => r.ward_number === ward.wardNumber);
  const isVacant = ward.commissionerPosition === 'Vacant';

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
        {/* Commissioner */}
        <div style={{ flex: 1 }}>
          <div style={{ color: 'rgba(28,28,28,0.5)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
            WARD COMMISSIONER
          </div>
          {isVacant ? (
            <div style={{ color: '#DC2626', fontWeight: '700', fontSize: '14px' }}>
              Vacant
            </div>
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

        {/* Report count */}
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
