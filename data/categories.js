export const CATEGORIES = {
  garbage: {
    id: 'garbage',
    label: 'Garbage',
    emoji: '🗑️',
    color: '#DC2626',
    subTypes: ['Household Waste', 'Construction Debris', 'Mixed Waste', 'E-Waste', 'Biomedical'],
    severities: {
      minor: 'A few bags or scattered litter (under 1m²)',
      moderate: 'Noticeable heap, size of an auto-rickshaw (1–5m²)',
      severe: 'Sidewalk blocked or road edge piled up (5–20m²)',
      critical: 'Major illegal dumpsite, vacant plot or full road (20m²+)',
    },
  },
  pothole: {
    id: 'pothole',
    label: 'Pothole / Bad Road',
    emoji: '🕳️',
    color: '#EA580C',
    subTypes: ['Crack', 'Single Pothole', 'Multiple Potholes', 'Road Sinking', 'Surface Damage'],
    severities: {
      minor: 'Small surface crack or shallow hole (under 30cm wide)',
      moderate: 'Pothole that catches bike tires (30cm–1m wide)',
      severe: 'Multiple potholes or large hole (1–3m wide)',
      critical: 'Road completely broken / unusable (3m+ or full lane)',
    },
  },
  drain: {
    id: 'drain',
    label: 'Drain Blockage',
    emoji: '💧',
    color: '#0891B2',
    subTypes: ['Slow Drainage', 'Fully Blocked', 'Backflow', 'Sewage Mix', 'Mosquito Breeding'],
    severities: {
      minor: 'Slow water flow but functional',
      moderate: 'Standing water, partial blockage',
      severe: 'Fully blocked, overflowing onto road',
      critical: 'Sewage backflow, severe public health risk',
    },
  },
  openDrain: {
    id: 'openDrain',
    label: 'Open Drain',
    emoji: '⚠️',
    color: '#D97706',
    subTypes: ['Cover Missing', 'Partial Cover', 'Damaged Slab', "Children's Hazard"],
    severities: {
      minor: 'Slab cracked but in place',
      moderate: 'One cover missing in non-busy area',
      severe: 'Multiple covers missing or near schools/markets',
      critical: 'Long stretch fully open, immediate fall hazard',
    },
  },
  streetlight: {
    id: 'streetlight',
    label: 'Streetlight',
    emoji: '💡',
    color: '#CA8A04',
    subTypes: ['Flickering', 'Single Light Out', 'Multiple Out', 'Pole Damaged', 'Wires Exposed'],
    severities: {
      minor: 'One light flickering',
      moderate: 'One streetlight completely off',
      severe: 'Multiple lights out (entire street section)',
      critical: 'Whole road dark, exposed wires (electrocution risk)',
    },
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const SEVERITY_COLORS = {
  minor: '#D97706',
  moderate: '#F77F00',
  severe: '#DC2626',
  critical: '#1C1C1C',
};

export const STATUS_COLORS = {
  unresolved: '#DC2626',
  resolved: '#16A34A',
};
