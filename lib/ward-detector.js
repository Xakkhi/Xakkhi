import { WARDS, CITY_BOUNDS } from '../data/wards';

export function isWithinDibrugarh(lat, lng) {
  return (
    lat >= CITY_BOUNDS.south &&
    lat <= CITY_BOUNDS.north &&
    lng >= CITY_BOUNDS.west &&
    lng <= CITY_BOUNDS.east
  );
}

export function detectWard(lat, lng) {
  let nearest = null;
  let minDist = Infinity;

  for (const ward of WARDS) {
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
