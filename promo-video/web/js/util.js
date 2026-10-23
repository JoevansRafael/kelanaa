/* ======================  Math / easing  ====================== */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: t => t,
  o2: t => 1 - (1 - t) * (1 - t),
  o3: t => 1 - Math.pow(1 - t, 3),
  o4: t => 1 - Math.pow(1 - t, 4),
  o5: t => 1 - Math.pow(1 - t, 5),
  i3: t => t * t * t,
  i4: t => t * t * t * t,
  io3: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  oExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  iExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  io5: t => (t < .5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2),
  ioExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1,
};
/* damped spring response for time since trigger (seconds) */
const spring = (dt, f = 14, d = 7) => dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(f * dt);
/* eased segment value */
const seg = (t, a, b, from, to, ease = E.o3) => lerp(from, to, ease(prog(t, a, b)));
/* keyframe track: keys=[[t,v],...] */
function track(t, keys, ease = E.io3) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const p = ease(prog(t, t0, t1));
      if (Array.isArray(v0)) return v0.map((x, j) => lerp(x, v1[j], p));
      return lerp(v0, v1, p);
    }
  }
  return keys[keys.length - 1][1];
}
function mulberry(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/* smooth value noise 1D */
function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57), hash(i + 1 + seed * 57), u) * 2 - 1;
}

/* ======================  DOM helpers  ====================== */
function h(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }
function css(el, o) { if (!el) return; for (const k in o) el.style[k] = o[k]; }
const px = v => v.toFixed(2) + 'px';
function tf(el, s) { if (el) el.style.transform = s; }
function op(el, v) { if (el) el.style.opacity = clamp(v).toFixed(3); }
function show(el, v) { if (el) el.style.visibility = v ? 'visible' : 'hidden'; }

/* split a text into char spans; supports [o]...[/o] markup for orange and [b]...[/b] for blue */
function splitText(el, text, mode = 'ch') {
  el.innerHTML = '';
  const spans = [];
  let cls = '';
  const tokens = text.split(/(\[o\]|\[\/o\]|\[b\]|\[\/b\]|\[br\])/);
  for (const tok of tokens) {
    if (tok === '[o]') { cls = 'orange'; continue; }
    if (tok === '[b]') { cls = 'blue'; continue; }
    if (tok === '[/o]' || tok === '[/b]') { cls = ''; continue; }
    if (tok === '[br]') { el.appendChild(document.createElement('br')); continue; }
    if (mode === 'ch') {
      // keep words together so line breaks behave
      const words = tok.split(/(\s+)/);
      for (const w of words) {
        if (!w) continue;
        if (/^\s+$/.test(w)) { const s = document.createElement('span'); s.className = 'ch'; s.textContent = w; el.appendChild(s); spans.push(s); continue; }
        const wrap = document.createElement('span'); wrap.style.display = 'inline-block'; wrap.style.whiteSpace = 'nowrap';
        for (const c of w) { const s = document.createElement('span'); s.className = 'ch ' + cls; s.textContent = c; wrap.appendChild(s); spans.push(s); }
        el.appendChild(wrap);
      }
    } else {
      const words = tok.split(/(\s+)/);
      for (const w of words) {
        if (!w) continue;
        const s = document.createElement('span'); s.className = 'wd ' + cls; s.textContent = w; el.appendChild(s);
        if (!/^\s+$/.test(w)) spans.push(s);
      }
    }
  }
  return spans;
}
/* staggered rise-in (and optional out) for split spans */
function riseIn(spans, lt, t0, o = {}) {
  const st = o.stagger ?? 0.025, dur = o.dur ?? 0.45, y = o.y ?? 60, rot = o.rot ?? 0, sc = o.scale ?? 1;
  const ease = o.ease ?? E.o4;
  spans.forEach((s, i) => {
    const p = ease(prog(lt, t0 + i * st, t0 + i * st + dur));
    let tr = `translate3d(0,${((1 - p) * y).toFixed(1)}px,0)`;
    if (rot) tr += ` rotate(${((1 - p) * rot).toFixed(2)}deg)`;
    if (sc !== 1) tr += ` scale(${lerp(sc, 1, p).toFixed(3)})`;
    s.style.transform = tr;
    s.style.opacity = clamp(p * 1.4).toFixed(3);
  });
}
function riseOut(spans, lt, t0, o = {}) {
  const st = o.stagger ?? 0.015, dur = o.dur ?? 0.3, y = o.y ?? -50;
  if (lt < t0) return;
  spans.forEach((s, i) => {
    const p = E.i3(prog(lt, t0 + i * st, t0 + i * st + dur));
    s.style.transform = `translate3d(0,${(p * y).toFixed(1)}px,0)`;
    s.style.opacity = (1 - p).toFixed(3);
  });
}
/* typing: returns visible substring */
function typed(text, lt, t0, cps = 22) {
  const n = Math.floor(clamp((lt - t0) * cps, 0, text.length));
  return text.slice(0, n);
}
const caretOn = (lt) => (Math.floor(lt * 2.2) % 2 === 0);
/* number formatting (Indonesian) */
const fmtJt = v => 'Rp ' + v.toFixed(2).replace('.', ',') + ' jt';
const fmtRb = v => 'Rp ' + Math.round(v) + ' rb';

