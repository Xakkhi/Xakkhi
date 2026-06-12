import { WARDS, CITY_BOUNDS } from '../data/wards';
import { WARD_BOUNDARIES } from '../data/wardBoundaries';

export function isWithinDibrugarh(lat, lng) {
  return (
    lat >= CITY_BOUNDS.south &&
    lat <= CITY_BOUNDS.north &&
    lng >= CITY_BOUNDS.west &&
    lng <= CITY_BOUNDS.east
  );
}

// Ray-casting point-in-polygon. `polygon` is an array of [lat, lng] vertices.
// We treat x = lng, y = lat consistently.
function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i][0];
    const xi = polygon[i][1];
    const yj = polygon[j][0];
    const xj = polygon[j][1];
    const intersect =
      (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function nearestCentroid(lat, lng, restrictTo) {
  let nearest = null;
  let minDist = Infinity;
  for (const ward of WARDS) {
    if (restrictTo && !restrictTo.includes(ward.wardNumber)) continue;
    const dlat = lat - ward.lat;
    const dlng = lng - ward.lng;
    const dist = dlat * dlat + dlng * dlng;
    if (dist < minDist) {
      minDist = dist;
      nearest = ward;
    }
  }
  return nearest;
}

// Assign a point to a ward by the actual boundary it falls inside (accurate),
// falling back to nearest centroid only for points that land outside every
// polygon (gaps between rough boundaries).
export function detectWard(lat, lng) {
  const matches = [];
  for (const [wardNum, coords] of Object.entries(WARD_BOUNDARIES)) {
    if (coords && coords.length >= 3 && pointInPolygon(lat, lng, coords)) {
      matches.push(Number(wardNum));
    }
  }

  if (matches.length === 1) {
    return WARDS.find((w) => w.wardNumber === matches[0]) || null;
  }
  if (matches.length > 1) {
    // Overlapping rough boundaries — tie-break by nearest centroid among them.
    return nearestCentroid(lat, lng, matches);
  }
  // Point outside all polygons — fall back to nearest centroid across all wards.
  return nearestCentroid(lat, lng, null);
}

// Compress a File to JPEG under maxKB before upload
export async function compressPhoto(file, maxKB = 500) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1280;
        let w = img.width;
        let h = img.height;

        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        let quality = 0.85;
        const tryBlob = () => {
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > maxKB * 1024 && quality > 0.2) {
                quality -= 0.1;
                tryBlob();
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            quality
          );
        };
        tryBlob();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Returns true if file was likely taken now (within last 10 minutes)
export function isLivePhoto(file) {
  const tenMinutes = 10 * 60 * 1000;
  return Date.now() - file.lastModified < tenMinutes;
}
