'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { WARDS } from '../../../data/wards';
import { CATEGORIES, SEVERITY_COLORS } from '../../../data/categories';
import { SHOW_OFFICIAL_CONTACT } from '../../../data/officials';
import AccountabilityTree from '../../../components/AccountabilityTree';
import ActionSheet from '../../../components/ActionSheet';

function daysOld(dateStr) {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seenMarked, setSeenMarked] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); // 'clean' | 'flag'
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    async function loadReport() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) setReport(data);
      setLoading(false);
    }
    loadReport();
  }, [id]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
        <div style={{ color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1C1C1C', marginBottom: '8px' }}>Report not found</div>
          <button onClick={() => router.back()} style={linkBtnStyle}>Go back</button>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[report.category];
  const ward = WARDS.find((w) => w.wardNumber === report.ward_number);
  const sevColor = SEVERITY_COLORS[report.severity] || '#F77F00';
  const isResolved = report.status === 'resolved';
  const days = daysOld(report.created_at);

  async function handleSeenThis() {
    if (seenMarked) return;
    setSeenMarked(true);
    await supabase
      .from('reports')
      .update({ seen_count: (report.seen_count || 0) + 1 })
      .eq('id', report.id);
    setReport((r) => ({ ...r, seen_count: (r.seen_count || 0) + 1 }));
  }

  function handleShare() {
    const url = `${window.location.origin}/report/${report.id}`;
    if (navigator.share) {
      navigator.share({ title: `Xakkhi Report — ${cat?.label || report.category}`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  }

  function handleDirections() {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`, '_blank');
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAF8' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)',
        background: 'white',
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer',
          width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', color: '#1C1C1C',
        }}>
          ×
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Severity badge */}
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px',
            background: `${sevColor}18`, color: sevColor,
          }}>
            {report.severity?.charAt(0).toUpperCase() + report.severity?.slice(1)}
          </span>
          {/* Status badge */}
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px',
            background: isResolved ? '#DCFCE7' : '#FEE2E2',
            color: isResolved ? '#16A34A' : '#DC2626',
          }}>
            {isResolved ? 'Resolved' : 'Unresolved'}
          </span>
        </div>

        <button onClick={handleShare} style={{
          background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer',
          width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          ↗
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Category + Location */}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>{cat?.emoji}</span>
            <span style={{ fontWeight: '800', fontSize: '18px', color: '#1C1C1C' }}>
              {cat?.label || report.category}
            </span>
          </div>
          {report.sub_category && (
            <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.5)', marginBottom: '8px', paddingLeft: '28px' }}>
              {report.sub_category}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '28px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(28,28,28,0.6)' }}>
              {report.description || 'No description'}
            </span>
          </div>
          <button onClick={handleDirections} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            marginTop: '8px', marginLeft: '28px', padding: '6px 14px',
            background: '#EFF6FF', color: '#2563EB', borderRadius: '20px',
            border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          }}>
            Get directions →
          </button>
        </div>

        {/* Photo — before/after for resolved, single for active */}
        {isResolved && report.after_photo_url ? (
          <BeforeAfter
            before={report.before_photo_url || report.photo_url}
            after={report.after_photo_url}
            cleanDays={report.clean_days}
            resolvedAt={report.resolved_at}
            createdAt={report.created_at}
          />
        ) : (
          <div style={{ position: 'relative', margin: '0 16px', borderRadius: '14px', overflow: 'hidden', background: '#E5E5E5' }}>
            {report.photo_url ? (
              <img
                src={report.photo_url}
                alt="Report photo"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(28,28,28,0.3)', fontSize: '14px',
              }}>
                No photo attached
              </div>
            )}

            {/* "I've seen this" overlay button */}
            <button onClick={handleSeenThis} style={{
              position: 'absolute', bottom: '12px', right: '12px',
              padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: '700',
              background: seenMarked ? '#16A34A' : 'rgba(28,28,28,0.75)',
              color: 'white',
              backdropFilter: 'blur(4px)',
            }}>
              {seenMarked ? 'Reported' : "I've seen this"}
            </button>
          </div>
        )}

        {/* Stats trio */}
        <div style={{
          display: 'flex', margin: '16px', padding: '14px',
          background: 'white', borderRadius: '14px',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1C' }}>
              {report.seen_count || 0}
            </div>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', marginTop: '2px' }}>
              Reports
            </div>
          </div>
          <div style={{ width: '1px', background: 'rgba(0,0,0,0.06)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: days > 7 ? '#DC2626' : '#1C1C1C' }}>
              {days}
            </div>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', marginTop: '2px' }}>
              Days Old
            </div>
          </div>
          <div style={{ width: '1px', background: 'rgba(0,0,0,0.06)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#1C1C1C', fontFamily: 'monospace' }}>
              {report.sub_category || cat?.label || '—'}
            </div>
            <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', marginTop: '2px' }}>
              Sub-type
            </div>
          </div>
        </div>

        {/* Ward info */}
        <Link href={`/official/ward-${report.ward_number}`} style={{
          display: 'block', margin: '0 16px 16px', padding: '14px 16px',
          background: 'white', borderRadius: '14px',
          border: '1px solid rgba(0,0,0,0.06)', textDecoration: 'none', color: 'inherit',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', letterSpacing: '0.5px', marginBottom: '8px' }}>
            WARD INFO
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', background: '#FFF3E0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '14px', color: '#F77F00', flexShrink: 0,
            }}>
              {report.ward_number}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1C1C1C' }}>
                {ward?.areaName || `Ward ${report.ward_number}`}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.5)' }}>
                {ward?.commissionerName || 'Vacant'} · {ward?.commissionerPosition || ''}
              </div>
            </div>
            {SHOW_OFFICIAL_CONTACT && ward?.commissionerPhone && (
              <span
                role="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${ward.commissionerPhone}`; }}
                style={{
                  padding: '6px 14px', background: '#F77F00', color: 'white',
                  borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Call
              </span>
            )}
            <span style={{ fontSize: '14px', color: 'rgba(28,28,28,0.2)' }}>›</span>
          </div>
        </Link>

        {/* Accountability tree placeholder */}
        <div style={{
          margin: '0 16px 16px', padding: '14px 16px',
          background: 'white', borderRadius: '14px',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', letterSpacing: '0.5px', marginBottom: '10px' }}>
            ACCOUNTABILITY
          </div>
          <AccountabilityTree wardNumber={report.ward_number} ward={ward} />
        </div>

        {/* File a complaint */}
        <button
          onClick={() => {
            // Route to the ward's accountability page, not a personal mobile.
            window.location.href = `/official/ward-${report.ward_number}`;
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            margin: '0 16px 12px', width: 'calc(100% - 32px)', padding: '14px',
            background: '#F1F1EE', border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: '700', color: '#1C1C1C', cursor: 'pointer',
          }}
        >
          💬 File a complaint
        </button>

        {/* Trust footer */}
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)' }}>
            Reported {days === 0 ? 'today' : `${days}d ago`} · {report.citizen_count || 1} citizen{(report.citizen_count || 1) === 1 ? '' : 's'} reported
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '8px' }}>
            <span style={{ fontSize: '13px' }}>🛡️</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#16A34A' }}>All reports are anonymous</span>
          </div>
        </div>

        {/* Report ID */}
        <div style={{
          margin: '10px 16px 16px', textAlign: 'center',
          fontSize: '11px', color: 'rgba(28,28,28,0.3)',
          fontFamily: 'monospace',
        }}>
          {report.report_id_short || report.id.slice(0, 8)}
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '80px' }} />
      </div>

      {/* Bottom action bar */}
      <div style={{
        display: 'flex', gap: '10px', padding: '12px 16px',
        borderTop: '1px solid rgba(0,0,0,0.06)', background: 'white',
      }}>
        <button onClick={() => setActiveSheet('clean')} style={{
          flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
          background: '#16A34A', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
        }}>
          Verify Cleanup
        </button>
        <button onClick={() => setActiveSheet('flag')} style={{
          flex: 1, padding: '14px', borderRadius: '12px',
          border: '1.5px solid #DC2626', background: 'white',
          color: '#DC2626', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
        }}>
          Flag as Incorrect
        </button>
      </div>

      {/* Action sheets */}
      {activeSheet && (
        <ActionSheet
          report={report}
          type={activeSheet}
          onClose={() => setActiveSheet(null)}
          onDone={(t) => setToast(t === 'clean'
            ? 'Cleanup photo submitted for review ✓'
            : 'Report flagged — our team will review it')}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
            background: '#1C1C1C', color: 'white', padding: '12px 20px', borderRadius: '24px',
            fontSize: '13px', fontWeight: '700', zIndex: 60, maxWidth: '90%', textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function BeforeAfter({ before, after, cleanDays, resolvedAt, createdAt }) {
  // Days from report → resolution
  const fixDays = resolvedAt && createdAt
    ? Math.max(0, Math.round((new Date(resolvedAt).getTime() - new Date(createdAt).getTime()) / 86400000))
    : null;

  return (
    <div style={{ margin: '0 16px' }}>
      <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
        <PhotoTile label="BEFORE" labelColor="#DC2626" src={before} />
        <PhotoTile label="AFTER" labelColor="#16A34A" src={after} />
        {/* Center check badge */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '32px', height: '32px', borderRadius: '50%', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)', zIndex: 2,
        }}>
          <span style={{ color: '#16A34A', fontSize: '18px', fontWeight: '800' }}>✓</span>
        </div>
      </div>

      {/* Resolution banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px',
        padding: '14px', borderRadius: '14px', background: '#F0FDF4', border: '1px solid #BBF7D0',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', background: '#16A34A', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '20px', fontWeight: '800',
        }}>
          ✓
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#15803D' }}>
            {fixDays === 0 ? 'Cleaned up the same day' : fixDays != null ? `Cleaned up in ${fixDays} day${fixDays === 1 ? '' : 's'}` : 'Cleaned up'}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(21,128,61,0.7)', marginTop: '1px' }}>
            {cleanDays ? `Clean for ${cleanDays} day${cleanDays === 1 ? '' : 's'} · ` : ''}Verified by a citizen
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoTile({ label, labelColor, src }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '10px', fontWeight: '800', color: labelColor, letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: labelColor }} />
        {label}
      </div>
      <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#E5E5E5', height: '150px' }}>
        {src ? (
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(28,28,28,0.3)', fontSize: '12px' }}>
            No photo
          </div>
        )}
      </div>
    </div>
  );
}

const linkBtnStyle = {
  background: 'none', border: 'none', color: '#F77F00',
  fontWeight: '700', fontSize: '14px', cursor: 'pointer',
};
