// Generates app/opengraph-image.png (1200x630) — the social share card.
// Rendered with headless Chrome (HarfBuzz) so complex Bengali shaping
// ("সাক্ষী") is correct. Fonts are embedded so it's deterministic/offline.
// The output PNG is committed; this only needs to run when the design changes.
// To regenerate:  npm i -D puppeteer && node scripts/gen-og.cjs
// (puppeteer is intentionally NOT a committed dependency — it would make
//  Vercel download Chromium on every build.)
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fdir = path.join(__dirname, 'og-fonts');
const b64 = (f) => fs.readFileSync(path.join(fdir, f)).toString('base64');

const fontFace = (family, weight, file) =>
  `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(data:font/ttf;base64,${b64(file)}) format('truetype');}`;

const css = [
  fontFace('Fraunces', 800, 'Fraunces-800.ttf'),
  fontFace('Noto Sans Bengali', 700, 'NotoSansBengali-700.ttf'),
  fontFace('DM Sans', 400, 'DMSans-400.ttf'),
  fontFace('DM Sans', 700, 'DMSans-700.ttf'),
].join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${css}
*{margin:0;padding:0;box-sizing:border-box;}
</style></head><body>
<div style="width:1200px;height:630px;background:#1C1C1C;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;font-family:'DM Sans',sans-serif;">
  <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:18px;">
    <span style="font-family:'Fraunces',serif;font-weight:800;font-size:60px;color:#fff;letter-spacing:-1px;">Xakkhi</span>
    <span style="font-family:'Noto Sans Bengali',sans-serif;font-weight:700;font-size:52px;color:#F77F00;">সাক্ষী</span>
  </div>
  <div style="font-family:'Fraunces',serif;font-weight:800;font-size:96px;line-height:1.1;color:#fff;white-space:nowrap;">Report<span style="color:#F77F00;">.</span> <span style="color:#F77F00;">Track</span><span style="color:#F77F00;">.</span> Resolve<span style="color:#F77F00;">.</span></div>
  <div style="font-family:'DM Sans',sans-serif;font-weight:400;font-size:38px;color:rgba(255,255,255,0.65);margin-top:18px;">Real-time map of civic issues in Dibrugarh</div>
  <div style="position:absolute;bottom:46px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:30px;color:#F77F00;">xakkhi.in</div>
</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.screenshot({
    path: path.join(root, 'app', 'opengraph-image.png'),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await browser.close();
  console.log('Wrote app/opengraph-image.png (1200x630)');
})();
