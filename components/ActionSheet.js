'use client';

import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

// type: 'clean' | 'flag'
const COPY = {
  clean: {
    title: 'Mark as Cleaned',
    intro: "Take a photo to verify this spot has been cleaned. We'll review it within 24 hours.",
    boxTitle: 'Take a Verification Photo',
    boxSub: 'Show that this spot is now clean',
    accent: '#16A34A',
    boxBg: '#F0FDF4',
    boxBorder: '#86EFAC',
    submitLabel: 'Submit for Review',
    icon: '📷',
  },
  flag: {
    title: "This isn't right",
    intro: "Take a photo of the spot to show the report is incorrect. Our team will review within 24 hours.",
    boxTitle: 'Take a Photo of the Spot',
    boxSub: "Show what's actually there now",
    accent: '#1C1C1C',
    boxBg: '#FAFAF8',
    boxBorder: 'rgba(0,0,0,0.15)',
    submitLabel: 'Submit for Review',
    icon: '📷',
    note: 'What happens next: if approved, this report is removed from the public map and analytics. If rejected, it stays where it is. Disputes that are clearly fraudulent may be ignored.',
  },
};

export default function ActionSheet({ report, type, onClose, onDone }) {
  const copy = COPY[type];
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function submit() {
    if (!file || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const folder = type === 'clean' ? 'verification' : 'disputes';
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${folder}/${report.id}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('report-photos')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('report-photos').getPublicUrl(path);
      const url = pub.publicUrl;

      const patch = type === 'clean'
        ? { verification_photo_url: url, cleanup_status: 'pending_review' }
        : { flag_photo_url: url, flag_status: 'pending_review' };

      const { error: dbErr } = await supabase.from('reports').update(patch).eq('id', report.id);
      if (dbErr) throw dbErr;

      onDone?.(type);
      onClose();
    } catch (err) {
      console.error('[ActionSheet] submit failed:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        background: 'white', borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        maxHeight: '85vh', overflowY: 'auto',
        animation: 'sheetUp 0.22s ease-out',
      }}>
        <style>{`@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 20px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.3px' }}>{copy.title}</div>
            <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.5)', marginTop: '4px', lineHeight: 1.4 }}>{copy.intro}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer',
            color: 'rgba(28,28,28,0.5)', lineHeight: 1, padding: '2px',
          }}>×</button>
        </div>

        <div style={{ padding: '18px 20px 24px' }}>
          {/* Photo box */}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickFile} style={{ display: 'none' }} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%', padding: preview ? '0' : '32px 16px', cursor: 'pointer',
              border: `2px dashed ${copy.boxBorder}`, borderRadius: '14px',
              background: copy.boxBg, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {preview ? (
              <img src={preview} alt="preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <>
                <div style={{ fontSize: '30px' }}>{copy.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: copy.accent, marginTop: '8px' }}>{copy.boxTitle}</div>
                <div style={{ fontSize: '12px', color: copy.accent, opacity: 0.75, marginTop: '2px' }}>{copy.boxSub}</div>
              </>
            )}
          </button>

          {preview && (
            <button onClick={() => fileRef.current?.click()} style={{
              background: 'none', border: 'none', color: copy.accent, fontSize: '12px',
              fontWeight: '700', cursor: 'pointer', marginTop: '8px',
            }}>
              Retake photo
            </button>
          )}

          {/* Flag explainer */}
          {copy.note && (
            <div style={{
              marginTop: '14px', padding: '12px 14px', borderRadius: '12px',
              background: '#EFF6FF', fontSize: '12px', color: '#1D4ED8', lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: '800' }}>What happens next: </span>
              {copy.note.replace('What happens next: ', '')}
            </div>
          )}

          {error && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#DC2626', fontWeight: '600', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={!file || submitting}
            style={{
              width: '100%', marginTop: '18px', padding: '15px', borderRadius: '14px', border: 'none',
              background: type === 'clean' ? '#16A34A' : '#F4978E',
              color: 'white', fontWeight: '800', fontSize: '15px',
              cursor: file && !submitting ? 'pointer' : 'not-allowed',
              opacity: file && !submitting ? 1 : 0.55,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {submitting ? 'Submitting…' : <>{type === 'flag' ? '🚩' : '✓'} {copy.submitLabel}</>}
          </button>
        </div>
      </div>
    </>
  );
}
