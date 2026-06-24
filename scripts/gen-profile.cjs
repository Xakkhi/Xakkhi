// Generates brand/xakkhi-profile-1024.png — the square social profile logo
// (pin-eye + "Xakkhi সাক্ষী" + tagline + 4 graduated radar rings).
// Rendered with headless Chrome (correct Bengali shaping), fonts embedded.
// To regenerate:  npm i -D puppeteer && node scripts/gen-profile.cjs
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fdir = path.join(__dirname, 'og-fonts');
const b64 = (f) => fs.readFileSync(path.join(fdir, f)).toString('base64');
const fontFace = (family, weight, file) =>
  `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(data:font/ttf;base64,${b64(file)}) format('truetype');}`;

const css = [
  fontFace('Fraunces', 900, 'Fraunces-800.ttf'),
  fontFace('Noto Sans Bengali', 700, 'NotoSansBengali-700.ttf'),
  fontFace('DM Sans', 400, 'DMSans-400.ttf'),
].join('');

const ring = (size, op, bw) =>
  `<div style="position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);width:${size}%;height:${size}%;border-radius:50%;border:${bw}px solid rgba(247,127,0,${op});"></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${css}
*{margin:0;padding:0;box-sizing:border-box;}
</style></head><body>
<div style="width:1024px;height:1024px;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;background:radial-gradient(circle at 50% 42%, #2a2a2a 0%, #1C1C1C 58%, #141414 100%);">
  <div style="position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);width:34%;height:34%;border-radius:50%;background:radial-gradient(circle, rgba(247,127,0,0.22) 0%, rgba(247,127,0,0) 70%);"></div>
  ${ring(42, 0.55, 3)}
  ${ring(62, 0.38, 3)}
  ${ring(82, 0.24, 2)}
  ${ring(102, 0.12, 2)}

  <svg width="40%" viewBox="0 0 240 290" style="display:block;margin-bottom:28px;position:relative;">
    <path d="M120,28 C68,28 30,66 30,116 C30,172 92,214 120,276 C148,214 210,172 210,116 C210,66 172,28 120,28 Z" fill="#F77F00"/>
    <circle cx="120" cy="112" r="72" fill="#1C1C1C"/>
    <path d="M64,112 Q120,72 176,112 Q120,152 64,112 Z" fill="#FFFFFF"/>
    <circle cx="120" cy="112" r="30" fill="#F77F00"/>
    <circle cx="120" cy="112" r="15" fill="#1C1C1C"/>
    <circle cx="129" cy="103" r="5" fill="#FFFFFF"/>
  </svg>

  <div style="font-family:'Fraunces',serif;font-weight:900;font-size:118px;color:#fff;letter-spacing:-2px;line-height:1;position:relative;">Xakkhi</div>
  <div style="font-family:'Noto Sans Bengali',sans-serif;font-weight:700;font-size:78px;color:#F77F00;margin-top:12px;line-height:1;position:relative;">সাক্ষী</div>
  <div style="font-size:28px;letter-spacing:8px;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-top:26px;position:relative;">Dibrugarh's Civic Eye</div>
</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.screenshot({ path: path.join(root, 'brand', 'xakkhi-profile-1024.png'), clip: { x: 0, y: 0, width: 1024, height: 1024 } });
  await browser.close();
  console.log('Wrote brand/xakkhi-profile-1024.png');
})();