/* ======================  Cursor  ====================== */
const CURSOR_SVG = `<svg viewBox="0 0 44 44" width="44" height="44"><path d="M8 4 L8 34 L15.5 27 L21 39 L26 37 L20.5 25.5 L31 25.5 Z" fill="#fff" stroke="#0F172A" stroke-width="2.4" stroke-linejoin="round"/></svg>`;
class Cursor {
  constructor(parent) {
    this.el = h(`<div class="cursor">${CURSOR_SVG}</div>`);
    this.rp = h(`<div class="ripple"></div>`);
    parent.appendChild(this.rp); parent.appendChild(this.el);
  }
  /* keys: [[t,x,y],...], clicks: [t,...] */
  update(lt, keys, clicks = [], vis = [0, 999]) {
    const k2 = keys.map(k => [k[0], [k[1], k[2]]]);
    const [x, y] = track(lt, k2, E.io3);
    let s = 1;
    for (const c of clicks) { const d = lt - c; if (d > -0.06 && d < 0.14) s = Math.min(s, 0.82); }
    const visible = lt >= vis[0] && lt <= vis[1];
    const a = Math.min(prog(lt, vis[0], vis[0] + 0.15), 1 - prog(lt, vis[1] - 0.15, vis[1]));
    this.el.style.opacity = visible ? a.toFixed(3) : 0;
    this.el.style.transform = `translate3d(${px(x - 8)},${px(y - 4)},0) scale(${s})`;
    let rpA = 0, rpS = 0.3;
    for (const c of clicks) { const d = lt - c; if (d >= 0 && d < 0.5) { const p = d / 0.5; rpA = 1 - p; rpS = 0.2 + E.o3(p) * 0.9; this.rp.style.left = px(x); this.rp.style.top = px(y); } }
    this.rp.style.opacity = rpA.toFixed(3);
    this.rp.style.transform = `scale(${rpS.toFixed(3)})`;
  }
}

