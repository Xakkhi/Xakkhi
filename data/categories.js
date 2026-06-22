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
  drainage: {
    id: 'drainage',
    label: 'Drainage',
    emoji: '💧',
    color: '#0891B2',
    subTypes: ['Cover Missing', 'Fully Blocked', 'Overflowing', 'No Concrete Drain', 'Damaged Slab'],
    severities: {
      minor: 'Slow flow or a cracked slab still in place',
      moderate: 'Standing water, partial blockage or one cover missing',
      severe: 'Fully blocked / overflowing onto road, or covers missing in a busy area',
      critical: 'Sewage backflow or long open stretch — public-health & fall hazard',
    },
  },
  streetlight: {
    id: 'streetlight',
    label: 'Streetlight & Wires',
    emoji: '💡',
    color: '#CA8A04',
    subTypes: ['No Streetlights', 'Non-functional Streetlight', 'Wires Exposed', 'Tangled Overhead Wires', 'Transformer Risk'],
    severities: {
      minor: 'One light flickering',
      moderate: 'One streetlight completely off',
      severe: 'Multiple lights out, or tangled overhead wires',
      critical: 'Whole road dark, exposed wires or transformer risk (electrocution)',
    },
  },
  flooding: {
    id: 'flooding',
    label: 'Artificial Flooding',
    emoji: '🌊',
    color: '#2563EB',
    subTypes: ['Waterlogged Area', 'Pipeline Leakage', 'Poor Drainage'],
    severities: {
      minor: 'Shallow puddling that clears slowly',
      moderate: 'Ankle-deep waterlogging across part of the road',
      severe: 'Knee-deep flooding blocking movement',
      critical: 'Widespread flooding entering homes or shops',
    },
  },
  riverbank: {
    id: 'riverbank',
    label: 'Riverbank & Wetlands',
    emoji: '🏞️',
    color: '#15803D',
    subTypes: ['Erosion', 'Embankment Issues', 'Garbage Dumping', 'Wetland Destruction'],
    severities: {
      minor: 'Minor erosion or scattered dumping at the edge',
      moderate: 'Noticeable bank erosion or embankment cracks',
      severe: 'Significant erosion threatening structures, or active wetland filling',
      critical: 'Embankment breach risk or large-scale wetland destruction',
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
