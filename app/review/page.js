'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useReports } from '../../components/ReportsProvider';
import { WARDS } from '../../data/wards';
import { CATEGORIES } from '../../data/categories';

export default function ReviewQueuePage() {
  const { reports, loading } = useReports();
  const [tab, setTab] = useState('cleanup'); // 'cleanup' | 'flag'
  const [busyId, setBusyId] = useState(null);
  // Ids already approved/rejected this session — hidden immediately so the row
  // disappears on click, without waiting for the Realtime UPDATE to land.
  const [actedIds, setActedIds] = useState(() => new Set());

  const cleanups = useMemo(
    () => reports.filter((r) => r.cleanup_status === 'pending_review' && !actedIds.has(r.id)),
    [reports, actedIds]
  );
  const flags = useMemo(
    () => reports.filter((r) => r.flag_status === 'pending_review' && !actedIds.has(r.id)),
    [reports, actedIds]
  );
  const items = tab === 'cleanup' ? cleanups : flags;

  async function decide(report, decision) {
    if (busyId) return;
    setBusyId(report.id);

    let patch;
    if (tab === 'cleanup') {
      patch = decision === 'approve'
        ? {
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            after_photo_url: report.verification_photo_url,
            before_photo_url: report.before_photo_url || report.photo_url,
            cleanup_status: 'approved',
          }
        : { cleanup_status: 'rejected' };
    } else {
      patch = decision === 'approve'
        ? { flag_status: 'approved' }   // excluded from public map/analytics
        : { flag_status: 'rejected' };
    }

    const { error } = await supabase.from('reports').update(patch).eq('id', report.id);
    if (error) {
      alert('Update failed: ' + error.message);
    } else {
      // Realtime will reconcile the shared list; hide it locally right away.
      setActedIds((prev) => new Set(prev).add(report.id));
    }
    setBusyId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#FAFAF8' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.3px' }}>
          Review Queue
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)', marginTop: '2px' }}>
          Citizen submissions awaiting moderation
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <TabBtn active={tab === 'cleanup'} onClick={() => setTab('cleanup')} label="Cleanups" count={cleanups.length} color="#16A34A" />
        <TabBtn active={tab === 'flag'} onClick={() => setTab('flag')} label="Flags" count={flags.length} color="#DC2626" />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {loading ? (
          <Empty text="Loading…" />
        ) : items.length === 0 ? (
          <Empty text={`No pending ${tab === 'cleanup' ? 'cleanups' : 'flags'} 🎉`} />
        ) : (
          items.map((report) => (
            <ReviewCard
              key={report.id}
              report={report}
              type={tab}
              busy={busyId === report.id}
              onApprove={() => decide(report, 'approve')}
              onReject={() => decide(report, 'reject')}
            />
          ))
        )}
        <div style={{ height: '20px' }} />
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label, count, color }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
      background: active ? '#1C1C1C' : 'rgba(28,28,28,0.05)',
      color: active ? 'white' : 'rgba(28,28,28,0.55)',
      fontSize: '13px', fontWeight: '700',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    }}>
      {label}
      <span style={{
        fontSize: '11px', fontWeight: '800', minWidth: '20px', padding: '1px 6px', borderRadius: '10px',
        background: count > 0 ? color : 'rgba(28,28,28,0.15)', color: 'white',
      }}>
        {count}
      </span>
    </button>
  );
}

function ReviewCard({ report, type, busy, onApprove, onReject }) {
  const cat = CATEGORIES[report.category];
  const ward = WARDS.find((w) => w.wardNumber === report.ward_number);
  const submittedPhoto = type === 'cleanup' ? report.verification_photo_url : report.flag_photo_url;

  return (
    <div style={{
      background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)',
      padding: '14px', marginBottom: '12px',
    }}>
      {/* Report summary */}
      <Link href={`/report/${report.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>{cat?.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {report.description || cat?.label || report.category}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)' }}>
            Ward {report.ward_number} · {ward?.areaName || ''}
          </div>
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(28,28,28,0.25)' }}>›</span>
      </Link>

      {/* Photo comparison */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <PhotoCol label={type === 'cleanup' ? 'ORIGINAL' : 'REPORTED'} labelColor="#DC2626" src={report.photo_url} />
        <PhotoCol label={type === 'cleanup' ? 'SUBMITTED' : 'DISPUTE'} labelColor={type === 'cleanup' ? '#16A34A' : '#F77F00'} src={submittedPhoto} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onApprove} disabled={busy} style={{
          flex: 1, padding: '11px', borderRadius: '10px', border: 'none', cursor: busy ? 'wait' : 'pointer',
          background: '#16A34A', color: 'white', fontWeight: '700', fontSize: '13px', opacity: busy ? 0.6 : 1,
        }}>
          {type === 'cleanup' ? 'Approve · Resolve' : 'Approve · Remove'}
        </button>
        <button onClick={onReject} disabled={busy} style={{
          flex: 1, padding: '11px', borderRadius: '10px', cursor: busy ? 'wait' : 'pointer',
          border: '1.5px solid rgba(28,28,28,0.15)', background: 'white', color: '#1C1C1C',
          fontWeight: '700', fontSize: '13px', opacity: busy ? 0.6 : 1,
        }}>
          Reject
        </button>
      </div>
    </div>
  );
}

function PhotoCol({ label, labelColor, src }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '9px', fontWeight: '800', color: labelColor, letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ borderRadius: '10px', overflow: 'hidden', background: '#E5E5E5', height: '120px' }}>
        {src ? (
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(28,28,28,0.3)', fontSize: '11px' }}>
            No photo
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>
      {text}
    </div>
  );
}