/* ======================  Icons (lucide-like strokes)  ====================== */
const ICON_PATHS = {
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.6"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.7-3.2 3.1-5 6-5s5.3 1.8 6 5"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.7c1.9.6 3.1 2.200 3.5 4.8"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5S14.5 17.900 12 20.5M12 3.5C9.5 6.1 8.4 8.9 8.4 12s1.1 5.900 3.6 8.5"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7l1.6-2.5h3.8L15.5 7"/><circle cx="12" cy="13.5" r="3.5"/>',
  food: '<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3c-2 1.5-2.8 4-2.8 7h2.8v11"/>',
  bed: '<path d="M3 18V7M3 14h18v4M21 14v-2.5A2.5 2.5 0 0 0 18.500 9H11v5"/><circle cx="7" cy="11" r="1.8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  star: '<path d="M12 3.5l2.6 5.400 5.900.8-4.300 4.100 1 5.800L12 16.800l-5.200 2.800 1-5.800L3.500 9.700l5.900-.8z" fill="currentColor"/>',
  shield: '<path d="M12 3l7.500 3v5.500c0 4.600-3.200 8.300-7.500 9.500C7.700 19.800 4.500 16.100 4.500 11.500V6z"/><path d="M8.800 12l2.200 2.200 4.300-4.400"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.500V12l3 2"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M16 13h2.5M3 9.500h18M6 6l9-3 1.500 3"/>',
  search: '<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4.500 4.500"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.500M12 17.300v.2"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plane: '<path d="M2.500 13.500l19-8-6.500 15-3-6.500z"/><path d="M12 14l3.500-3.500"/>',
  hotel: '<path d="M4 21V5h11v16M15 10h5v11M7.500 8.500h1M11 8.500h1M7.500 12h1M11 12h1M7.500 15.500h1M11 15.500h1M3 21h18"/>',
  chat: '<path d="M4 5h16v11H9.500L5 19.500V16H4z"/>',
  sparkle: '<path d="M12 3l1.900 5.600L19.500 10.500 13.900 12.400 12 18l-1.900-5.600L4.500 10.500l5.600-1.900z"/><path d="M19 16l.8 2.200L22 19l-2.200.8L19 22l-.8-2.200L16 19l2.200-.8z"/>',
  route: '<circle cx="6" cy="18" r="2.500"/><circle cx="18" cy="6" r="2.500"/><path d="M8.500 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.500"/>',
  boat: '<path d="M3 16l1.500 4h15l1.500-4z"/><path d="M12 3v13M12 4l6 9h-6"/>',
  grip: '<circle cx="9" cy="6" r="1.200" fill="currentColor"/><circle cx="15" cy="6" r="1.200" fill="currentColor"/><circle cx="9" cy="12" r="1.200" fill="currentColor"/><circle cx="15" cy="12" r="1.200" fill="currentColor"/><circle cx="9" cy="18" r="1.200" fill="currentColor"/><circle cx="15" cy="18" r="1.200" fill="currentColor"/>',
  lang: '<path d="M4 5h9M8.500 3v2M6 5c.5 3 2.500 5.500 5.500 7M11 5c-.5 3-2.500 6-6.500 8M13 21l4-9 4 9M14.300 18h5.400"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  trash: '<path d="M4 7h16M9 7V4.500h6V7M6.500 7l1 13h9l1-13"/>',
  wave: '<path d="M2 15c2.500 0 2.500-2 5-2s2.500 2 5 2 2.500-2 5-2 2.500 2 5 2M2 19c2.500 0 2.500-2 5-2s2.500 2 5 2 2.500-2 5-2 2.500 2 5 2"/><circle cx="12" cy="7" r="3"/>',
};
function icon(name, size = 26, color = 'currentColor', sw = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${ICON_PATHS[name] || ''}</svg>`;
}

/* ======================  Global FX tracks (filled by scenes)  ====================== */
const FLASH = [];   // [t, strength, decaySec, color?]
const SHAKE = [];   // [t, amplitudePx, decaySec]
const GLITCH = [];  // [t0, t1]
const CAPS = [];    // [t0, t1, num, text, cls]
const SCENES = [];
function addScene(def) { SCENES.push(def); }

/* ======================  Master timeline (seconds)  ======================
   Scenes overlap by ~0.4 s so every cut is a real transition, not a jump. */
const T = {
  // ACT 1 — problem, with the confused traveller
  s1: 0.0, s1e: 4.2,     // "Mau liburan?" — character appears
  s2: 3.8, s2e: 8.2,     // "Tapi… mau ke mana?" — map of options
  s3: 7.8, s3e: 12.4,    // research chaos piles up
  s4: 12.0, s4e: 14.8,   // budget blows up -> "nggak jadi liburan"
  s5: 14.4, s5e: 16.8,   // "Tenang." — calm
  s6: 16.4, s6e: 19.6,   // logo reveal
  // ACT 2 — feature 01: custom itinerary
  s11: 19.2, s11e: 21.8,
  s12: 21.4, s12e: 26.8, // form: ke mana & kapan, sama siapa, budget
  s13: 26.4, s13e: 30.6, // form: minat & tempo
  s14: 30.2, s14e: 32.6, // engine
  s15: 32.2, s15e: 38.0, // result itinerary
  s16: 37.6, s16e: 40.6, // route map
  // ACT 3 — feature 02: guide booking
  s17: 40.2, s17e: 42.8,
  s18: 42.4, s18e: 47.2, // verified guides
  s19: 46.8, s19e: 52.4, // profile + booking -> into itinerary
  // ACT 4 — resolution & CTA
  s21: 52.0, s21e: 54.4, // dashboard
  s22: 54.0, s22e: 56.4, // destination montage
  s23: 56.0, s23e: 60.0, // end card
};
