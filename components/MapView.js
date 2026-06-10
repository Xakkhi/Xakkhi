'use client';

import { useEffect, useRef, useState } from 'react';
import { WARDS, CITY_CENTER } from '../data/wards';
import { CATEGORIES } from '../data/categories';
import { WARD_BOUNDARIES } from '../data/wardBoundaries';

// ─── SDK loader ────────────────────────────────────────────────────────────────
let _sdkPromise = null;

function loadGoogleMapsSDK() {
  if (_sdkPromise) return _sdkPromise;
  _sdkPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return; }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    console.log('Maps key length:', apiKey?.length);
    console.log('Maps key start:', apiKey?.substring(0, 4));

    if (!apiKey) {
      _sdkPromise = null;
      reject(new Error('[MapView] NEXT_PUBLIC_GOOGLE_MAPS_KEY is not set.'));
      return;
    }

    window.__googleMapsReady = resolve;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__googleMapsReady&loading=async`;
    script.async = true;
    script.onerror = () => {
      _sdkPromise = null;
      reject(new Error('[MapView] Google Maps script failed to load — check NEXT_PUBLIC_GOOGLE_MAPS_KEY.'));
    };
    document.head.appendChild(script);
  });
  return _sdkPromise;
}

// ─── Icon helpers ──────────────────────────────────────────────────────────────

function dotSVG(color, size) {
  const r = Math.max(size / 2 - 2, 2);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${color}" stroke="white" stroke-width="2"/>` +
    `</svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// ─── Map styles (clean, minimal — matches NammaKasa aesthetic) ─────────────────

const MAP_STYLES = [
  // Hide all POIs (businesses, attractions, government icons)
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  // Show parks/green areas but muted
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#e8f0e4' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  // Hide transit (bus stops, train stations)
  { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
  // Mute road colors
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  // Keep road labels visible
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7a7a7a' }] },
  // Highway slightly darker
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#d0d0d0' }] },
  // Mute land/background
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f2ed' }] },
  // Water — soft blue
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d4e6f1' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7fa8c9' }] },
  // Admin boundaries (ward/city) — subtle
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c0c0c0' }, { weight: 1 }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
  // Locality/neighborhood labels — darker for readability
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  // Hide building footprints
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MapView({ filters, reports = [] }) {
  const mapRef             = useRef(null);
  const mapInstanceRef     = useRef(null);
  const reportMarkersRef   = useRef([]);
  const wardPolygonsRef    = useRef([]);
  const highlightPolyRef   = useRef(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [mapReady, setMapReady]         = useState(false);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    let cancelled = false;

    async function initMap() {
      try {
        await loadGoogleMapsSDK();
        if (cancelled || mapInstanceRef.current) return;

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: CITY_CENTER[0], lng: CITY_CENTER[1] },
          zoom: 15,
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          styles: MAP_STYLES,
        });

        mapInstanceRef.current = map;
        if (!cancelled) setMapReady(true);

      } catch (err) {
        console.error('[MapView] Google Maps init failed:', err);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        reportMarkersRef.current.forEach((m) => m.setMap(null));
        wardPolygonsRef.current.forEach((p) => p.setMap(null));
        if (highlightPolyRef.current) highlightPolyRef.current.setMap(null);
        mapInstanceRef.current = null;
      }
      reportMarkersRef.current = [];
    };
  }, []);

  // Re-draw report markers whenever reports data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old report markers
    reportMarkersRef.current.forEach((m) => m.setMap(null));
    reportMarkersRef.current = [];

    // Clear old ward polygons
    wardPolygonsRef.current.forEach((p) => p.setMap(null));
    wardPolygonsRef.current = [];

    // Count unresolved reports per ward for heat overlay
    const unresolvedByWard = {};
    reports.forEach((r) => {
      if (r.status !== 'resolved' && r.ward_number) {
        unresolvedByWard[r.ward_number] = (unresolvedByWard[r.ward_number] || 0) + 1;
      }
    });

    const maxCount = Math.max(1, ...Object.values(unresolvedByWard));

    // Draw ward boundary polygons with heat coloring
    Object.entries(WARD_BOUNDARIES).forEach(([wardNum, coords]) => {
      const count = unresolvedByWard[Number(wardNum)] || 0;
      const intensity = count / maxCount;

      // cream → pink → red gradient based on report density
      const r = 220 + Math.round(35 * intensity);
      const g = Math.round(200 * (1 - intensity));
      const b = Math.round(180 * (1 - intensity));
      const fillColor = count > 0 ? `rgb(${r},${g},${b})` : '#f5f2ed';
      const fillOpacity = count > 0 ? 0.08 + 0.17 * intensity : 0.03;

      const poly = new window.google.maps.Polygon({
        paths: coords.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: fillColor,
        strokeOpacity: fillOpacity + 0.05,
        strokeWeight: 1,
        fillColor,
        fillOpacity,
        map,
        zIndex: 1,
      });

      poly.addListener('click', () => {
        const ward = WARDS.find((w) => w.wardNumber === Number(wardNum));
        if (ward) {
          setSelectedWard(ward);
          // Highlight this ward boundary
          if (highlightPolyRef.current) highlightPolyRef.current.setMap(null);
          highlightPolyRef.current = new window.google.maps.Polygon({
            paths: coords.map(([lat, lng]) => ({ lat, lng })),
            strokeColor: '#DC2626',
            strokeOpacity: 0.9,
            strokeWeight: 3,
            fillColor: '#DC2626',
            fillOpacity: 0.08,
            map,
            zIndex: 5,
          });
        }
      });

      wardPolygonsRef.current.push(poly);
    });

    // Add report dot markers with severity-based colors
    const sevColors = { minor: '#D97706', moderate: '#F77F00', severe: '#DC2626', critical: '#7F1D1D' };
    reports.forEach((report) => {
      if (!report.lat || !report.lng) return;
      const sizeMap = { minor: 10, moderate: 14, severe: 18, critical: 22 };
      const size = sizeMap[report.severity] || 14;
      const color = report.status === 'resolved' ? '#16A34A' : (sevColors[report.severity] || '#F77F00');

      const marker = new window.google.maps.Marker({
        map,
        position: { lat: report.lat, lng: report.lng },
        icon: {
          url: dotSVG(color, size),
          scaledSize: new window.google.maps.Size(size, size),
        },
        zIndex: report.severity === 'critical' ? 10 : report.severity === 'severe' ? 8 : 5,
      });
      reportMarkersRef.current.push(marker);
    });
  }, [reports, mapReady]);

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
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

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

      {selectedWard && (
        <WardCard ward={selectedWard} onClose={() => { setSelectedWard(null); if (highlightPolyRef.current) { highlightPolyRef.current.setMap(null); highlightPolyRef.current = null; } }} reports={reports} />
      )}
    </div>
  );
}

function WardCard({ ward, onClose, reports }) {
  const wardReports = reports.filter((r) => r.ward_number === ward.wardNumber);
  const unresolvedCount = wardReports.filter((r) => r.status !== 'resolved').length;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '12px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        zIndex: 20,
        padding: '10px 14px',
        maxWidth: '200px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{
          background: '#FFE4CC', color: '#F77F00', fontSize: '10px', fontWeight: '700',
          padding: '1px 6px', borderRadius: '10px',
        }}>
          {ward.wardNumber}
        </span>
        <span style={{ fontWeight: '700', fontSize: '13px', color: '#1C1C1C' }}>
          {ward.areaName}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.5)', marginBottom: '6px', fontFamily: 'Noto Sans Bengali, sans-serif' }}>
        {ward.areaNameLocal}
      </div>
      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontWeight: '600' }}>
        <span style={{ color: '#DC2626' }}>{unresolvedCount} active</span>
        <span style={{ color: 'rgba(28,28,28,0.35)' }}>{wardReports.length} total</span>
      </div>
      {ward.commissionerName && (
        <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.5)', marginTop: '4px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '4px' }}>
          {ward.commissionerName}
        </div>
      )}
    </div>
  );
}
