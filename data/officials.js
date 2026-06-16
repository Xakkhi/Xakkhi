// Direct Call / WhatsApp CTAs to officials are HIDDEN pending verification that
// each number is an officially-published public contact (not a personal mobile).
// Flip to true only after that audit + consent check. See PROGRESS.md / pre-release-security.
export const SHOW_OFFICIAL_CONTACT = false;

export const CITY_OFFICIALS = [
  {
    slug: 'mayor',
    name: 'Dr. Saikat Patra',
    role: 'Mayor',
    body: 'Dibrugarh Municipal Corporation',
    phone: '7002184138',
    wardNumber: 14,
    party: null,
  },
  {
    slug: 'deputy-mayor',
    name: 'Ujjal Phukon',
    role: 'Deputy Mayor',
    body: 'Dibrugarh Municipal Corporation',
    phone: '9954388449',
    wardNumber: 11,
    party: null,
  },
  {
    slug: 'commissioner-dmc',
    name: 'Navas Kumar Das',
    role: 'Commissioner, DMC',
    body: 'Dibrugarh Municipal Corporation',
    phone: null,
    wardNumber: null,
    party: null,
  },
  {
    slug: 'mla',
    name: 'Prasanta Phukan',
    role: 'MLA',
    body: 'Dibrugarh Legislative Assembly',
    phone: null,
    party: 'BJP',
  },
  {
    slug: 'mp',
    name: 'Sarbananda Sonowal',
    role: 'MP',
    body: 'Dibrugarh Lok Sabha',
    phone: null,
    party: 'BJP',
  },
];
