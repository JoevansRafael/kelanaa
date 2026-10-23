/* =========================================================
   Timeline engine — everything is a pure function of time t.
   window.KELANA.seek(t) renders the exact frame for time t.
   ========================================================= */
const DURATION = 56.0;
const FPS = 60;

/* ---------- background canvas ---------- */
const bg = document.getElementById('bg');
const bctx = bg.getContext('2d');
const PARTS = (() => { const r = mulberry(7); return Array.from({ length: 140 }, () => ({ x: r() * 1920, y: r() * 1080, z: 0.2 + r() * 0.8, s: r() })); })();
/* mood: 0 = kelana blue, 1 = alarm red, 2 = dark/quiet */
function moodAt(t) {
  const red = Math.min(seg(t, 3.5, 8.5, 0, 1, E.io3), 1 - seg(t, 10.2, 10.8, 0, 1));
  const dark = Math.max(seg(t, 10.0, 10.8, 0, 1) * (1 - seg(t, 11.6, 12.05, 0, 1)), seg(t, 55.2, 56, 0, 1));
  return { red, dark };
}
function drawBG(t) {
  const { red, dark } = moodAt(t);
  const c = bctx;
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#0B1120'; c.fillRect(0, 0, 1920, 1080);
  const R = Math.round(lerp(53, 220, red)), G = Math.round(lerp(168, 50, red)), B = Math.round(lerp(255, 40, red));
  const a = 1 - dark;
  // main glow orbs
  const ox = 960 + Math.sin(t * 0.35) * 380, oy = 520 + Math.cos(t * 0.27) * 160;
  let g = c.createRadialGradient(ox, oy, 0, ox, oy, 1100);
  g.addColorStop(0, `rgba(${R},${G},${B},${0.30 * a})`); g.addColorStop(0.45, `rgba(${R},${G},${B},${0.10 * a})`); g.addColorStop(1, 'rgba(15,23,42,0)');
  c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
  const ox2 = 1500 - Math.sin(t * 0.22) * 300, oy2 = 900;
  g = c.createRadialGradient(ox2, oy2, 0, ox2, oy2, 800);
  const o2 = red > 0.5 ? `rgba(245,158,11,${0.10 * a})` : `rgba(255,107,36,${0.10 * a})`;
  g.addColorStop(0, o2); g.addColorStop(1, 'rgba(15,23,42,0)');
  c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
  // perspective grid floor
  c.save();
  c.globalAlpha = 0.22 * a;
  c.strokeStyle = `rgb(${R},${G},${B})`; c.lineWidth = 1;
  const hy = 640, sp = (t * 120) % 80;
  for (let i = 0; i < 18; i++) {
    const z = (i * 80 + sp) / 1440; const y = hy + Math.pow(z, 2.2) * 600;
    c.globalAlpha = 0.18 * a * z; c.beginPath(); c.moveTo(0, y); c.lineTo(1920, y); c.stroke();
  }
  c.globalAlpha = 0.10 * a;
  for (let i = -16; i <= 16; i++) { c.beginPath(); c.moveTo(960 + i * 30, hy); c.lineTo(960 + i * 260, 1080); c.stroke(); }
  // dot grid top
  c.globalAlpha = 0.10 * a; c.fillStyle = `rgb(${R},${G},${B})`;
  for (let y = 40; y < 600; y += 48) for (let x = 24 + ((y / 48) % 2) * 24; x < 1920; x += 48) c.fillRect(x, y, 2, 2);
  c.restore();
  // particles
  for (const p of PARTS) {
    const x = (p.x + t * 30 * p.z) % 1960 - 20, y = (p.y - t * 18 * p.z + 1100) % 1100 - 10;
    const tw = 0.5 + 0.5 * Math.sin(t * 3 + p.s * 20);
    c.fillStyle = `rgba(${R},${G},${B},${(0.15 + 0.55 * p.z * tw) * a})`;
    c.beginPath(); c.arc(x, y, 0.8 + p.z * 2.2, 0, 6.283); c.fill();
  }
}

/* ---------- grain ---------- */
(function makeGrain() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const x = cv.getContext('2d'), im = x.createImageData(256, 256), r = mulberry(99);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0);
  document.getElementById('grain').style.backgroundImage = `url(${cv.toDataURL()})`;
})();

