// Generates the app/touch icons + favicon.ico from app/icon.svg.
// Outputs are committed; only run this when app/icon.svg changes.
// To regenerate:  npm i -D sharp png-to-ico && node scripts/gen-icons.cjs
// (sharp / png-to-ico are intentionally NOT committed dependencies.)
const sharp = require('sharp');
const _pti = require('png-to-ico');
const pngToIco = typeof _pti === 'function' ? _pti : _pti.default;
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(root, 'app', 'icon.svg'));

(async () => {
  await sharp(svg).resize(180, 180).png().toFile(path.join(root, 'app', 'apple-icon.png'));
  await sharp(svg).resize(192, 192).png().toFile(path.join(root, 'public', 'icon-192.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(root, 'public', 'icon-512.png'));

  const p32 = await sharp(svg).resize(32, 32).png().toBuffer();
  const p16 = await sharp(svg).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(root, 'app', 'favicon.ico'), await pngToIco([p16, p32]));

  console.log('Icons generated: app/apple-icon.png, app/favicon.ico, public/icon-192.png, public/icon-512.png');
})();
