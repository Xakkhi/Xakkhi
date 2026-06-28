// Generates two square (1080x1080) "Coming soon" posts into brand/.
//   coming-soon-wordmark.png  — wordmark only
//   coming-soon-logo.png      — pin-eye logo + wordmark + radar rings
// To regenerate:  npm i -D puppeteer && node scripts/gen-coming-soon.cjs
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fdir = path.join(__dirname, 'og-fonts');
const b64 = (f) => fs.readFileSync(path.join(fdir, f)).toString('base64');
const font = (fam, w, f) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/ttf;base64,${b64(f)}) format('truetype');}`;
const css = [font('Fraunces',800,'Fraunces-800.ttf'),font('Noto Sans Bengali',700,'NotoSansBengali-700.ttf'),font('DM Sans',400,'DMSans-400.ttf'),font('DM Sans',700,'DMSans-700.ttf')].join('');

const S = 1080, ORANGE = '#F77F00';

const eyebrow = `<div style="font-family:'DM Sans';font-weight:700;font-size:48px;letter-spacing:14px;color:${ORANGE};text-transform:uppercase;">Coming Soon</div>`;
const wordmark = (x) => `<div style="display:flex;align-items:baseline;gap:12px;"><span style="font-family:'Fraunces';font-weight:800;font-size:${x}px;color:#fff;letter-spacing:-1px;">Xakkhi</span><span style="font-family:'Noto Sans Bengali';font-weight:700;font-size:${Math.round(x*0.86)}px;color:${ORANGE};">সাক্ষী</span></div>`;
const tagline = `<div style="font-family:'DM Sans';font-size:26px;letter-spacing:5px;color:rgba(255,255,255,0.45);text-transform:uppercase;">Dibrugarh's Civic Eye</div>`;
const foot = `<div style="position:absolute;bottom:54px;left:0;right:0;text-align:center;"><div style="font-family:'DM Sans';font-weight:700;font-size:30px;color:${ORANGE};">xakkhi.in</div><div style="font-family:'DM Sans';font-size:22px;color:rgba(255,255,255,0.4);margin-top:6px;">@xakkhi.dibrugarh</div></div>`;

const pinEye = `<svg width="240" height="290" viewBox="0 0 240 290"><path d="M120,28 C68,28 30,66 30,116 C30,172 92,214 120,276 C148,214 210,172 210,116 C210,66 172,28 120,28 Z" fill="${ORANGE}"/><circle cx="120" cy="112" r="72" fill="#1C1C1C"/><path d="M64,112 Q120,72 176,112 Q120,152 64,112 Z" fill="#fff"/><circle cx="120" cy="112" r="30" fill="${ORANGE}"/><circle cx="120" cy="112" r="15" fill="#1C1C1C"/><circle cx="129" cy="103" r="5" fill="#fff"/></svg>`;
const ring = (size, op) => `<div style="position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);width:${size}px;height:${size}px;border-radius:50%;border:2px solid rgba(247,127,0,${op});"></div>`;

function wordmarkOnly() {
  return `<div style="width:${S}px;height:${S}px;background:radial-gradient(circle at 50% 45%,#262626,#141414);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;position:relative;">
    ${eyebrow}
    ${wordmark(150)}
    ${tagline}
  </div>`;
}
function logoVersion() {
  return `<div style="width:${S}px;height:${S}px;background:radial-gradient(circle at 50% 38%,#2a2a2a,#141414);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;">
    <div style="position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);width:30%;height:30%;border-radius:50%;background:radial-gradient(circle,rgba(247,127,0,0.22),rgba(247,127,0,0));"></div>
    ${ring(360,0.5)}${ring(540,0.34)}${ring(720,0.2)}${ring(900,0.1)}
    <div style="position:relative;margin-top:-40px;">${pinEye}</div>
    <div style="position:relative;margin-top:26px;">${wordmark(104)}</div>
    <div style="position:relative;margin-top:24px;">${eyebrow}</div>
  </div>`;
}

const slides = [
  { name: 'coming-soon-wordmark', html: wordmarkOnly() },
  { name: 'coming-soon-logo', html: logoVersion() },
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  for (const s of slides) {
    const page = await browser.newPage();
    await page.setViewport({ width: S, height: S, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css} *{margin:0;padding:0;box-sizing:border-box;}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.screenshot({ path: path.join(root, 'brand', s.name + '.png'), clip: { x: 0, y: 0, width: S, height: S } });
    await page.close();
    console.log('wrote brand/' + s.name + '.png');
  }
  await browser.close();
})();
