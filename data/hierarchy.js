// Dibrugarh Municipal Corporation (DMC) accountability structure shown on every
// report. DMC splits into two wings:
//   • Elected board:   Mayor → Deputy Mayor → Ward Councillor (senior → local)
//   • Administration:  Commissioner, DMC (appointed)
// Plus a "Your representatives" card: Ward Councillor, MLA, MP.

export const CITY_BODY = {
  abbr: 'DMC',
  name: 'Dibrugarh Municipal Corporation',
};

// City-wide elected posts (senior → local). The Ward Councillor is ward-specific
// and is appended at render time from data/wards.js.
export const ELECTED_BOARD = [
  { role: 'Mayor', name: 'Dr. Saikat Patra', slug: 'mayor' },
  { role: 'Deputy Mayor', name: 'Ujjal Phukon', slug: 'deputy-mayor' },
];

// Appointed administrative head.
export const ADMINISTRATION = {
  role: 'Commissioner, DMC',
  name: 'Navas Kumar Das',
  slug: 'commissioner-dmc',
};
