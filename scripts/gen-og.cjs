// Generates app/opengraph-image.png (1200x630) — the social share card.
// Rendered with resvg (proper Bengali shaping) using the real brand fonts.
// Run:  node scripts/gen-og.cjs
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fdir = path.join(__dirname, 'og-fonts');

const W = 1200, H = 630, cx = W / 2;
const ORANGE = '#F77F00', WHITE = '#FFFFFF', INK = '#1C1C1C';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${INK}"/>

  <text x="${cx}" y="232" text-anchor="middle" font-family="Fraunces" font-weight="800">
    <tspan font-size="60" fill="${WHITE}">Xakkhi</tspan><tspan font-family="Noto Sans Bengali" font-size="52" fill="${ORANGE}" dx="14">সাক্ষী</tspan>
  </text>

  <text x="${cx}" y="350" text-anchor="middle" font-family="Fraunces" font-weight="800" font-size="92">
    <tspan fill="${WHITE}">Report</tspan><tspan fill="${ORANGE}">. </tspan><tspan fill="${ORANGE}">Track</tspan><tspan fill="${ORANGE}">. </tspan><tspan fill="${WHITE}">Resolve</tspan><tspan fill="${ORANGE}">.</tspan>
  </text>

  <text x="${cx}" y="420" text-anchor="middle" font-family="DM Sans" font-weight="400" font-size="38" fill="${WHITE}" fill-opacity="0.65">Real-time map of civic issues in Dibrugarh</text>

  <text x="${cx}" y="582" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="30" fill="${ORANGE}">xakkhi.in</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: {
    fontFiles: [
      path.join(fdir, 'Fraunces-800.ttf'),
      path.join(fdir, 'NotoSansBengali-700.ttf'),
      path.join(fdir, 'DMSans-400.ttf'),
      path.join(fdir, 'DMSans-700.ttf'),
    ],
    loadSystemFonts: false,
    defaultFontFamily: 'DM Sans',
  },
});

fs.writeFileSync(path.join(root, 'app', 'opengraph-image.png'), resvg.render().asPng());
console.log('Wrote app/opengraph-image.png');
