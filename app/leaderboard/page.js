'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useReports } from '../../components/ReportsProvider';
import { WARDS } from '../../data/wards';
import { CATEGORIES } from '../../data/categories';

export default function LeaderboardPage() {
  const { reports: allReports, loading: isLoading } = useReports();
  const [sortBy, setSortBy] = useState('worst');

  // Exclude reports removed via an approved flag from public analytics.
  const reports = useMemo(
    () => allReports.filter((r) => r.flag_status !== 'approved'),
    [allReports]
  );

  const cityStats = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const unresolved = total - resolved;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const critical = reports.filter((r) => r.severity === 'critical' && r.status !== 'resolved').length;
    const avgDays = unresolved > 0
      ? Math.round(reports.filter((r) => r.status !== 'resolved').reduce((sum, r) => sum + Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000), 0) / unresolved)
      : 0;
    return { total, resolved, unresolved, rate, critical, avgDays };
  }, [reports]);

  const wardRankings = useMemo(() => {
    const byWard = {};
    reports.forEach((r) => {
      if (!byWard[r.ward_number]) byWard[r.ward_number] = { total: 0, resolved: 0, unresolved: 0, critical: 0, totalDays: 0 };
      const w = byWard[r.ward_number];
      w.total++;
      if (r.status === 'resolved') { w.resolved++; } else {
        w.unresolved++;
        w.totalDays += Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000);
        if (r.severity === 'critical') w.critical++;
      }
    });

    return WARDS.map((ward) => {
      const stats = byWard[ward.wardNumber] || { total: 0, resolved: 0, unresolved: 0, critical: 0, totalDays: 0 };
      const rate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 100;
      const avgDays = stats.unresolved > 0 ? Math.round(stats.totalDays / stats.unresolved) : 0;
      return { ...ward, ...stats, rate, avgDays };
    }).sort((a, b) => {
      if (sortBy === 'worst') return a.rate - b.rate || b.unresolved - a.unresolved;
      if (sortBy === 'best') return b.rate - a.rate || a.unresolved - b.unresolved;
      return b.unresolved - a.unresolved;
    });
  }, [reports, sortBy]);

  const topCategory = useMemo(() => {
    const counts = {};
    reports.filter((r) => r.status !== 'resolved').forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? { id: top[0], count: top[1] } : null;
  }, [reports]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#FAFAF8' }}>
      {/* Handle / drag indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(28,28,28,0.15)' }} />
      </div>

      {/* Title */}
      <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.3px' }}>
            Ward Leaderboard
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)', marginTop: '2px' }}>
            Dibrugarh Municipal Corporation
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.4)' }}>
          {reports.length} reports
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* City-level stats */}
        <div style={{
          margin: '0 16px 12px', padding: '16px',
          background: '#1C1C1C', borderRadius: '16px',
        }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <StatCell value={cityStats.unresolved} label="Unresolved" color="#DC2626" />
            <Divider />
            <StatCell value={cityStats.resolved} label="Resolved" color="#16A34A" />
            <Divider />
            <StatCell value={`${cityStats.rate}%`} label="Rate" color={cityStats.rate >= 50 ? '#16A34A' : '#F77F00'} />
            <Divider />
            <StatCell value={cityStats.avgDays} label="Avg Days" color={cityStats.avgDays > 14 ? '#DC2626' : '#fff'} />
          </div>

          {/* Top issue + critical count */}
          <div style={{
            display: 'flex', gap: '10px', marginTop: '12px',
            paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            {topCategory && (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px',
              }}>
                <span style={{ fontSize: '14px' }}>{CATEGORIES[topCategory.id]?.emoji}</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>
                    {CATEGORIES[topCategory.id]?.label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    Top issue ({topCategory.count})
                  </div>
                </div>
              </div>
            )}
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 10px', background: 'rgba(220,38,38,0.15)', borderRadius: '8px',
            }}>
              <span style={{ fontSize: '14px' }}>🚨</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#FCA5A5' }}>
                  {cityStats.critical} Critical
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                  Needs urgent action
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sort chips */}
        <div style={{ display: 'flex', gap: '8px', padding: '0 16px 10px' }}>
          {[
            { id: 'worst', label: 'Worst First' },
            { id: 'best', label: 'Best First' },
            { id: 'most', label: 'Most Reports' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700',
                background: sortBy === opt.id ? '#1C1C1C' : 'rgba(28,28,28,0.06)',
                color: sortBy === opt.id ? 'white' : 'rgba(28,28,28,0.5)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Ward rankings */}
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>
            Loading...
          </div>
        ) : (
          <div style={{ padding: '0 16px' }}>
            {wardRankings.map((ward, i) => (
              <WardRow key={ward.wardNumber} ward={ward} rank={i + 1} />
            ))}
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
      <div style={{ fontSize: '22px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '9px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />;
}

function WardRow({ ward, rank }) {
  const isGood = ward.rate >= 50;
  const rateColor = ward.total === 0 ? 'rgba(28,28,28,0.3)' : isGood ? '#16A34A' : ward.rate < 20 ? '#DC2626' : '#F77F00';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 0',
      borderBottom: '1px solid rgba(0,0,0,0.04)',
    }}>
      {/* Rank */}
      <div style={{
        width: '24px', textAlign: 'center',
        fontSize: '13px', fontWeight: '800',
        color: rank <= 3 ? '#DC2626' : rank >= 20 ? '#16A34A' : 'rgba(28,28,28,0.3)',
      }}>
        {rank}
      </div>

      {/* Ward badge */}
      <div style={{
        width: '34px', height: '34px', borderRadius: '10px',
        background: ward.unresolved > 0 ? '#FFF0F0' : '#F0FDF4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '800', fontSize: '13px', flexShrink: 0,
        color: ward.unresolved > 0 ? '#DC2626' : '#16A34A',
      }}>
        {ward.wardNumber}
      </div>

      {/* Name + commissioner */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '700', fontSize: '13px', color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ward.areaName}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.4)', marginTop: '1px' }}>
          {ward.commissionerName || 'Vacant'}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Unresolved count */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: ward.unresolved > 0 ? '#DC2626' : '#16A34A' }}>
            {ward.unresolved}
          </div>
          <div style={{ fontSize: '8px', color: 'rgba(28,28,28,0.3)', fontWeight: '600' }}>open</div>
        </div>

        {/* Resolution rate bar */}
        <div style={{ width: '40px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: rateColor, textAlign: 'right' }}>
            {ward.total === 0 ? '—' : `${ward.rate}%`}
          </div>
          <div style={{
            width: '100%', height: '3px', borderRadius: '2px',
            background: 'rgba(0,0,0,0.06)', marginTop: '3px',
          }}>
            <div style={{
              width: `${ward.rate}%`, height: '100%', borderRadius: '2px',
              background: rateColor,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
