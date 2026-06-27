// Generates the Instagram launch carousel (1080x1350) into brand/carousel/.
// Built/branded slides + your real app screenshots from brand/carousel-src/.
// To regenerate:  npm i -D puppeteer && node scripts/gen-carousel.cjs
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fdir = path.join(__dirname, 'og-fonts');
const src = path.join(root, 'brand', 'carousel-src');
const out = path.join(root, 'brand', 'carousel');
fs.mkdirSync(out, { recursive: true });

const b64 = (p) => fs.readFileSync(p).toString('base64');
const font = (fam, w, f) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/ttf;base64,${b64(path.join(fdir, f))}) format('truetype');}`;
const css = [font('Fraunces',800,'Fraunces-800.ttf'),font('Noto Sans Bengali',700,'NotoSansBengali-700.ttf'),font('DM Sans',400,'DMSans-400.ttf'),font('DM Sans',700,'DMSans-700.ttf')].join('');
const shot = (name) => `data:image/jpeg;base64,${b64(path.join(src, name))}`;

const W = 1080, H = 1350;
const ORANGE = '#F77F00', INK = '#1C1C1C', WHITE = '#fff';

const wordmark = (size) => `<div style="display:flex;align-items:baseline;gap:8px;"><span style="font-family:'Fraunces';font-weight:800;font-size:${size}px;color:#fff;">Xakkhi</span><span style="font-family:'Noto Sans Bengali';font-weight:700;font-size:${Math.round(size*0.87)}px;color:${ORANGE};">সাক্ষী</span></div>`;
const footer = (color) => `<div style="position:absolute;bottom:46px;left:0;right:0;text-align:center;font-family:'DM Sans';font-weight:700;font-size:30px;color:${color};">xakkhi.in</div>`;

// ── slide builders ───────────────────────────────────────────────────────────
function cover() {
  return `<div style="width:${W}px;height:${H}px;background:${INK};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;">
    <div style="position:absolute;top:64px;left:50%;transform:translateX(-50%);">${wordmark(54)}</div>
    <div style="font-family:'Fraunces';font-weight:800;font-size:104px;line-height:1.08;color:#fff;">Report<span style="color:${ORANGE}">.</span><br><span style="color:${ORANGE}">Track</span><span style="color:${ORANGE}">.</span><br>Resolve<span style="color:${ORANGE}">.</span></div>
    <div style="font-family:'DM Sans';font-size:34px;color:rgba(255,255,255,0.65);margin-top:34px;">Real-time civic map of Dibrugarh</div>
    <div style="position:absolute;bottom:54px;font-family:'DM Sans';font-weight:700;font-size:30px;color:${ORANGE};">swipe to see how →</div>
  </div>`;
}
function brand() {
  return `<div style="width:${W}px;height:${H}px;background:radial-gradient(circle at 50% 42%,#2a2a2a,#141414);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;padding:0 80px;box-sizing:border-box;">
    <div style="font-family:'Fraunces';font-weight:800;font-size:88px;color:#fff;">Xakkhi <span style="font-family:'Noto Sans Bengali';font-weight:700;color:${ORANGE};font-size:74px;">সাক্ষী</span></div>
    <div style="font-family:'DM Sans';font-size:26px;letter-spacing:5px;color:rgba(255,255,255,0.5);text-transform:uppercase;margin-top:18px;">Dibrugarh's Civic Eye</div>
    <div style="width:120px;height:2px;background:rgba(255,255,255,0.15);margin:46px 0;"></div>
    <div style="font-family:'DM Sans';font-size:38px;line-height:1.5;color:rgba(255,255,255,0.9);">A <b style="color:#fff;">free, anonymous</b> platform to report &amp; track civic issues — citizens and the administration, together.</div>
  </div>`;
}
function categories() {
  const items = [['🗑️','Garbage'],['🕳️','Potholes / bad roads'],['💧','Drainage'],['💡','Streetlights & wires'],['🌊','Artificial flooding'],['🏞️','Riverbank & wetlands']];
  return `<div style="width:${W}px;height:${H}px;background:#FAFAF8;display:flex;flex-direction:column;justify-content:center;position:relative;padding:0 90px;box-sizing:border-box;">
    <div style="font-family:'Fraunces';font-weight:800;font-size:74px;line-height:1.1;color:${INK};">Report anything<br>that needs fixing.</div>
    <div style="margin-top:54px;display:flex;flex-direction:column;gap:30px;">
      ${items.map(([e,t])=>`<div style="display:flex;align-items:center;gap:22px;font-family:'DM Sans';font-weight:700;font-size:40px;color:${INK};"><span style="font-size:44px;">${e}</span>${t}</div>`).join('')}
    </div>
    <div style="margin-top:54px;font-family:'DM Sans';font-size:28px;color:rgba(28,28,28,0.5);">…tracked ward by ward, till it's resolved.</div>
  </div>`;
}
function cta() {
  return `<div style="width:${W}px;height:${H}px;background:${INK};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;">
    <div style="position:absolute;top:64px;left:50%;transform:translateX(-50%);">${wordmark(46)}</div>
    <div style="font-family:'Fraunces';font-weight:800;font-size:80px;line-height:1.12;color:#fff;">Submit your first<br>report now!</div>
    <div style="font-family:'DM Sans';font-size:34px;color:rgba(255,255,255,0.65);margin-top:30px;">Open it now — share with your ward.</div>
    <div style="margin-top:52px;background:${ORANGE};color:${INK};font-family:'DM Sans';font-weight:800;font-size:40px;padding:20px 50px;border-radius:50px;">xakkhi.in</div>
    <div style="position:absolute;bottom:54px;font-family:'DM Sans';font-size:28px;color:rgba(255,255,255,0.5);">@xakkhi.dibrugarh</div>
  </div>`;
}
function shotSlide(caption, sub, file) {
  return `<div style="width:${W}px;height:${H}px;background:${INK};position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;">
    <div style="text-align:center;padding:70px 70px 0;">
      <div style="font-family:'Fraunces';font-weight:800;font-size:62px;line-height:1.08;color:#fff;">${caption}</div>
      <div style="font-family:'DM Sans';font-size:30px;color:${ORANGE};font-weight:700;margin-top:14px;">${sub}</div>
    </div>
    <div style="flex:1;width:100%;display:flex;align-items:center;justify-content:center;min-height:0;">
      <div id="frame" style="width:560px;overflow:hidden;border-radius:28px;box-shadow:0 18px 50px rgba(0,0,0,0.45);background:#000;">
        <img id="shot" src="${file}" style="width:560px;display:block;"/>
      </div>
    </div>
  </div>`;
}

const slides = [
  { name: '1-cover', html: cover() },
  { name: '2-brand', html: brand() },
  { name: '3-map', html: shotSlide('Every issue,<br>live on one map.', 'Colour-coded by severity', shot('map.jpg')) },
  { name: '4-categories', html: categories() },
  { name: '5-report-photo', html: shotSlide('Snap a live photo.', 'On the spot · no gallery uploads', shot('report-photo.jpg')) },
  { name: '6-report-types', html: shotSlide('Pick type &amp; severity.', 'Garbage, drainage, roads & more', shot('report-types.jpg')) },
  { name: '7-report-submit', html: shotSlide('Submit, anonymously.', 'No login · no personal data', shot('report-submit.jpg')) },
  { name: '8-cta', html: cta() },
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  for (const s of slides) {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css} *{margin:0;padding:0;box-sizing:border-box;}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const img = document.getElementById('shot');
      if (img) {
        if (img.decode) { try { await img.decode(); } catch (e) {} }
        const dispH = img.clientHeight;            // rendered at width 560
        const cropTop = dispH * 0.115;             // status bar + browser URL/tabs
        const cropBot = dispH * 0.05;              // android system nav
        const frame = document.getElementById('frame');
        frame.style.height = (dispH - cropTop - cropBot) + 'px';
        img.style.marginTop = (-cropTop) + 'px';
      }
    });
    await page.screenshot({ path: path.join(out, s.name + '.png'), clip: { x: 0, y: 0, width: W, height: H } });
    await page.close();
    console.log('wrote brand/carousel/' + s.name + '.png');
  }
  await browser.close();
})();
