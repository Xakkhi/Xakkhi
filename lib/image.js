// ─────────────────────────────────────────────────────────────────────────────
// Image compression engine — runs in the browser, needs NO permissions.
//
// One optimizer used by every upload point (report photo, cleanup photo, flag
// photo). For each picked/captured image it:
//   1. rejects non-images and absurdly large inputs up front (friendly errors),
//   2. scales the dimensions down to a sane maximum,
//   3. steps quality down until the file is under a target size,
//   4. re-encodes via <canvas>, which also STRIPS EXIF (hidden GPS/device data),
//   5. outputs WebP (≈30% smaller) where supported, JPEG otherwise.
//
// The big original never leaves the device — only the optimized blob is uploaded.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS = {
  maxDimension: 1600,   // longest side, in pixels
  targetKB: 400,        // aim for files at/under this size
  minQuality: 0.4,      // don't degrade past this
  maxInputMB: 25,       // refuse to even process inputs bigger than this
  format: null,         // null = auto (WebP if supported, else JPEG)
};

export class NotAnImageError extends Error {}
export class ImageTooLargeError extends Error {}

// Map a mime type to a file extension for the upload filename.
export function extForMime(mime) {
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/png') return 'png';
  return 'jpg';
}

export async function optimizeImage(file, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw new NotAnImageError('Please choose a photo (an image file).');
  }
  if (file.size > cfg.maxInputMB * 1024 * 1024) {
    throw new ImageTooLargeError(`That photo is too large. Please use one under ${cfg.maxInputMB} MB.`);
  }

  const img = await loadImage(await readAsDataURL(file));

  let width = img.width;
  let height = img.height;
  if (width > cfg.maxDimension || height > cfg.maxDimension) {
    const ratio = Math.min(cfg.maxDimension / width, cfg.maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  const format = cfg.format || pickFormat(canvas);

  let quality = 0.85;
  let blob = await toBlob(canvas, format, quality);
  while (blob && blob.size > cfg.targetKB * 1024 && quality > cfg.minQuality) {
    quality = Math.round((quality - 0.1) * 100) / 100;
    blob = await toBlob(canvas, format, quality);
  }
  return blob; // a Blob whose .type is the chosen format
}

// ── internals ────────────────────────────────────────────────────────────────

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target.result);
    r.onerror = () => reject(new Error('Could not read the photo.'));
    r.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Could not open the photo.'));
    i.src = src;
  });
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// Prefer WebP, but fall back to JPEG on browsers that can't encode it.
function pickFormat(canvas) {
  try {
    if (canvas.toDataURL('image/webp').startsWith('data:image/webp')) return 'image/webp';
  } catch {
    /* fall through */
  }
  return 'image/jpeg';
}
