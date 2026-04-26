'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORY_LIST } from '../data/categories';

const SEVERITIES = ['Minor', 'Moderate', 'Severe', 'Critical'];
const STATUSES = ['Unresolved', 'Resolved'];

export default function FilterChips({ filters, onChange }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();
  const isMapView = pathname === '/';

  function toggleDropdown(name) {
    setOpenDropdown(openDropdown === name ? null : name);
  }

  function selectFilter(key, value) {
    onChange({ ...filters, [key]: value });
    setOpenDropdown(null);
  }

  // Short labels for inactive/active states
  function categoryLabel() {
    if (!filters.category) return 'Category';
    const cat = CATEGORY_LIST.find((c) => c.id === filters.category);
    return cat ? `${cat.emoji} ${cat.label.split('/')[0].trim()}` : 'Category';
  }

  function severityLabel() {
    if (!filters.severity) return 'Severity';
    return filters.severity.charAt(0).toUpperCase() + filters.severity.slice(1);
  }

  function statusLabel() {
    if (!filters.status) return 'Status';
    return filters.status.charAt(0).toUpperCase() + filters.status.slice(1);
  }

  const chipBtn = (active) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    padding: '7px 6px',
    borderRadius: '20px',
    border: `1.5px solid ${active ? '#F77F00' : 'rgba(28,28,28,0.18)'}`,
    background: active ? '#FFF3E0' : 'white',
    color: active ? '#F77F00' : '#1C1C1C',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  });

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Single row — no scroll, all 4 items always visible */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 8px',
          height: '48px',
        }}
      >
        {/* Category chip */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <button style={chipBtn(!!filters.category)} onClick={() => toggleDropdown('category')}>
            {categoryLabel()}
            <span style={{ fontSize: '9px', flexShrink: 0 }}>▾</span>
          </button>
          {openDropdown === 'category' && (
            <Dropdown
              items={[
                { value: null, label: 'All Categories' },
                ...CATEGORY_LIST.map((c) => ({ value: c.id, label: `${c.emoji} ${c.label}` })),
              ]}
              onSelect={(v) => selectFilter('category', v)}
              selected={filters.category}
            />
          )}
        </div>

        {/* Severity chip */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <button style={chipBtn(!!filters.severity)} onClick={() => toggleDropdown('severity')}>
            {severityLabel()}
            <span style={{ fontSize: '9px', flexShrink: 0 }}>▾</span>
          </button>
          {openDropdown === 'severity' && (
            <Dropdown
              items={[
                { value: null, label: 'All Severity' },
                ...SEVERITIES.map((s) => ({ value: s.toLowerCase(), label: s })),
              ]}
              onSelect={(v) => selectFilter('severity', v)}
              selected={filters.severity}
            />
          )}
        </div>

        {/* Status chip */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <button style={chipBtn(!!filters.status)} onClick={() => toggleDropdown('status')}>
            {statusLabel()}
            <span style={{ fontSize: '9px', flexShrink: 0 }}>▾</span>
          </button>
          {openDropdown === 'status' && (
            <Dropdown
              items={[
                { value: null, label: 'All Status' },
                ...STATUSES.map((s) => ({ value: s.toLowerCase(), label: s })),
              ]}
              onSelect={(v) => selectFilter('status', v)}
              selected={filters.status}
            />
          )}
        </div>

        {/* Map / List toggle — fixed width, never pushed off screen */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '20px',
            border: '1.5px solid rgba(28,28,28,0.18)',
            overflow: 'hidden',
          }}
        >
          <Link
            href="/"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              background: isMapView ? '#1C1C1C' : 'white',
              color: isMapView ? 'white' : '#1C1C1C',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Map
          </Link>
          <Link
            href="/list"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              background: !isMapView ? '#1C1C1C' : 'white',
              color: !isMapView ? 'white' : '#1C1C1C',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            List
          </Link>
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {openDropdown && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}

function Dropdown({ items, onSelect, selected }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '44px',
        left: 0,
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        minWidth: '180px',
        zIndex: 60,
      }}
    >
      {items.map((item) => (
        <button
          key={String(item.value)}
          onClick={() => onSelect(item.value)}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '11px 16px',
            fontSize: '14px',
            fontWeight: item.value === selected ? '700' : '500',
            color: item.value === selected ? '#F77F00' : '#1C1C1C',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid #f5f5f5',
            cursor: 'pointer',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
