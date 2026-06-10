'use client';

import Link from 'next/link';
import { MLA, MP } from '../data/wards';
import { CITY_BODY, EXECUTIVE_CHAIN, ELECTED_BOARD } from '../data/hierarchy';

const PARTY_COLORS = { BJP: '#F77F00', INC: '#19AAED', AGP: '#16A34A', default: '#6B7280' };

// ─── Building blocks ─────────────────────────────────────────────────────────

function Connector() {
  return <div style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.12)', margin: '0 auto' }} />;
}

function OfficerNode({ abbr, role, desc, slug }) {
  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: '#DBEAFE', color: '#2563EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '800', fontSize: '13px', letterSpacing: '0.3px',
      }}>
        {abbr}
      </div>
      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1C1C1C', marginTop: '8px' }}>{role}</div>
      <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.4)', marginTop: '1px' }}>{desc}</div>
    </div>
  );
  return slug ? (
    <Link href={`/official/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</Link>
  ) : inner;
}

function RepCard({ name, role, party, slug, avatarColor }) {
  const partyColor = PARTY_COLORS[party] || PARTY_COLORS.default;
  const initials = name && name !== 'Vacant'
    ? name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('')
    : '—';

  const card = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '14px',
        background: avatarColor || '#F1F1EE',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '800', fontSize: '20px', color: 'white',
        overflow: 'hidden',
      }}>
        {initials}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '800', color: '#1C1C1C', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
        {name}
      </div>
      <div style={{ fontSize: '11px', marginTop: '2px' }}>
        {party && <span style={{ color: partyColor, fontWeight: '800' }}>{party}</span>}
        {party && <span style={{ color: 'rgba(28,28,28,0.3)' }}> · </span>}
        <span style={{ color: 'rgba(28,28,28,0.45)', fontWeight: '600' }}>{role}</span>
      </div>
    </div>
  );

  return slug ? (
    <Link href={`/official/${slug}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit', display: 'flex' }}>{card}</Link>
  ) : card;
}

// ─── Tree ────────────────────────────────────────────────────────────────────

export default function AccountabilityTree({ wardNumber, ward }) {
  const isVacant = !ward?.commissionerName;

  return (
    <div>
      {/* Your Ward pill */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2px' }}>
        <div style={{
          background: '#FFF0F0', border: '1px solid #FECACA', borderRadius: '14px',
          padding: '8px 18px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(220,38,38,0.6)', letterSpacing: '0.5px' }}>YOUR WARD</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#DC2626', marginTop: '1px' }}>
            {ward?.areaName || `Ward ${wardNumber}`} · #{wardNumber}
          </div>
        </div>
      </div>

      {/* Branch into department + ward commissioner */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '1px', height: '14px', background: 'rgba(0,0,0,0.12)' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'flex-start' }}>
        {/* Department node */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '13px',
          }}>
            {CITY_BODY.abbr}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#1C1C1C', marginTop: '8px' }}>{CITY_BODY.name}</div>
          <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.4)', marginTop: '1px' }}>{CITY_BODY.sub}</div>
        </div>

        {/* Ward commissioner node (vacancy-aware) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: isVacant ? '#F5F5F4' : '#FFF3E0',
            color: isVacant ? '#A8A29E' : '#F77F00',
            border: isVacant ? '1px solid #E7E5E4' : '1px solid #FFE0B2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '18px',
          }}>
            {isVacant ? '⚠️' : wardNumber}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: isVacant ? 'rgba(28,28,28,0.4)' : '#1C1C1C', marginTop: '8px' }}>
            Ward Commissioner
          </div>
          <div style={{ fontSize: '11px', color: isVacant ? '#D97706' : 'rgba(28,28,28,0.4)', marginTop: '1px' }}>
            {isVacant ? 'Currently vacant' : ward.commissionerName}
          </div>
        </div>
      </div>

      {/* Executive chain */}
      <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(28,28,28,0.35)', letterSpacing: '0.5px', textAlign: 'center', margin: '18px 0 8px' }}>
        EXECUTIVE · APPOINTED OFFICERS
      </div>
      {EXECUTIVE_CHAIN.map((node, i) => (
        <div key={node.abbr}>
          {i > 0 && <Connector />}
          <OfficerNode {...node} />
        </div>
      ))}

      {/* Elected board */}
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '18px 0' }} />
      <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(28,28,28,0.35)', letterSpacing: '0.5px', textAlign: 'center', marginBottom: '10px' }}>
        ELECTED BOARD
      </div>
      {ELECTED_BOARD.map((m) => (
        <Link
          key={m.slug}
          href={`/official/${m.slug}`}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderTop: '1px solid rgba(0,0,0,0.04)', textDecoration: 'none', color: 'inherit' }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1C1C1C' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>{m.name}</div>
            <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.45)' }}>{m.role}</div>
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(28,28,28,0.2)' }}>›</span>
        </Link>
      ))}

      {/* Elected representatives — photo cards */}
      <div style={{ height: '1px', borderTop: '1px dashed rgba(0,0,0,0.12)', margin: '18px 0 14px' }} />
      <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(28,28,28,0.35)', letterSpacing: '0.5px', textAlign: 'center', marginBottom: '14px' }}>
        YOUR REPRESENTATIVES
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <RepCard
          name={ward?.commissionerName || 'Vacant'}
          role="Ward Commissioner"
          party={ward?.commissionerParty}
          slug={`ward-${wardNumber}`}
          avatarColor="#F77F00"
        />
        <RepCard
          name={MLA.name}
          role="MLA"
          party={MLA.party}
          slug="mla"
          avatarColor="#DC2626"
        />
        <RepCard
          name={MP.name}
          role="MP"
          party={MP.party}
          slug="mp"
          avatarColor="#7C3AED"
        />
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(28,28,28,0.35)', textAlign: 'center', marginTop: '14px' }}>
        Tap any card for contact options
      </div>
    </div>
  );
}
