'use client';

import { useState, useMemo } from 'react';
import { useReports } from '../../components/ReportsProvider';
import { WARDS } from '../../data/wards';
import { CATEGORIES } from '../../data/categories';

// Short category names for the compact "Top 2 issues" card.
const SHORT_CAT = {
  garbage: 'Garbage',
  pothole: 'Potholes',
  drainage: 'Drainage',
  streetlight: 'Lights & wires',
  flooding: 'Flooding',
  riverbank: 'Riverbank',
  // legacy keys from before the taxonomy revamp
  drain: 'Drainage',
  openDrain: 'Drainage',
};

const SORTS = [
  { id: 'reports', label: 'Most reports' },
  { id: 'resolved', label: 'Most resolved' },
  { id: 'least', label: 'Least resolved' },
];

export default function WardHealthPage() {
  const { reports: allReports, loading: isLoading } = useReports();
  const [sortBy, setSortBy] = useState('reports');

  // Exclude admin-removed reports from all public analytics.
  const reports = useMemo(() => allReports.filter((r) => !r.is_removed), [allReports]);

  const cityStats = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const unresolved = total - resolved;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const critical = reports.filter((r) => r.severity === 'critical' && r.status !== 'resolved').length;
    return { total, resolved, unresolved, rate, critical };
  }, [reports]);

  // Top 2 categories by open (unresolved) count.
  const topIssues = useMemo(() => {
    const counts = {};
    reports.filter((r) => r.status !== 'resolved').forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id, count]) => ({ id, count }));
  }, [reports]);

  const wards = useMemo(() => {
    const byWard = {};
    reports.forEach((r) => {
      if (!byWard[r.ward_number]) byWard[r.ward_number] = { total: 0, resolved: 0 };
      byWard[r.ward_number].total++;
      if (r.status === 'resolved') byWard[r.ward_number].resolved++;
    });

    const rows = Object.entries(byWard).map(([num, s]) => {
      const n = Number(num);
      const ward = WARDS.find((w) => w.wardNumber === n);
      const open = s.total - s.resolved;
      const rate = s.total > 0 ? s.resolved / s.total : 0;
      return {
        wardNumber: n,
        areaName: n === 0 ? 'Other areas' : (ward?.areaName || `Ward ${num}`),
        commissionerName: n === 0 ? '—' : (ward?.commissionerName || 'Vacant'),
        total: s.total,
        resolved: s.resolved,
        open,
        rate,
      };
    });

    const sorters = {
      reports: (a, b) => b.open - a.open || b.total - a.total,
      resolved: (a, b) => b.rate - a.rate || b.resolved - a.resolved,
      least: (a, b) => a.rate - b.rate || b.open - a.open,
    };
    return rows.sort(sorters[sortBy]);
  }, [reports, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#FAFAF8' }}>
      {/* Title + total */}
      <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.3px' }}>Ward Health</div>
          <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)', marginTop: '2px' }}>Live ward-by-ward status · Dibrugarh</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '10px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#DC2626', lineHeight: 1 }}>{cityStats.total}</div>
          <div style={{ fontSize: '10px', color: 'rgba(28,28,28,0.4)', marginTop: '2px' }}>reports</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* City stats card */}
        <div style={{ margin: '8px 16px 0', background: '#1C1C1C', borderRadius: '16px', padding: '14px' }}>
          <div style={{ display: 'flex' }}>
            <StatCell value={cityStats.unresolved} label="Unresolved" color="#DC2626" />
            <Divider />
            <StatCell value={cityStats.resolved} label="Resolved" color="#16A34A" />
            <Divider />
            <StatCell value={`${cityStats.rate}%`} label="Resolution" color="#F77F00" />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '8px 10px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>TOP 2 ISSUES</div>
              {topIssues.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>None open</div>
              ) : (
                <div style={{ display: 'flex', gap: '22px', marginTop: '4px', fontSize: '12px', color: '#fff' }}>
                  {topIssues.map((t) => (
                    <span key={t.id} style={{ whiteSpace: 'nowrap' }}>
                      {SHORT_CAT[t.id] || CATEGORIES[t.id]?.label || t.id}
                      <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: '6px' }}>{t.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1, background: 'rgba(220,38,38,0.16)', borderRadius: '10px', padding: '8px 10px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>NEEDS URGENT ACTION</div>
              <div style={{ fontSize: '12px', color: '#FCA5A5', marginTop: '4px' }}>
                {cityStats.critical} critical {cityStats.critical === 1 ? 'issue' : 'issues'}
              </div>
            </div>
          </div>
        </div>

        {/* Sort pills */}
        <div style={{ display: 'flex', gap: '8px', padding: '14px 16px 8px', overflowX: 'auto' }}>
          {SORTS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              style={{
                whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700',
                background: sortBy === opt.id ? '#1C1C1C' : 'rgba(28,28,28,0.06)',
                color: sortBy === opt.id ? '#fff' : 'rgba(28,28,28,0.55)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Ward rows */}
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>Loading…</div>
        ) : wards.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>No reports yet</div>
        ) : (
          <div style={{ padding: '0 16px' }}>
            {wards.map((ward, i) => <WardRow key={ward.wardNumber} ward={ward} index={i + 1} />)}
          </div>
        )}

        <div style={{ height: '20px' }} />
      </div>
    </div>
  );
}

function StatCell({ value, label, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontWeight: '500', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '9px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />;
}

function WardRow({ ward, index }) {
  const pct = Math.round(ward.rate * 100);
  const col = ward.rate < 0.5 ? '#DC2626' : '#16A34A';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '11px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ width: '14px', textAlign: 'center', fontSize: '12px', color: 'rgba(28,28,28,0.3)', flexShrink: 0 }}>{index}</div>

      <div style={{
        width: '32px', height: '32px', borderRadius: '9px', background: '#EEEDE7', color: '#1C1C1C',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0,
      }}>
        {ward.wardNumber === 0 ? '–' : ward.wardNumber}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ward.areaName}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.45)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ward.commissionerName}
        </div>
      </div>

      <div style={{ width: '34px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#DC2626', lineHeight: 1 }}>{ward.open}</div>
        <div style={{ fontSize: '9px', color: 'rgba(28,28,28,0.4)', marginTop: '2px' }}>open</div>
      </div>

      <div style={{ width: '72px', flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: col, lineHeight: 1 }}>{pct}%</div>
        <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'rgba(0,0,0,0.07)', margin: '5px 0 3px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: col }} />
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(28,28,28,0.4)' }}>{ward.resolved} of {ward.total} fixed</div>
      </div>
    </div>
  );
}
