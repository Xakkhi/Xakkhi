'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { WARDS } from '../../../data/wards';
import { CITY_OFFICIALS, SHOW_OFFICIAL_CONTACT } from '../../../data/officials';
import { CATEGORIES } from '../../../data/categories';

export default function OfficialDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const isWard = slug.startsWith('ward-');
  const wardNumber = isWard ? Number(slug.replace('ward-', '')) : null;
  const ward = isWard ? WARDS.find((w) => w.wardNumber === wardNumber) : null;
  const official = isWard ? null : CITY_OFFICIALS.find((o) => o.slug === slug);

  const person = isWard
    ? { name: ward?.commissionerName || 'Vacant', role: `Ward ${wardNumber} Commissioner`, body: ward?.areaName, phone: ward?.commissionerPhone, party: ward?.commissionerParty }
    : official;

  useEffect(() => {
    async function loadReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setReports((data || []).filter((r) => r.flag_status !== 'approved'));
      setLoading(false);
    }
    loadReports();
  }, []);

  const stats = useMemo(() => {
    const relevant = isWard
      ? reports.filter((r) => r.ward_number === wardNumber)
      : reports;
    const total = relevant.length;
    const resolved = relevant.filter((r) => r.status === 'resolved').length;
    const unresolved = total - resolved;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const critical = relevant.filter((r) => r.severity === 'critical' && r.status !== 'resolved').length;
    const avgDays = unresolved > 0
      ? Math.round(relevant.filter((r) => r.status !== 'resolved').reduce((s, r) => s + Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000), 0) / unresolved)
      : 0;

    const byCat = {};
    relevant.filter((r) => r.status !== 'resolved').forEach((r) => {
      byCat[r.category] = (byCat[r.category] || 0) + 1;
    });
    const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return { total, resolved, unresolved, rate, critical, avgDays, topCats };
  }, [reports, isWard, wardNumber]);

  const recentReports = useMemo(() => {
    const relevant = isWard
      ? reports.filter((r) => r.ward_number === wardNumber)
      : reports;
    return relevant.slice(0, 5);
  }, [reports, isWard, wardNumber]);

  if (!person) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1C1C1C', marginBottom: '8px' }}>Official not found</div>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#F77F00', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAF8' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white',
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer',
          width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', color: '#1C1C1C',
        }}>
          ×
        </button>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(28,28,28,0.4)' }}>
          Official Profile
        </span>
        <div style={{ width: '36px' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Profile header */}
        <div style={{ padding: '20px 16px', textAlign: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 12px',
            background: isWard ? '#FFF3E0' : '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800',
            color: isWard ? '#F77F00' : '#2563EB',
          }}>
            {isWard ? wardNumber : person.role.charAt(0)}
          </div>

          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.3px' }}>
            {person.name}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.5)', marginTop: '4px' }}>
            {person.role}
            {person.party ? ` (${person.party})` : ''}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.35)', marginTop: '2px' }}>
            {person.body}
          </div>

          {/* Action buttons — hidden pending verification of public contact numbers */}
          {SHOW_OFFICIAL_CONTACT && person.phone && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
              <a href={`tel:${person.phone}`} style={{
                padding: '8px 20px', background: '#F77F00', color: 'white',
                borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                Call
              </a>
              <a href={`https://wa.me/91${person.phone}`} target="_blank" rel="noopener noreferrer" style={{
                padding: '8px 20px', background: '#25D366', color: 'white',
                borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                textDecoration: 'none',
              }}>
                WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Stats card */}
        <div style={{
          margin: '0 16px 12px', padding: '16px',
          background: '#1C1C1C', borderRadius: '16px',
        }}>
          <div style={{ display: 'flex' }}>
            <StatCell value={stats.unresolved} label="Open" color="#DC2626" />
            <Divider />
            <StatCell value={stats.resolved} label="Resolved" color="#16A34A" />
            <Divider />
            <StatCell value={`${stats.rate}%`} label="Rate" color={stats.rate >= 50 ? '#16A34A' : '#F77F00'} />
            <Divider />
            <StatCell value={stats.avgDays} label="Avg Days" color={stats.avgDays > 14 ? '#DC2626' : '#fff'} />
          </div>
        </div>

        {/* Top issues breakdown */}
        {stats.topCats.length > 0 && (
          <div style={{
            margin: '0 16px 12px', padding: '14px 16px',
            background: 'white', borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', letterSpacing: '0.5px', marginBottom: '10px' }}>
              TOP ISSUES
            </div>
            {stats.topCats.map(([catId, count]) => {
              const cat = CATEGORIES[catId];
              const pct = stats.unresolved > 0 ? Math.round((count / stats.unresolved) * 100) : 0;
              return (
                <div key={catId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                  <span style={{ fontSize: '16px' }}>{cat?.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1C1C1C' }}>{cat?.label || catId}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(28,28,28,0.5)' }}>{count}</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.06)' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '2px', background: cat?.color || '#F77F00' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Jurisdiction info for ward commissioners */}
        {isWard && ward && (
          <div style={{
            margin: '0 16px 12px', padding: '14px 16px',
            background: 'white', borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', letterSpacing: '0.5px', marginBottom: '8px' }}>
              JURISDICTION
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', background: '#FFF3E0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '800', fontSize: '14px', color: '#F77F00',
              }}>
                {wardNumber}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1C1C1C' }}>{ward.areaName}</div>
                <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)', fontFamily: 'Noto Sans Bengali, sans-serif' }}>{ward.areaNameLocal}</div>
              </div>
            </div>
          </div>
        )}

        {/* Chain of command for ward commissioners */}
        {isWard && (
          <div style={{
            margin: '0 16px 12px', padding: '14px 16px',
            background: 'white', borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', letterSpacing: '0.5px', marginBottom: '10px' }}>
              REPORTS TO
            </div>
            {CITY_OFFICIALS.slice(0, 3).map((off) => (
              <Link key={off.slug} href={`/official/${off.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
                borderTop: '1px solid rgba(0,0,0,0.04)', textDecoration: 'none', color: 'inherit',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1C1C1C' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>{off.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.45)' }}>{off.role}</div>
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(28,28,28,0.25)' }}>›</span>
              </Link>
            ))}
          </div>
        )}

        {/* Recent reports */}
        {recentReports.length > 0 && (
          <div style={{
            margin: '0 16px 12px', padding: '14px 16px',
            background: 'white', borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', letterSpacing: '0.5px', marginBottom: '10px' }}>
              RECENT REPORTS
            </div>
            {recentReports.map((r) => {
              const cat = CATEGORIES[r.category];
              const isResolved = r.status === 'resolved';
              return (
                <Link key={r.id} href={`/report/${r.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0',
                  borderTop: '1px solid rgba(0,0,0,0.04)', textDecoration: 'none', color: 'inherit',
                }}>
                  <span style={{ fontSize: '14px' }}>{cat?.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.description || `${cat?.label || r.category} issue`}
                    </div>
                    {isWard ? null : (
                      <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.4)' }}>Ward {r.ward_number}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                    background: isResolved ? '#DCFCE7' : '#FEE2E2',
                    color: isResolved ? '#16A34A' : '#DC2626',
                  }}>
                    {isResolved ? 'Resolved' : r.severity?.charAt(0).toUpperCase() + r.severity?.slice(1)}
                  </span>
                </Link>
              );
            })}
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
      <div style={{ fontSize: '20px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '9px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />;
}
