// Usage: node sheet.js out.jpg t1 t2 ... (up to 9) -> 3x3 contact sheet from out/stills
const fs = require('fs');
const path = require('path');
const { ROOT, launch } = require('./lib/browser');
(async () => {
  const [outName, ...ts] = process.argv.slice(2);
  const imgs = ts.map(t => 'file://' + path.join(ROOT, 'out', 'stills', `t_${Number(t).toFixed(2)}.jpg`));
  const html = `<html><body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(3,640px);grid-auto-rows:360px;gap:0">${imgs.map((s, i) => `<div style="position:relative"><img src="${s}" style="width:640px;height:360px;display:block"><div style="position:absolute;left:6px;top:6px;background:#000a;color:#fff;font:bold 18px sans-serif;padding:2px 8px">${ts[i]}s</div></div>`).join('')}</body></html>`;
  const f = path.join(ROOT, 'out', 'sheet.html');
  fs.writeFileSync(f, html);
  const b = await launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 360 * Math.ceil(imgs.length / 3) } });
  await p.goto('file://' + f);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(ROOT, 'out', outName), type: 'jpeg', quality: 80 });
  await b.close();
})();
