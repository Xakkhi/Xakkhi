'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useReports } from '../../components/ReportsProvider';
import { WARDS } from '../../data/wards';
import { CATEGORY_LIST } from '../../data/categories';

export default function AboutPage() {
  const { reports: allReports } = useReports();

  const stats = useMemo(() => {
    const reports = allReports.filter((r) => !r.is_removed);
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const wardsCovered = new Set(reports.map((r) => r.ward_number)).size;
    return { total, resolved, wardsCovered };
  }, [allReports]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAF8' }}>
      {/* Hero */}
      <div style={{ background: '#1C1C1C', padding: '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'Fraunces, serif', color: 'white', letterSpacing: '-0.5px' }}>
          Xakkhi{' '}
          <span style={{ color: '#F77F00', fontFamily: 'Noto Sans Bengali, sans-serif', fontWeight: '700' }}>সাক্ষী</span>
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginTop: '6px', fontWeight: '500' }}>
          Dibrugarh's Civic Eye
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '16px', lineHeight: 1.6, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
          A citizen-run map of civic issues across Dibrugarh — garbage, potholes, blocked drains, broken streetlights — tied directly to the officials responsible for fixing them.
        </div>
      </div>

      {/* Live impact stats */}
      <div style={{ display: 'flex', margin: '-18px 16px 0', padding: '16px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'relative' }}>
        <Stat value={stats.total} label="Reports" color="#1C1C1C" />
        <Divider />
        <Stat value={stats.resolved} label="Resolved" color="#16A34A" />
        <Divider />
        <Stat value={`${stats.wardsCovered}/${WARDS.length}`} label="Wards" color="#F77F00" />
      </div>

      {/* How it works */}
      <Section title="How it works">
        <Step n={1} title="Spot an issue" text="See garbage, a pothole, a blocked drain or a dead streetlight in your neighbourhood." />
        <Step n={2} title="Report it in seconds" text="Snap a photo, pick the type and severity. Your location auto-fills the ward. No login, fully anonymous." />
        <Step n={3} title="Track accountability" text="Every report maps to your ward officer and the chain above them — so it's clear who must act, and whether they did." />
      </Section>

      {/* What you can report */}
      <Section title="What you can report">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORY_LIST.map((cat) => (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 14px', background: 'white', borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.06)', fontSize: '13px', fontWeight: '600', color: '#1C1C1C',
            }}>
              <span style={{ fontSize: '15px' }}>{cat.emoji}</span>
              {cat.label}
            </div>
          ))}
        </div>
      </Section>

      {/* Accountability */}
      <Section title="Built on accountability">
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', padding: '16px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(28,28,28,0.7)', lineHeight: 1.6, margin: 0 }}>
            A report isn't just a pin on a map. Each one is linked to the people responsible — your <strong>Ward Commissioner</strong>, the <strong>DMC</strong> officials and engineers, and your elected <strong>MLA</strong> and <strong>MP</strong>.
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(28,28,28,0.7)', lineHeight: 1.6, margin: '10px 0 0' }}>
            The leaderboard ranks every ward by how much gets actually resolved — turning quiet neglect into something everyone can see.
          </p>
        </div>
      </Section>

      {/* Anonymous & free */}
      <Section title="Anonymous &amp; free">
        <div style={{ display: 'flex', gap: '10px' }}>
          <Badge icon="🛡️" title="Anonymous" text="No login, no personal data. Report freely." />
          <Badge icon="🆓" title="Free forever" text="Built for citizens, run by citizens." />
        </div>
      </Section>

      {/* CTA */}
      <div style={{ padding: '8px 16px 4px' }}>
        <Link href="/report" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: '#F77F00', color: 'white', borderRadius: '14px', padding: '16px',
          fontWeight: '800', fontSize: '16px', textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(247,127,0,0.35)',
        }}>
          <span style={{ fontSize: '20px' }}>+</span> Report an Issue
        </Link>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 20px 32px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.5)', lineHeight: 1.6 }}>
          Made for the people of Dibrugarh.
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.35)', marginTop: '4px' }}>
          Ward corporator elections expected mid-2026.
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.25)', marginTop: '14px', fontFamily: 'monospace' }}>
          Xakkhi · v1.0 · 2026
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ padding: '24px 16px 0' }}>
      <h2 style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(28,28,28,0.4)', letterSpacing: '0.6px', textTransform: 'uppercase', margin: '0 0 12px' }}
        dangerouslySetInnerHTML={{ __html: title }} />
      {children}
    </div>
  );
}

function Step({ n, title, text }) {
  return (
    <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: '#1C1C1C', color: 'white', fontWeight: '800', fontSize: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {n}
      </div>
      <div style={{ flex: 1, paddingTop: '2px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1C' }}>{title}</div>
        <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.55)', lineHeight: 1.5, marginTop: '2px' }}>{text}</div>
      </div>
    </div>
  );
}

function Badge({ icon, title, text }) {
  return (
    <div style={{ flex: 1, background: 'white', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', padding: '14px' }}>
      <div style={{ fontSize: '22px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', marginTop: '8px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.5)', lineHeight: 1.4, marginTop: '2px' }}>{text}</div>
    </div>
  );
}

function Stat({ value, label, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(28,28,28,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: '1px', background: 'rgba(0,0,0,0.08)', margin: '2px 0' }} />;
}
