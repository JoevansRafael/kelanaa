// Prepares user assets for rendering (done in Chromium, no extra deps):
//  - photos: assets/photos/*.jpg  -> web/photos/<key>.jpg (max 2400px wide, sRGB JPEG)
//  - logo:   assets/photos/logo kelana.png -> web/photos/logo.png (white bg removed, trimmed)
const fs = require('fs');
const path = require('path');
const { ROOT, launch } = require('./lib/browser');

// source filename -> key used by the scenes
const MAP = {
  'padar.jpg': 'padar', 'pink_beach.jpg': 'pinkbeach', 'pulau komodo.jpg': 'komodo', 'manta point.jpg': 'manta',
  'labuan bajo.jpg': 'labuanbajo', 'bromo.jpg': 'bromo', 'raja ampat.jpg': 'rajaampat', 'candi_borobudur.jpg': 'borobudur',
  'sawah_bali.jpg': 'terraces', 'danau_toba.jpg': 'toba', 'gunung batur.jpg': 'batur', 'tugu jogja.jpg': 'jogja', 'pantai bali.jpg': 'balibeach',
};

(async () => {
  const src = path.join(ROOT, 'assets', 'photos');
  const dst = path.join(ROOT, 'web', 'photos');
  fs.mkdirSync(dst, { recursive: true });
  const b = await launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(ROOT, 'web', 'blank.html'));
  for (const [file, key] of Object.entries(MAP)) {
    const f = path.join(src, file);
    if (!fs.existsSync(f)) { console.log('missing', file); continue; }
    const out = await p.evaluate(async (url) => {
      const img = new Image(); img.src = url; await img.decode();
      const W = Math.min(2400, img.naturalWidth), H = Math.round(img.naturalHeight * W / img.naturalWidth);
      const c = new OffscreenCanvas(W, H); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, W, H);
      const blob = await c.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
      const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
      return { b64: btoa(s), W, H };
    }, 'file://' + f);
    fs.writeFileSync(path.join(dst, key + '.jpg'), Buffer.from(out.b64, 'base64'));
    console.log(`${file} -> ${key}.jpg ${out.W}x${out.H}`);
  }
  const logo = path.join(src, 'logo kelana.png');
  if (fs.existsSync(logo)) {
    const out = await p.evaluate(async (url) => {
      const img = new Image(); img.src = url; await img.decode();
      const W = img.naturalWidth, H = img.naturalHeight;
      const c = new OffscreenCanvas(W, H); const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, W, H), a = d.data;
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (let i = 0; i < W * H; i++) {
        const r = a[i * 4], g = a[i * 4 + 1], bl = a[i * 4 + 2];
        // whiteness -> transparency (keeps anti-aliased edges smooth)
        const wht = Math.min(r, g, bl) / 255, sat = (Math.max(r, g, bl) - Math.min(r, g, bl)) / 255;
        let al = a[i * 4 + 3] / 255 * Math.min(1, Math.max(0, (1 - wht) * 4 + sat * 3));
        if (al > 0.02) { // un-premultiply against white
          for (let k = 0; k < 3; k++) a[i * 4 + k] = Math.max(0, Math.min(255, Math.round((a[i * 4 + k] - 255 * (1 - al)) / al)));
          const px = i % W, py = (i / W) | 0; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
        }
        a[i * 4 + 3] = Math.round(al * 255);
      }
      x.putImageData(d, 0, 0);
      const pad = 8, cw = x1 - x0 + 1 + pad * 2, ch = y1 - y0 + 1 + pad * 2;
      const scale = Math.min(1, 2000 / cw);
      const c2 = new OffscreenCanvas(Math.round(cw * scale), Math.round(ch * scale)); const x2 = c2.getContext('2d'); x2.imageSmoothingQuality = 'high';
      x2.drawImage(c, x0 - pad, y0 - pad, cw, ch, 0, 0, c2.width, c2.height);
      // white version for shine overlays
      const c3 = new OffscreenCanvas(c2.width, c2.height); const x3 = c3.getContext('2d'); x3.drawImage(c2, 0, 0); x3.globalCompositeOperation = 'source-in'; x3.fillStyle = '#fff'; x3.fillRect(0, 0, c3.width, c3.height);
      const enc = async (cv) => { const buf = new Uint8Array(await (await cv.convertToBlob({ type: 'image/png' })).arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000)); return btoa(s); };
      return { b64: await enc(c2), w64: await enc(c3), w: c2.width, h: c2.height };
    }, 'file://' + logo);
    fs.writeFileSync(path.join(dst, 'logo.png'), Buffer.from(out.b64, 'base64'));
    fs.writeFileSync(path.join(dst, 'logo-white.png'), Buffer.from(out.w64, 'base64'));
    console.log(`logo -> logo.png ${out.w}x${out.h} (aspect ${(out.w / out.h).toFixed(3)})`);
  }
  await b.close();
})();
