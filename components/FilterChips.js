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

  const chipStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '20px',
    border: `1.5px solid ${active ? '#F77F00' : 'rgba(28,28,28,0.2)'}`,
    background: active ? '#FFF3E0' : 'white',
    color: active ? '#F77F00' : '#1C1C1C',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
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
      <div
        className="flex items-center gap-2 px-3"
        style={{ height: '48px', overflowX: 'auto', scrollbarWidth: 'none' }}
      >
        {/* Category chip */}
        <div style={{ position: 'relative' }}>
          <button
            style={chipStyle(!!filters.category)}
            onClick={() => toggleDropdown('category')}
          >
            {filters.category
              ? `${CATEGORY_LIST.find((c) => c.id === filters.category)?.emoji} ${CATEGORY_LIST.find((c) => c.id === filters.category)?.label}`
              : 'All Categories'}
            <span style={{ fontSize: '10px' }}>▾</span>
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
        <div style={{ position: 'relative' }}>
          <button
            style={chipStyle(!!filters.severity)}
            onClick={() => toggleDropdown('severity')}
          >
            {filters.severity ? `${filters.severity.charAt(0).toUpperCase()}${filters.severity.slice(1)}` : 'All Severity'}
            <span style={{ fontSize: '10px' }}>▾</span>
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
        <div style={{ position: 'relative' }}>
          <button
            style={chipStyle(!!filters.status)}
            onClick={() => toggleDropdown('status')}
          >
            {filters.status ? `${filters.status.charAt(0).toUpperCase()}${filters.status.slice(1)}` : 'All Status'}
            <span style={{ fontSize: '10px' }}>▾</span>
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

        {/* Map / List toggle */}
        <div
          className="flex items-center"
          style={{
            marginLeft: 'auto',
            borderRadius: '20px',
            border: '1.5px solid rgba(28,28,28,0.2)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Link
            href="/"
            style={{
              padding: '5px 14px',
              fontSize: '13px',
              fontWeight: '600',
              background: isMapView ? '#1C1C1C' : 'white',
              color: isMapView ? 'white' : '#1C1C1C',
              textDecoration: 'none',
            }}
          >
            Map
          </Link>
          <Link
            href="/list"
            style={{
              padding: '5px 14px',
              fontSize: '13px',
              fontWeight: '600',
              background: !isMapView ? '#1C1C1C' : 'white',
              color: !isMapView ? 'white' : '#1C1C1C',
              textDecoration: 'none',
            }}
          >
            List
          </Link>
        </div>
      </div>

      {/* Close on outside click */}
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
        top: '40px',
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
