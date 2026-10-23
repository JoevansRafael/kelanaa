// Usage: node stills.js 0.5 2.2 4.8 ...   -> out/stills/t_<time>.png  (+ contact sheet)
const fs = require('fs');
const path = require('path');
const { ROOT, launch, openStage, capture } = require('./lib/browser');

(async () => {
  const times = process.argv.slice(2).map(Number);
  const dir = path.join(ROOT, 'out', 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const b = await launch();
  const st = await openStage(b);
  for (const t of times) {
    const t0 = Date.now();
    const buf = await capture(st, t, 'jpeg', 85);
    const f = path.join(dir, `t_${t.toFixed(2)}.jpg`);
    fs.writeFileSync(f, buf);
    console.log(f, Date.now() - t0, 'ms');
  }
  await b.close();
})();
