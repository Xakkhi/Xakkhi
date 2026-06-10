// Dibrugarh Municipal Corporation (DMC) accountability hierarchy.
//
// Two distinct groups:
//   1. EXECUTIVE  — appointed officers (bureaucracy). Top of chain = Commissioner,
//      frontline = Sanitary Inspector. Standard ULB designations used as placeholders.
//   2. ELECTED    — elected board members (Ward Commissioner, Deputy Mayor, Mayor).
//
// Ward-specific people (Ward Commissioner) come from data/wards.js at render time.

// The civic body the ward's sanitation reports route through.
export const CITY_BODY = {
  abbr: 'DMC',
  name: 'Sanitation Wing',
  sub: 'Reports to DMC',
};

// Appointed officer chain — ordered top (most senior) → bottom (frontline).
export const EXECUTIVE_CHAIN = [
  { abbr: 'COMM', role: 'Commissioner', desc: 'DMC head · Top of chain', slug: 'commissioner-dmc' },
  { abbr: 'AC', role: 'Additional Commissioner', desc: 'Administrative oversight', slug: null },
  { abbr: 'EE', role: 'Executive Engineer', desc: 'Engineering oversight', slug: null },
  { abbr: 'JE', role: 'Junior Engineer', desc: 'Works supervision', slug: null },
  { abbr: 'SI', role: 'Sanitary Inspector', desc: 'Frontline ward officer', slug: null },
];

// Elected board members above the ward commissioner (city-wide posts).
export const ELECTED_BOARD = [
  { role: 'Deputy Mayor', name: 'Ujjal Phukon', slug: 'deputy-mayor' },
  { role: 'Mayor', name: 'Dr. Saikat Patra', slug: 'mayor' },
];
