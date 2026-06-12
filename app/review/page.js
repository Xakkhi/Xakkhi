'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../components/AuthProvider';
import { WARDS } from '../../data/wards';
import { CATEGORIES } from '../../data/categories';

export default function ReviewQueuePage() {
  const { isAdmin, loading: authLoading } = useAdmin();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('cleanup'); // 'cleanup' | 'flag'
  const [busyId, setBusyId] = useState(null);

  // Pending suggestions live in report_actions (admins only can read this).
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('report_actions')
      .select('*, report:reports(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (!error) setActions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const cleanups = actions.filter((a) => a.action_type === 'cleanup');
  const flags = actions.filter((a) => a.action_type === 'flag');
  const items = tab === 'cleanup' ? cleanups : flags;

  async function decide(action, decision) {
    if (busyId) return;
    setBusyId(action.id);

    try {
      if (decision === 'approve') {
        const report = action.report;
        if (action.action_type === 'cleanup') {
          // Resolve the report + set the after-photo from the submission.
          const { error } = await supabase.from('reports').update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            after_photo_url: action.photo_url,
            before_photo_url: report?.before_photo_url || report?.photo_url || null,
          }).eq('id', action.report_id);
          if (error) throw error;
        } else {
          // Soft-remove: hidden from all public views, row kept (reversible).
          const { error } = await supabase.from('reports')
            .update({ is_removed: true }).eq('id', action.report_id);
          if (error) throw error;
        }
      }

      // Mark the suggestion itself approved/rejected.
      const { error: aErr } = await supabase.from('report_actions')
        .update({ status: decision === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', action.id);
      if (aErr) throw aErr;

      setActions((prev) => prev.filter((a) => a.id !== action.id));
    } catch (err) {
      alert('Update failed: ' + (err.message || err));
    }
    setBusyId(null);
  }

  // ─── Auth gate ───────────────────────────────────────────────────────────
  if (authLoading) {
    return <Centered text="Checking access…" />;
  }
  if (!isAdmin) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: '#1C1C1C' }}>Not authorized</div>
          <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.55)', marginTop: '6px', lineHeight: 1.5 }}>
            The review queue is for Xakkhi admins only. Sign in with an authorized account to continue.
          </div>
          <Link href="/login" style={{
            display: 'inline-block', marginTop: '16px', padding: '11px 22px', borderRadius: '12px',
            background: '#F77F00', color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '14px',
          }}>
            Go to sign-in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#FAFAF8' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.3px' }}>Review Queue</div>
        <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.45)', marginTop: '2px' }}>Citizen submissions awaiting moderation</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <TabBtn active={tab === 'cleanup'} onClick={() => setTab('cleanup')} label="Cleanups" count={cleanups.length} color="#16A34A" />
        <TabBtn active={tab === 'flag'} onClick={() => setTab('flag')} label="Flags" count={flags.length} color="#DC2626" />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {loading ? (
          <Empty text="Loading…" />
        ) : items.length === 0 ? (
          <Empty text={`No pending ${tab === 'cleanup' ? 'cleanups' : 'flags'} 🎉`} />
        ) : (
          items.map((action) => (
            <ReviewCard
              key={action.id}
              action={action}
              busy={busyId === action.id}
              onApprove={() => decide(action, 'approve')}
              onReject={() => decide(action, 'reject')}
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

function ReviewCard({ action, busy, onApprove, onReject }) {
  const type = action.action_type;
  const report = action.report || {};
  const cat = CATEGORIES[report.category];
  const ward = WARDS.find((w) => w.wardNumber === report.ward_number);

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '14px', marginBottom: '12px' }}>
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <PhotoCol label={type === 'cleanup' ? 'ORIGINAL' : 'REPORTED'} labelColor="#DC2626" src={report.photo_url} />
        <PhotoCol label={type === 'cleanup' ? 'SUBMITTED' : 'DISPUTE'} labelColor={type === 'cleanup' ? '#16A34A' : '#F77F00'} src={action.photo_url} />
      </div>

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
  return <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>{text}</div>;
}

function Centered({ text }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', color: 'rgba(28,28,28,0.4)', fontSize: '14px' }}>
      {text}
    </div>
  );
}
