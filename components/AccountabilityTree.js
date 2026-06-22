'use client';

import Link from 'next/link';
import { MLA, MP } from '../data/wards';
import { CITY_BODY, ELECTED_BOARD, ADMINISTRATION } from '../data/hierarchy';

const PARTY_COLORS = { BJP: '#F77F00', INC: '#19AAED', AGP: '#16A34A', default: '#6B7280' };

function initials(name) {
  if (!name || name === 'Vacant') return '—';
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
}

// A box in the tree: role title + person name, optionally linking to their page.
function Node({ role, name, slug, highlight }) {
  const inner = (
    <div style={{
      border: highlight ? '1px solid #FFE0B2' : '1px solid rgba(0,0,0,0.08)',
      background: highlight ? '#FFF8EF' : 'white',
      borderRadius: '10px', padding: '7px 11px',
    }}>
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>{role}</div>
      <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.45)' }}>{name}</div>
    </div>
  );
  return slug ? <Link href={`/official/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>{inner}</Link> : inner;
}

function Connector() {
  return <div style={{ width: '1px', height: '11px', background: 'rgba(0,0,0,0.12)', margin: '0 auto' }} />;
}

function RepCard({ name, role, party, slug, avatarColor }) {
  const partyColor = PARTY_COLORS[party] || PARTY_COLORS.default;
  const card = (
    <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
      <div style={{
        width: '50px', height: '50px', borderRadius: '14px', margin: '0 auto',
        background: avatarColor, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: '800',
      }}>
        {initials(name)}
      </div>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1C', marginTop: '7px', lineHeight: 1.25 }}>{name}</div>
      <div style={{ fontSize: '10px', marginTop: '1px' }}>
        {party && <span style={{ color: partyColor, fontWeight: '700' }}>{party}</span>}
        {party && <span style={{ color: 'rgba(28,28,28,0.45)' }}> · </span>}
        <span style={{ color: 'rgba(28,28,28,0.45)' }}>{role}</span>
      </div>
    </div>
  );
  return slug ? <Link href={`/official/${slug}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit', display: 'flex' }}>{card}</Link> : card;
}

export default function AccountabilityTree({ wardNumber, ward }) {
  const isOther = !wardNumber || wardNumber === 0;
  const councillorName = isOther ? 'Not under a ward' : (ward?.commissionerName || 'Vacant');
  const councillorSlug = isOther ? null : `ward-${wardNumber}`;

  return (
    <div>
      {/* DMC */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: '#FEF3C7', border: '1px solid #FDE9B8', borderRadius: '12px', padding: '8px 16px' }}>
          <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'white', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
            {CITY_BODY.abbr}
          </span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#7A4406', lineHeight: 1.1 }}>{CITY_BODY.abbr}</div>
            <div style={{ fontSize: '10px', color: '#A66A1A' }}>{CITY_BODY.name}</div>
          </div>
        </div>
      </div>

      <div style={{ width: '1px', height: '14px', background: 'rgba(0,0,0,0.12)', margin: '0 auto' }} />

      {/* Two wings */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Elected board */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(28,28,28,0.35)', letterSpacing: '0.5px', textAlign: 'center', marginBottom: '8px' }}>
            ELECTED BOARD
          </div>
          {ELECTED_BOARD.map((m, i) => (
            <div key={m.slug}>
              {i > 0 && <Connector />}
              <Node role={m.role} name={m.name} slug={m.slug} />
            </div>
          ))}
          <Connector />
          <Node role="Ward Councillor" name={councillorName} slug={councillorSlug} highlight />
        </div>

        {/* Administration */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(28,28,28,0.35)', letterSpacing: '0.5px', textAlign: 'center', marginBottom: '8px' }}>
            ADMINISTRATION
          </div>
          <Node role={ADMINISTRATION.role} name={ADMINISTRATION.name} slug={ADMINISTRATION.slug} />
        </div>
      </div>

      {/* Your representatives */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '16px', paddingTop: '12px' }}>
        <div style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(28,28,28,0.35)', letterSpacing: '0.5px', textAlign: 'center', marginBottom: '12px' }}>
          YOUR REPRESENTATIVES
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <RepCard name={councillorName} role="Ward councillor" party={ward?.commissionerParty} slug={councillorSlug} avatarColor="#F77F00" />
          <RepCard name={MLA.name} role="MLA" party={MLA.party} slug="mla" avatarColor="#DC2626" />
          <RepCard name={MP.name} role="MP" party={MP.party} slug="mp" avatarColor="#7C3AED" />
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.35)', textAlign: 'center', marginTop: '12px' }}>
          Tap any card for contact options
        </div>
      </div>
    </div>
  );
}
