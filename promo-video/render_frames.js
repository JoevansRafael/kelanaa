// Capture every frame (60 fps) as JPEG into out/frames using N parallel pages.
// Usage: node render_frames.js [workers=6] [from=0] [to=all]
const fs = require('fs');
const path = require('path');
const { ROOT, launch, openStage, capture } = require('./lib/browser');

(async () => {
  const W = +(process.argv[2] || 6);
  const dir = path.join(ROOT, 'out', 'frames');
  fs.mkdirSync(dir, { recursive: true });
  const browser = await launch();
  const probe = await openStage(browser);
  const { DURATION, FPS } = await probe.page.evaluate(() => ({ DURATION: window.KELANA.DURATION, FPS: window.KELANA.FPS }));
  await probe.page.close();
  const total = Math.round(DURATION * FPS);
  const from = +(process.argv[3] || 0), to = +(process.argv[4] || total);
  console.log(`frames ${from}..${to - 1} of ${total} with ${W} workers`);
  const t0 = Date.now();
  let next = from, done = 0;
  async function worker(id) {
    const st = await openStage(browser);
    while (true) {
      const f = next++;
      if (f >= to) break;
      const buf = await capture(st, f / FPS, 'jpeg', 94);
      fs.writeFileSync(path.join(dir, `f_${String(f).padStart(5, '0')}.jpg`), buf);
      if (++done % 240 === 0) console.log(`${done}/${to - from} frames · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    await st.page.close();
  }
  await Promise.all(Array.from({ length: W }, (_, i) => worker(i)));
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close();
})();