/* ---------- scene transitions ---------- */
function transition(root, lt, dur, tin = 'fade', tout = 'fade', din = 0.25, dout = 0.25) {
  let tx = 0, ty = 0, s = 1, o = 1, f = '', rz = 0;
  const pi = prog(lt, 0, din), po = prog(lt, dur - dout, dur);
  if (pi < 1) {
    const e = E.o4(pi);
    switch (tin) {
      case 'fade': o = e; break;
      case 'zoomIn': s = lerp(0.82, 1, e); o = E.o2(pi); break;
      case 'zoomOut': s = lerp(1.35, 1, e); o = E.o2(pi); break;
      case 'whipL': tx = lerp(1920, 0, E.o5(pi)); if (pi < 0.75) f = 'url(#mblurX)'; break;
      case 'whipR': tx = lerp(-1920, 0, E.o5(pi)); if (pi < 0.75) f = 'url(#mblurX)'; break;
      case 'whipU': ty = lerp(1080, 0, E.o5(pi)); if (pi < 0.75) f = 'url(#mblurY)'; break;
      case 'cut': break;
    }
  }
  if (po > 0) {
    const e = E.i4(po);
    switch (tout) {
      case 'fade': o *= 1 - e; break;
      case 'zoomThrough': s *= lerp(1, 2.6, E.i3(po)); o *= 1 - E.i3(po); break;
      case 'zoomAway': s *= lerp(1, 0.7, e); o *= 1 - e; break;
      case 'whipL': tx += lerp(0, -1920, E.i4(po)); if (po > 0.25) f = 'url(#mblurX)'; break;
      case 'whipR': tx += lerp(0, 1920, E.i4(po)); if (po > 0.25) f = 'url(#mblurX)'; break;
      case 'whipU': ty += lerp(0, -1080, E.i4(po)); if (po > 0.25) f = 'url(#mblurY)'; break;
      case 'cut': break;
    }
  }
  root.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)}) rotate(${rz}deg)`;
  root.style.opacity = clamp(o).toFixed(3);
  root.style.filter = f;
}

/* ---------- caption rendering ---------- */
const capEl = document.getElementById('caption');
const capInner = capEl.querySelector('.cap-inner');
const capNum = capEl.querySelector('.cap-num');
const capText = capEl.querySelector('.cap-text');
let capLast = null;
function drawCaption(t) {
  const c = CAPS.find(c => t >= c[0] && t < c[1]);
  if (!c) { capEl.style.opacity = 0; return; }
  const [t0, t1, num, text, cls] = c;
  if (capLast !== c) {
    capLast = c;
    capInner.className = 'cap-inner' + (num ? '' : ' nonum') + (cls ? ' ' + cls : '');
    capNum.textContent = num || '';
    capText.innerHTML = text;
  }
  const pin = E.o4(prog(t, t0, t0 + 0.22)), pout = E.i3(prog(t, t1 - 0.16, t1));
  capEl.style.opacity = (pin * (1 - pout)).toFixed(3);
  capEl.style.transform = `translateY(${((1 - pin) * 40 + pout * 20).toFixed(1)}px) scale(${lerp(0.94, 1, pin).toFixed(3)})`;
}

/* ---------- build ---------- */
const scenesRoot = document.getElementById('scenes');
for (const s of SCENES) {
  s.root = document.createElement('div');
  s.root.className = 'scene';
  s.root.id = s.id;
  s.root.style.zIndex = s.z || 1;
  scenesRoot.appendChild(s.root);
  s.ctx = s.build(s.root) || {};
}

/* ---------- seek ---------- */
const flashEl = document.getElementById('flash');
const grainEl = document.getElementById('grain');
function seek(t) {
  drawBG(t);
  for (const s of SCENES) {
    const on = t >= s.start && t < s.end;
    if (on !== s._on) { s.root.style.display = on ? 'block' : 'none'; s._on = on; }
    if (on) s.update(t - s.start, s.ctx, s.end - s.start, s.root, t);
  }
  // flash
  let fa = 0, fcol = '#fff';
  for (const [ft, st, dc, col] of FLASH) { const d = t - ft; if (d >= -1 / 120 && d < dc) { const v = st * (1 - d / dc) ** 2; if (v > fa) { fa = v; fcol = col || '#fff'; } } }
  flashEl.style.opacity = clamp(fa).toFixed(3); flashEl.style.background = fcol;
  // shake
  let sx = 0, sy = 0;
  for (const [st, amp, dc] of SHAKE) { const d = t - st; if (d >= 0 && d < dc) { const k = amp * (1 - d / dc) ** 2; sx += noise1(t * 60, 3) * k; sy += noise1(t * 60, 9) * k; } }
  // glitch
  const gl = GLITCH.some(([a, b]) => t >= a && t < b);
  if (gl) { const k = Math.floor(t * 60); sx += (hash(k) - 0.5) * 40; sy += (hash(k + 7) - 0.5) * 10; }
  scenesRoot.style.transform = (sx || sy) ? `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)` : '';
  scenesRoot.style.filter = gl ? 'url(#rgbsplit)' : '';
  drawCaption(t);
  // grain jitter
  const k = Math.floor(t * 60);
  grainEl.style.transform = `translate(${Math.floor(hash(k) * 64)}px,${Math.floor(hash(k + 3) * 64)}px)`;
}

window.KELANA = {
  DURATION, FPS, seek,
  ready: document.fonts.ready.then(() => Promise.all([...document.images].map(i => i.decode().catch(() => console.error('img fail ' + i.src))))).then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))),
};
/* preview mode: open index.html?t=12.3 or ?play */
(function preview() {
  const q = new URLSearchParams(location.search);
  if (q.has('t')) { seek(parseFloat(q.get('t'))); }
  else if (q.has('play')) { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); }; loop(); }
  else seek(0);
})();
