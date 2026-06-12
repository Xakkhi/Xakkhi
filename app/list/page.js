'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import FilterChips from '../../components/FilterChips';
import { useReports } from '../../components/ReportsProvider';
import { WARDS } from '../../data/wards';
import { CATEGORIES, SEVERITY_COLORS, STATUS_COLORS } from '../../data/categories';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ListPage() {
  const [filters, setFilters] = useState({ category: null, severity: null, status: null });
  const [expandedWard, setExpandedWard] = useState(null);
  const { reports, loading: isLoading } = useReports();

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (r.flag_status === 'approved') return false; // removed from public list
      if (filters.category && r.category !== filters.category) return false;
      if (filters.severity && r.severity !== filters.severity) return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    });
  }, [reports, filters]);

  const wardGroups = useMemo(() => {
    const groups = {};
    filtered.forEach((r) => {
      if (!groups[r.ward_number]) groups[r.ward_number] = [];
      groups[r.ward_number].push(r);
    });
    return Object.entries(groups)
      .map(([wardNum, reps]) => {
        const ward = WARDS.find((w) => w.wardNumber === Number(wardNum));
        return { wardNumber: Number(wardNum), ward, reports: reps };
      })
      .sort((a, b) => b.reports.length - a.reports.length);
  }, [filtered]);

  const totalFiltered = filtered.length;
  const unresolvedCount = filtered.filter((r) => r.status !== 'resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      <FilterChips filters={filters} onChange={setFilters} />

      <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAF8' }}>
        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: '12px', padding: '14px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <StatBadge value={unresolvedCount} label="Unresolved" color="#DC2626" />
          <StatBadge value={totalFiltered - unresolvedCount} label="Resolved" color="#16A34A" />
          <StatBadge
            value={totalFiltered > 0 ? Math.round(((totalFiltered - unresolvedCount) / totalFiltered) * 100) + '%' : '0%'}
            label="Resolution"
            color="rgba(28,28,28,0.5)"
          />
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>
            Loading reports...
          </div>
        ) : wardGroups.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>
            No reports found
          </div>
        ) : (
          wardGroups.map(({ wardNumber, ward, reports: wardReports }) => {
            const isExpanded = expandedWard === wardNumber;
            const unresolvedInWard = wardReports.filter((r) => r.status !== 'resolved').length;

            return (
              <div key={wardNumber} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {/* Ward row header */}
                <button
                  onClick={() => setExpandedWard(isExpanded ? null : wardNumber)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Ward badge */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: unresolvedInWard > 0 ? '#FFF0F0' : '#F0FDF4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800', fontSize: '14px', flexShrink: 0,
                    color: unresolvedInWard > 0 ? '#DC2626' : '#16A34A',
                  }}>
                    {wardNumber}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1C1C1C' }}>
                      {ward?.areaName || `Ward ${wardNumber}`}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)', marginTop: '1px' }}>
                      {ward?.commissionerName || 'Vacant'} · {wardReports.length} reports
                    </div>
                  </div>

                  {/* Report count + progress bar */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: unresolvedInWard > 0 ? '#DC2626' : '#16A34A' }}>
                      {unresolvedInWard}
                    </div>
                    <div style={{
                      width: '48px', height: '4px', borderRadius: '2px',
                      background: 'rgba(0,0,0,0.06)', marginTop: '4px',
                    }}>
                      <div style={{
                        width: `${wardReports.length > 0 ? (unresolvedInWard / wardReports.length) * 100 : 0}%`,
                        height: '100%', borderRadius: '2px',
                        background: unresolvedInWard > 0 ? '#DC2626' : '#16A34A',
                      }} />
                    </div>
                  </div>

                  <span style={{
                    fontSize: '12px', color: 'rgba(28,28,28,0.3)',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}>
                    ▼
                  </span>
                </button>

                {/* Expanded report list */}
                {isExpanded && (
                  <div style={{ background: '#F9F9F7' }}>
                    {wardReports.map((report) => {
                      const cat = CATEGORIES[report.category];
                      const sevColor = SEVERITY_COLORS[report.severity] || '#F77F00';
                      const isResolved = report.status === 'resolved';

                      return (
                        <Link
                          key={report.id}
                          href={`/report/${report.id}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px 12px 64px',
                            borderTop: '1px solid rgba(0,0,0,0.04)',
                            cursor: 'pointer', textDecoration: 'none', color: 'inherit',
                          }}
                        >
                          {/* Category dot */}
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: isResolved ? '#16A34A' : sevColor, flexShrink: 0,
                          }} />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '13px', color: '#1C1C1C', fontWeight: '500',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {cat?.emoji} {report.description || `${cat?.label || report.category} issue`}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.4)', marginTop: '2px' }}>
                              {timeAgo(report.created_at)}
                            </div>
                          </div>

                          {/* Severity / status badge */}
                          <span style={{
                            fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                            borderRadius: '10px', flexShrink: 0,
                            background: isResolved ? '#DCFCE7' : `${sevColor}18`,
                            color: isResolved ? '#16A34A' : sevColor,
                          }}>
                            {isResolved ? 'Resolved' : report.severity?.charAt(0).toUpperCase() + report.severity?.slice(1)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Bottom spacer for CTA */}
        <div style={{ height: '80px' }} />
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px',
        background: 'linear-gradient(to top, rgba(250,250,248,0.95) 60%, transparent)',
        zIndex: 1,
      }}>
        <Link
          href="/report"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#F77F00', color: 'white', borderRadius: '14px',
            padding: '16px', fontWeight: '800', fontSize: '16px',
            textDecoration: 'none', boxShadow: '0 4px 16px rgba(247,127,0,0.4)',
          }}
        >
          <span style={{ fontSize: '20px' }}>+</span>
          Report an Issue
        </Link>
      </div>
    </div>
  );
}

function StatBadge({ value, label, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', marginTop: '3px' }}>{label}</div>
    </div>
  );
}
