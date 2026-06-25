'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useReports } from '../../components/ReportsProvider';
import { CATEGORY_LIST } from '../../data/categories';

export default function AboutPage() {
  const { reports: allReports } = useReports();

  const stats = useMemo(() => {
    const reports = allReports.filter((r) => !r.is_removed);
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, resolved, resolutionRate };
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
          Xakkhi is an initiative aimed at strengthening collaboration between citizens and the administration by enabling faster, more transparent and accountable civic reporting and redressal.
        </div>
      </div>

      {/* Live impact stats */}
      <div style={{ display: 'flex', margin: '-18px 16px 0', padding: '16px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'relative' }}>
        <Stat value={stats.total} label="Reports" color="#1C1C1C" />
        <Divider />
        <Stat value={stats.resolved} label="Resolved" color="#16A34A" />
        <Divider />
        <Stat value={`${stats.resolutionRate}%`} label="Resolution" color="#F77F00" />
      </div>

      {/* Our mission */}
      <Section title="Our mission">
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', padding: '16px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(28,28,28,0.7)', lineHeight: 1.6, margin: 0, textAlign: 'justify' }}>
            Citizens report and track civic concerns in real time, including issues related to garbage, drainage, roads, streetlights and riverbanks. Concerned authorities can use this platform to locate issues, find the exact spot using the Google Maps link on each report page, fix the problem, and submit a resolution report for verification. Active reports are displayed on an interactive map of Dibrugarh, ensuring greater visibility of civic concerns and facilitating timely action.
          </p>
          <p style={{ fontSize: '15px', color: '#F77F00', fontWeight: '700', lineHeight: 1.6, margin: '14px 0 0', textAlign: 'justify', fontFamily: 'Fraunces, serif' }}>
            Let us work together to make Dibrugarh a cleaner, safer and better place to live in!
          </p>
        </div>
      </Section>

      {/* How it works */}
      <Section title="How it works">
        <Step n={1} title="Report an issue" text="Take a photo on the spot, get your location tagged, enter a few details and submit. No login, fully anonymous." />
        <Step n={2} title="Track issue" text="Every report is visible on a live, interactive map and tracker — so the right people can take action, and progress is visible to everyone." />
        <Step n={3} title="Verify resolution" text="Authorities or anyone can submit a photo of a successful cleanup or resolution, and get it verified by a Xakkhi admin." />
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

      {/* Features */}
      <Section title="Features">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <FeatureCard icon="🗺️" title="Interactive map" text="Every active issue shown live on a map of Dibrugarh, colour-coded by severity." />
          <FeatureCard icon="📍" title="Live location tagging" text="Each report is auto-pinned to the exact spot and ward where it's filed." />
          <FeatureCard icon="🧭" title="Get directions" text="One tap opens Google Maps to the exact location of any issue." />
          <FeatureCard icon="⚡" title="Real-time updates" text="New reports and resolutions appear instantly." />
          <FeatureCard icon="📷" title="On-the-spot photo" text="Reports are backed by a fresh, live photo — keeping data genuine." />
          <FeatureCard icon="📊" title="Ward Health" text="See how each ward is doing and which are making real progress." />
          <FeatureCard icon="📋" title="Issue list" text="Browse and track every report, grouped by ward and filtered by category, severity and status." />
          <FeatureCard icon="✅" title="Resolution verification" text="Authorities or citizens submit a cleanup photo, verified by a Xakkhi admin." />
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
          fontWeight: '800', fontSize: '17px', textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(247,127,0,0.35)',
        }}>
          Report an Issue
        </Link>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 20px 32px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.5)', lineHeight: 1.6 }}>
          Made for the people of Dibrugarh.
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(28,28,28,0.55)', marginTop: '10px', fontWeight: '600' }}>
          Founded by Annwesha Roy
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          <InstaChip handle="xakkhi.dibrugarh" />
          <InstaChip handle="royannwesha" />
        </div>
        <a href="mailto:xakkhi.official@gmail.com" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12px', color: 'rgba(28,28,28,0.5)', textDecoration: 'none' }}>
          xakkhi.official@gmail.com
        </a>
        <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.25)', marginTop: '18px', fontFamily: 'monospace' }}>
          Xakkhi · v1.0 · 2026
        </div>
      </div>
    </div>
  );
}

function Section({ title, titleStyle, children }) {
  return (
    <div style={{ padding: '24px 16px 0' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(28,28,28,0.5)', letterSpacing: '0.6px', textTransform: 'uppercase', margin: '0 0 12px', ...titleStyle }}
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

function FeatureCard({ icon, title, text, wide }) {
  return (
    <div style={{
      gridColumn: wide ? '1 / -1' : 'auto',
      background: 'white', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', padding: '14px',
    }}>
      <div style={{ fontSize: '22px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', marginTop: '8px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'rgba(28,28,28,0.5)', lineHeight: 1.45, marginTop: '3px' }}>{text}</div>
    </div>
  );
}

function InstaChip({ handle }) {
  return (
    <a
      href={`https://instagram.com/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 12px', background: 'white', borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.08)', textDecoration: 'none',
        fontSize: '12px', fontWeight: '600', color: '#1C1C1C',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C13584" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.1" fill="#C13584" stroke="none" />
      </svg>
      @{handle}
    </a>
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
