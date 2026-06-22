import { WARDS, OTHER_AREA } from '../data/wards';
import { WARD_BOUNDARIES } from '../data/wardBoundaries';
import { SUBMISSION_AREA } from '../data/submissionArea';

// Reports may be filed anywhere inside the greater-Dibrugarh master-plan polygon.
export function isWithinDibrugarh(lat, lng) {
  return pointInPolygon(lat, lng, SUBMISSION_AREA);
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

// Distance from point (px,py) to segment (ax,ay)-(bx,by) in a planar approx.
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  const ex = px - cx;
  const ey = py - cy;
  return Math.sqrt(ex * ex + ey * ey);
}

// Shortest distance from a point to a polygon's boundary (x = lng, y = lat).
function distanceToPolygonEdge(lat, lng, polygon) {
  let min = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const d = distToSegment(
      lng, lat,
      polygon[i][1], polygon[i][0],
      polygon[j][1], polygon[j][0]
    );
    if (d < min) min = d;
  }
  return min;
}

// Snap distance (~55 m) for points just outside a ward — covers tiny gaps along
// shared ward edges. Beyond this, a point is treated as "Other areas".
const GAP_SNAP = 0.0005;

// Assign a point to the ward whose polygon contains it. A point in a thin gap
// between adjacent wards snaps to the nearest ward; anything further out (inside
// greater Dibrugarh but not in a ward) is "Other areas".
export function detectWard(lat, lng) {
  const matches = [];
  for (const [wardNum, coords] of Object.entries(WARD_BOUNDARIES)) {
    if (coords && coords.length >= 3 && pointInPolygon(lat, lng, coords)) {
      matches.push(Number(wardNum));
    }
  }

  if (matches.length === 1) {
    return WARDS.find((w) => w.wardNumber === matches[0]) || OTHER_AREA;
  }
  if (matches.length > 1) {
    // Overlapping boundaries — tie-break by nearest centroid among them.
    return nearestCentroid(lat, lng, matches) || OTHER_AREA;
  }

  // Outside every ward — snap to a ward only if we're hugging its edge.
  let nearest = null;
  let minDist = Infinity;
  for (const [wardNum, coords] of Object.entries(WARD_BOUNDARIES)) {
    if (!coords || coords.length < 3) continue;
    const d = distanceToPolygonEdge(lat, lng, coords);
    if (d < minDist) {
      minDist = d;
      nearest = Number(wardNum);
    }
  }
  if (nearest != null && minDist <= GAP_SNAP) {
    return WARDS.find((w) => w.wardNumber === nearest) || OTHER_AREA;
  }
  return OTHER_AREA;
}

// (Image compression moved to lib/image.js — the shared optimizer used by every
// upload point. ward-detector now only handles geo + the live-photo heuristic.)

// Returns true if file was likely taken now (within last 10 minutes)
export function isLivePhoto(file) {
  const tenMinutes = 10 * 60 * 1000;
  return Date.now() - file.lastModified < tenMinutes;
}
