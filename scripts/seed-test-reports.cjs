const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.startsWith('#')) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Ward centroids and spread radius for generating random points within each ward
const WARD_CENTERS = {
  1:  { lat: 27.4887, lng: 94.9341, r: 0.006 },
  2:  { lat: 27.4744, lng: 94.9350, r: 0.005 },
  3:  { lat: 27.4724, lng: 94.9244, r: 0.005 },
  4:  { lat: 27.4703, lng: 94.9170, r: 0.006 },
  5:  { lat: 27.4595, lng: 94.9086, r: 0.005 },
  6:  { lat: 27.4699, lng: 94.9026, r: 0.004 },
  7:  { lat: 27.4747, lng: 94.8909, r: 0.004 },
  8:  { lat: 27.4744, lng: 94.8985, r: 0.003 },
  9:  { lat: 27.4802, lng: 94.8981, r: 0.003 },
  10: { lat: 27.4824, lng: 94.8997, r: 0.002 },
  11: { lat: 27.4822, lng: 94.9028, r: 0.002 },
  12: { lat: 27.4733, lng: 94.9032, r: 0.003 },
  13: { lat: 27.4736, lng: 94.9054, r: 0.003 },
  14: { lat: 27.4740, lng: 94.9084, r: 0.003 },
  15: { lat: 27.4811, lng: 94.9117, r: 0.004 },
  16: { lat: 27.4836, lng: 94.9091, r: 0.004 },
  17: { lat: 27.4885, lng: 94.9154, r: 0.003 },
  18: { lat: 27.4832, lng: 94.9201, r: 0.004 },
  19: { lat: 27.4841, lng: 94.9292, r: 0.003 },
  20: { lat: 27.4867, lng: 94.9252, r: 0.003 },
  21: { lat: 27.4886, lng: 94.9259, r: 0.004 },
  22: { lat: 27.4935, lng: 94.9255, r: 0.005 },
};

// Report count per ward — varied: some hotspots, some quiet
const WARD_REPORT_COUNTS = {
  1: 3, 2: 5, 3: 7, 4: 10, 5: 8,
  6: 12, 7: 4, 8: 6, 9: 5, 10: 3,
  11: 4, 12: 9, 13: 7, 14: 10, 15: 6,
  16: 5, 17: 3, 18: 8, 19: 4, 20: 3,
  21: 5, 22: 6,
};

const CATEGORIES = ['garbage', 'pothole', 'drainage', 'streetlight', 'flooding', 'riverbank'];
const SEVERITIES = ['minor', 'moderate', 'severe', 'critical'];
const SUB_TYPES = {
  garbage: ['Household Waste', 'Construction Debris', 'Mixed Waste', 'E-Waste'],
  pothole: ['Single Pothole', 'Multiple Potholes', 'Road Sinking', 'Crack'],
  drainage: ['Cover Missing', 'Fully Blocked', 'Overflowing', 'No Concrete Drain', 'Damaged Slab'],
  streetlight: ['No Streetlights', 'Non-functional Streetlight', 'Wires Exposed', 'Tangled Overhead Wires', 'Transformer Risk'],
  flooding: ['Waterlogged Area', 'Pipeline Leakage', 'Poor Drainage'],
  riverbank: ['Erosion', 'Embankment Issues', 'Garbage Dumping', 'Wetland Destruction'],
};
const LANDMARKS = [
  'Near bus stop', 'Behind temple', 'Main road junction', 'Near school gate',
  'Opposite market', 'Near hospital', 'Lane 3 corner', 'Bridge approach',
  'Near pond', 'Colony entrance', 'Behind mosque', 'Near post office',
  'Beside railway crossing', 'Near water tank', 'Main drain side',
  'Near community hall', 'Beside park', 'Near petrol pump',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function jitter(center, radius) {
  return center + (Math.random() - 0.5) * 2 * radius;
}

async function seed() {
  const rows = [];

  for (const [wardStr, count] of Object.entries(WARD_REPORT_COUNTS)) {
    const wardNum = Number(wardStr);
    const { lat, lng, r } = WARD_CENTERS[wardNum];

    for (let i = 0; i < count; i++) {
      const cat = pick(CATEGORIES);
      const sev = pick(SEVERITIES);
      // Bias hotspot wards toward higher severity
      const finalSev = count >= 10 && Math.random() < 0.4
        ? pick(['severe', 'critical'])
        : sev;

      const daysAgo = Math.floor(Math.random() * 30);
      const created = new Date(Date.now() - daysAgo * 86400000).toISOString();

      rows.push({
        category: cat,
        sub_category: pick(SUB_TYPES[cat]),
        severity: finalSev,
        status: Math.random() < 0.15 ? 'resolved' : 'unresolved',
        lat: jitter(lat, r),
        lng: jitter(lng, r),
        ward_number: wardNum,
        description: `${pick(LANDMARKS)} — ${cat} issue`,
        photo_url: null,
        seen_count: Math.floor(Math.random() * 20),
        created_at: created,
      });
    }
  }

  console.log(`Inserting ${rows.length} test reports...`);

  // Insert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { data, error } = await supabase.from('reports').insert(batch);
    if (error) {
      console.error('Insert error:', error);
      return;
    }
    console.log(`  Batch ${Math.floor(i / 50) + 1} inserted (${batch.length} rows)`);
  }

  console.log('Done! Total:', rows.length);
}

seed();
