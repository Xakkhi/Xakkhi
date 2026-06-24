// Generates social header/cover banners into brand/.
//   - X / Twitter header: 1500x500 (bottom-left kept clear for the avatar)
//   - Facebook cover:      1640x624
// Headless Chrome (correct Bengali), fonts embedded.
// To regenerate:  npm i -D puppeteer && node scripts/gen-banners.cjs
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

function pageHtml({ w, h, mark, head, sub, url, urlRight }) {
  const urlStyle = urlRight
    ? 'position:absolute;bottom:28px;right:40px;'
    : 'position:absolute;bottom:26px;left:50%;transform:translateX(-50%);';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${css}
*{margin:0;padding:0;box-sizing:border-box;}
</style></head><body>
<div style="width:${w}px;height:${h}px;background:#1C1C1C;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;text-align:center;">
  <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:${Math.round(head*0.18)}px;">
    <span style="font-family:'Fraunces',serif;font-weight:800;font-size:${mark}px;color:#fff;letter-spacing:-1px;">Xakkhi</span>
    <span style="font-family:'Noto Sans Bengali',sans-serif;font-weight:700;font-size:${Math.round(mark*0.87)}px;color:#F77F00;">সাক্ষী</span>
  </div>
  <div style="font-family:'Fraunces',serif;font-weight:800;font-size:${head}px;line-height:1.05;color:#fff;white-space:nowrap;">Report<span style="color:#F77F00;">.</span> <span style="color:#F77F00;">Track</span><span style="color:#F77F00;">.</span> Resolve<span style="color:#F77F00;">.</span></div>
  <div style="font-family:'DM Sans',sans-serif;font-weight:400;font-size:${sub}px;color:rgba(255,255,255,0.65);margin-top:${Math.round(head*0.2)}px;">Real-time map of civic issues in Dibrugarh</div>
  <div style="${urlStyle}font-family:'DM Sans',sans-serif;font-weight:700;font-size:${url}px;color:#F77F00;">xakkhi.in</div>
</div>
</body></html>`;
}

const banners = [
  { file: 'xakkhi-x-header-1500x500.png', w: 1500, h: 500, mark: 30, head: 66, sub: 24, url: 22, urlRight: true },
  { file: 'xakkhi-fb-cover-1640x624.png', w: 1640, h: 624, mark: 38, head: 86, sub: 30, url: 26, urlRight: false },
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  for (const b of banners) {
    const page = await browser.newPage();
    await page.setViewport({ width: b.w, height: b.h, deviceScaleFactor: 1 });
    await page.setContent(pageHtml(b), { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.screenshot({ path: path.join(root, 'brand', b.file), clip: { x: 0, y: 0, width: b.w, height: b.h } });
    await page.close();
    console.log('Wrote brand/' + b.file);
  }
  await browser.close();
})();
