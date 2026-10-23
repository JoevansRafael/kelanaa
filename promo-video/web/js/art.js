/* =========================================================
   Procedural illustrations (offline-safe "photos"), logo, maps.
   If a real photo exists at assets/photos/<name>.jpg it is used instead
   (see window.PHOTO_OVERRIDES filled by the renderer).
   ========================================================= */
let __gid = 0;
const gid = (p) => `${p}${++__gid}`;

/* Catmull-Rom -> cubic bezier path through points */
function smoothPath(pts, closed = true, tension = 0.5) {
  const n = pts.length;
  const P = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + (closed ? 'Z' : '');
}
/* mountain ridge silhouette */
function ridge(seed, base, amp, W = 1600, H = 900, opt = {}) {
  const r = mulberry(seed), oct = opt.oct ?? 3, freq = opt.freq ?? 3, step = opt.step ?? 20;
  const phases = Array.from({ length: oct }, () => r() * 100);
  const pts = [];
  for (let x = -20; x <= W + 20; x += step) {
    let y = 0, a = 1, f = freq / W, s = 0;
    for (let o = 0; o < oct; o++) { y += a * noise1(x * f + phases[o], seed + o); s += a; a *= 0.5; f *= 2.1; }
    y /= s;
    let shape = opt.shape ? opt.shape(x / W) : 0;
    pts.push([x, base - (y * 0.5 + 0.5) * amp - shape]);
  }
  let d = `M-20,${H + 20}`;
  for (const p of pts) d += `L${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  return d + `L${W + 20},${H + 20}Z`;
}
function lg(id, stops, x2 = 0, y2 = 1) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join('')}</linearGradient>`;
}
function rg(id, stops, cx = .5, cy = .5, r = .5) {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join('')}</radialGradient>`;
}
function blob(cx, cy, rx, ry, seed, n = 14, j = 0.28) {
  const r = mulberry(seed), pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, k = 1 + (r() - 0.5) * 2 * j;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smoothPath(pts);
}
function clouds(seed, n, y0, y1, col = '#fff', a = 0.5) {
  const r = mulberry(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = r() * 1600, y = lerp(y0, y1, r()), w = 140 + r() * 260;
    s += `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.16}" fill="${col}" opacity="${(a * (0.4 + r() * 0.6)).toFixed(2)}"/>`;
    s += `<ellipse cx="${x + w * 0.25}" cy="${y - w * 0.07}" rx="${w * 0.5}" ry="${w * 0.14}" fill="${col}" opacity="${(a * 0.7).toFixed(2)}"/>`;
  }
  return s;
}
function sunGlow(id, cx, cy, r, c1, c2) {
  return `<defs>${rg(id, [[0, c1, 1], [0.12, c1, 0.95], [0.35, c2, 0.45], [1, c2, 0]])}</defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}
function seaShimmer(seed, y0, y1, col = '#fff', n = 60, a = 0.35) {
  const r = mulberry(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const y = lerp(y0, y1, Math.pow(r(), 1.6)), w = 20 + (y - y0) / (y1 - y0) * 120 * r();
    s += `<rect x="${r() * 1600}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${(1.5 + (y - y0) / 200).toFixed(1)}" rx="1" fill="${col}" opacity="${(a * r()).toFixed(2)}"/>`;
  }
  return s;
}
function palm(x, y, s, col) {
  let p = `<path d="M${x},${y} C${x + 8 * s},${y - 60 * s} ${x + 4 * s},${y - 120 * s} ${x + 18 * s},${y - 170 * s}" stroke="${col}" stroke-width="${7 * s}" fill="none" stroke-linecap="round"/>`;
  const tx = x + 18 * s, ty = y - 170 * s;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.95 + i * Math.PI * 0.32, L = 80 * s;
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.6 + 30 * s;
    p += `<path d="M${tx},${ty} Q${(tx + ex) / 2},${ty + Math.sin(a) * L * 0.6 - 20 * s} ${ex},${ey}" stroke="${col}" stroke-width="${6 * s}" fill="none" stroke-linecap="round"/>`;
  }
  return p;
}
function wrapSVG(inner, defs = '') {
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${inner}</svg>`;
}

const ART = {
  padar() {
    const sky = gid('s'), sea = gid('w'), hill = gid('h'), hill2 = gid('h'), sun = gid('g');
    const defs = lg(sky, [[0, '#1E3A8A'], [0.45, '#7C5CBF'], [0.75, '#F28BA8'], [1, '#FFB36B']]) +
      lg(sea, [[0, '#3B6FA8'], [0.4, '#1F7A8C'], [1, '#0B3B4F']]) +
      lg(hill, [[0, '#7A8F4E'], [1, '#2F3D22']]) + lg(hill2, [[0, '#9C8A5A'], [1, '#3D3A22']]);
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      ${sunGlow(sun, 1060, 450, 420, '#FFF4D6', '#FF9F5A')}
      ${clouds(3, 6, 120, 330, '#FFD6E0', 0.35)}
      <rect y="470" width="1600" height="430" fill="url(#${sea})"/>
      ${seaShimmer(5, 475, 640, '#FFD9A8', 70, 0.5)}
      <path d="${ridge(11, 480, 70, 1600, 900, { freq: 4 })}" fill="#5B5B8F" opacity="0.65"/>
      <path d="${ridge(12, 492, 45, 1600, 900, { freq: 6 })}" fill="#45507A" opacity="0.8"/>
      <rect y="490" width="1600" height="410" fill="url(#${sea})"/>
      ${seaShimmer(6, 500, 700, '#FFE3B8', 50, 0.4)}
      <path d="M-20,900 L-20,560 C120,470 260,430 380,500 C470,555 520,640 560,700 C600,760 520,820 420,860 L400,900Z" fill="url(#${hill})"/>
      <path d="M380,500 C430,470 470,520 500,600" stroke="#C9B88A" stroke-width="3" fill="none" opacity=".6"/>
      <path d="M560,700 C640,690 720,720 760,760 C700,800 600,820 500,830Z" fill="#F4C9C3"/>
      <path d="M700,900 C760,700 860,560 990,520 C1120,480 1220,560 1300,640 C1360,700 1380,780 1340,900Z" fill="url(#${hill2})"/>
      <path d="M990,520 C1040,540 1080,600 1100,700" stroke="#D9C79A" stroke-width="3" fill="none" opacity=".55"/>
      <path d="M1240,900 C1300,720 1420,600 1620,560 L1620,900Z" fill="url(#${hill})"/>
      <path d="M1290,900 C1330,820 1380,790 1440,800 C1420,850 1380,880 1290,900Z" fill="#F7EEDB" opacity=".9"/>
      <path d="M560,760 C620,740 680,750 740,780" stroke="#7FE3E0" stroke-width="10" fill="none" opacity=".45"/>
    `, defs);
  },
  pinkbeach() {
    const sky = gid('s'), sea = gid('w'), sand = gid('p');
    const defs = lg(sky, [[0, '#2B8FE0'], [0.7, '#9AD5FF'], [1, '#E6F6FF']]) +
      lg(sea, [[0, '#0E7FA8'], [0.45, '#18B8C4'], [1, '#7BE6D8']]) + lg(sand, [[0, '#F7B6C2'], [1, '#E98FA5']]);
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      ${clouds(8, 7, 90, 300, '#fff', 0.7)}
      <path d="${ridge(21, 440, 160, 1600, 900, { freq: 2.5, shape: x => Math.max(0, 1 - Math.abs(x - 0.25) * 3) * 60 })}" fill="#6E8B4F"/>
      <path d="${ridge(22, 455, 60, 1600, 900, { freq: 5 })}" fill="#86A35E"/>
      <rect y="450" width="1600" height="450" fill="url(#${sea})"/>
      ${seaShimmer(9, 455, 700, '#fff', 80, 0.45)}
      <path d="M-20,900 L-20,700 C300,640 700,650 1000,700 C1250,742 1450,800 1620,780 L1620,900Z" fill="url(#${sand})"/>
      <path d="M-20,700 C300,640 700,650 1000,700 C1250,742 1450,800 1620,780" stroke="#fff" stroke-width="10" fill="none" opacity=".8"/>
      <path d="M-20,712 C300,656 700,664 1000,714 C1250,756 1450,812 1620,794" stroke="#fff" stroke-width="4" fill="none" opacity=".4"/>
    `, defs);
  },
  komodo() {
    const sky = gid('s'), g1 = gid('h'), g2 = gid('h');
    const defs = lg(sky, [[0, '#3C8DE0'], [1, '#CFE9FF']]) + lg(g1, [[0, '#C9A65A'], [1, '#7A6A35']]) + lg(g2, [[0, '#A7B860'], [1, '#55642C']]);
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      ${clouds(31, 6, 100, 320, '#fff', 0.75)}
      <path d="${ridge(32, 480, 220, 1600, 900, { freq: 2 })}" fill="#8BA0B8" opacity=".55"/>
      <path d="${ridge(33, 600, 260, 1600, 900, { freq: 2.2 })}" fill="url(#${g1})"/>
      <path d="${ridge(34, 760, 200, 1600, 900, { freq: 3 })}" fill="url(#${g2})"/>
      ${palm(300, 760, 1.4, '#2E3B1C')}${palm(1280, 800, 1.8, '#26321A')}${palm(1380, 820, 1.2, '#26321A')}
      <path d="M560,860 C640,830 760,830 860,850 C900,820 960,815 1000,835 L1040,840 C980,860 900,870 860,866 C760,880 640,880 560,860Z" fill="#3B3420" opacity=".85"/>
    `, defs);
  },
  manta() {
    const w = gid('w'), ray = gid('r');
    const defs = lg(w, [[0, '#2BB3E6'], [0.5, '#0B6EA8'], [1, '#062A4F']]) + lg(ray, [[0, '#fff', 0.35], [1, '#fff', 0]]);
    let rays = '';
    for (let i = 0; i < 7; i++) { const x = 200 + i * 210; rays += `<path d="M${x},-10 L${x + 70},-10 L${x + 260},900 L${x - 60},900Z" fill="url(#${ray})" opacity="${0.25 + (i % 3) * 0.12}"/>`; }
    let bub = ''; const r = mulberry(44);
    for (let i = 0; i < 40; i++) bub += `<circle cx="${r() * 1600}" cy="${r() * 900}" r="${2 + r() * 7}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>`;
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${w})"/>${rays}
      <g transform="translate(800 470) rotate(-8) scale(1.6)">
        <path d="M0,-40 C40,-40 90,-90 230,-60 C150,-20 110,10 60,40 C30,60 10,80 0,160 C-10,80 -30,60 -60,40 C-110,10 -150,-20 -230,-60 C-90,-90 -40,-40 0,-40Z" fill="#0A2238" opacity=".92"/>
        <path d="M-20,-38 C-30,-60 -26,-70 -14,-78 M20,-38 C30,-60 26,-70 14,-78" stroke="#0A2238" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>
      ${bub}
      <path d="${ridge(45, 900, 120, 1600, 900, { freq: 6 })}" fill="#04213A" opacity=".8"/>
    `, defs);
  },
  bromo() {
    const sky = gid('s'), sun = gid('g'), sand = gid('p'), cone = gid('c');
    const defs = lg(sky, [[0, '#1B2A55'], [0.5, '#6E4E8E'], [0.85, '#F29A76'], [1, '#FFC98A']]) +
      lg(sand, [[0, '#8C7E9E'], [1, '#3E3550']]) + lg(cone, [[0, '#6D5E73'], [1, '#2E2636']]);
    let rib = '';
    for (let i = 0; i < 14; i++) { const x = 520 + i * 34; rib += `<path d="M${x},${560 + Math.abs(i - 6.5) * 8} L${x - 40 + i * 3},770" stroke="#241D2C" stroke-width="5" opacity=".45"/>`; }
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      ${sunGlow(sun, 1250, 470, 380, '#FFF1CF', '#FF9C6B')}
      <path d="M980,520 L1180,250 C1200,232 1220,232 1240,250 L1470,520Z" fill="#5A4A70" opacity=".8"/>
      <path d="M1210,240 C1180,180 1220,120 1190,60 C1250,110 1280,170 1230,240Z" fill="#E9DCEB" opacity=".55"/>
      <path d="${ridge(51, 560, 90, 1600, 900, { freq: 3 })}" fill="#4B3D63" opacity=".9"/>
      <rect y="640" width="1600" height="260" fill="url(#${sand})"/>
      <path d="M380,780 C450,640 520,560 640,555 C760,550 830,640 900,780Z" fill="url(#${cone})"/>${rib}
      <path d="M780,700 C860,560 920,470 1020,460 C1120,452 1180,540 1260,700Z" fill="#5B4B5F"/>
      <ellipse cx="1020" cy="470" rx="80" ry="18" fill="#2A2130"/>
      <path d="M1000,465 C960,380 1040,330 1000,240 C1080,300 1110,380 1050,460Z" fill="#F4ECF3" opacity=".75"/>
      <path d="M1030,430 C1010,350 1090,300 1070,200 C1130,270 1140,360 1080,440Z" fill="#fff" opacity=".45"/>
      <rect y="760" width="1600" height="140" fill="#2B2336" opacity=".9"/>
      ${seaShimmer(52, 640, 760, '#FFD2B0', 40, 0.25)}
    `, defs);
  },
  rajaampat() {
    const sky = gid('s'), sea = gid('w');
    const defs = lg(sky, [[0, '#2E8FEA'], [1, '#BFE6FF']]) + lg(sea, [[0, '#0B8FB0'], [0.5, '#16C1C4'], [1, '#5BE3C9']]);
    const isle = (x, y, s, sd) => `<path d="M${x - 120 * s},${y} C${x - 140 * s},${y - 120 * s} ${x - 60 * s},${y - 200 * s} ${x},${y - 200 * s} C${x + 70 * s},${y - 200 * s} ${x + 150 * s},${y - 120 * s} ${x + 120 * s},${y} C${x + 60 * s},${y + 20 * s} ${x - 60 * s},${y + 20 * s} ${x - 120 * s},${y}Z" fill="${sd}"/><ellipse cx="${x}" cy="${y + 8 * s}" rx="${130 * s}" ry="${16 * s}" fill="#7FF0DA" opacity=".55"/>`;
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      ${clouds(61, 7, 80, 300, '#fff', 0.8)}
      <rect y="430" width="1600" height="470" fill="url(#${sea})"/>
      ${seaShimmer(62, 435, 880, '#fff', 90, 0.4)}
      ${isle(240, 470, 0.55, '#3F7A4A')}${isle(560, 460, 0.4, '#4C8A55')}${isle(1350, 470, 0.6, '#3B7246')}
      ${isle(900, 560, 1.0, '#2F6B3C')}${isle(420, 640, 0.8, '#2C6338')}${isle(1260, 700, 1.25, '#255832')}
      ${isle(160, 820, 0.9, '#1F4E2B')}
    `, defs);
  },
  borobudur() {
    const sky = gid('s'), sun = gid('g');
    const defs = lg(sky, [[0, '#F7B58A'], [0.6, '#FCD9A8'], [1, '#FFF1D6']]);
    const stupa = (x, y, s, c) => `<path d="M${x - 70 * s},${y} C${x - 70 * s},${y - 70 * s} ${x - 40 * s},${y - 110 * s} ${x},${y - 112 * s} C${x + 40 * s},${y - 110 * s} ${x + 70 * s},${y - 70 * s} ${x + 70 * s},${y}Z M${x - 8 * s},${y - 112 * s} L${x - 5 * s},${y - 170 * s} L${x + 5 * s},${y - 170 * s} L${x + 8 * s},${y - 112 * s}Z" fill="${c}"/><rect x="${x - 82 * s}" y="${y}" width="${164 * s}" height="${30 * s}" fill="${c}"/>`;
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      ${sunGlow(sun, 520, 420, 360, '#FFFBEA', '#FFB070')}
      <path d="${ridge(71, 470, 160, 1600, 900, { freq: 2 })}" fill="#C7A2A0" opacity=".55"/>
      <path d="${ridge(72, 560, 120, 1600, 900, { freq: 3 })}" fill="#9C8A8A" opacity=".6"/>
      <rect y="560" width="1600" height="60" fill="#FFE8CC" opacity=".55"/>
      <path d="${ridge(73, 660, 120, 1600, 900, { freq: 6, oct: 4 })}" fill="#5E6B4E" opacity=".85"/>
      <rect y="660" width="1600" height="240" fill="#3E3A33"/>
      ${stupa(900, 700, 1.5, '#4A3F38')}${stupa(1180, 720, 1.9, '#3B322C')}${stupa(1480, 760, 2.4, '#2C2521')}${stupa(640, 730, 1.2, '#4A3F38')}
      <rect y="800" width="1600" height="100" fill="#26201C"/>
    `, defs);
  },
  terraces() {
    const sky = gid('s'); let bands = '';
    const defs = lg(sky, [[0, '#BFD9C8'], [1, '#EEF6EA']]);
    const r = mulberry(81);
    for (let i = 0; i < 16; i++) {
      const y = 300 + i * 42 + i * i * 1.6, c = ['#7FB34A', '#6AA23C', '#5D9636', '#8BC255'][i % 4];
      const off = r() * 200;
      bands += `<path d="M-20,${y} C300,${y - 60 + off * 0.2} 600,${y + 40} 900,${y - 20} C1200,${y - 70} 1400,${y + 10} 1620,${y - 30} L1620,900 L-20,900Z" fill="${c}"/>`;
      bands += `<path d="M-20,${y} C300,${y - 60 + off * 0.2} 600,${y + 40} 900,${y - 20} C1200,${y - 70} 1400,${y + 10} 1620,${y - 30}" stroke="#D9F0A8" stroke-width="${2 + i * 0.3}" fill="none" opacity=".7"/>`;
    }
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      <path d="${ridge(82, 330, 120, 1600, 900, { freq: 3 })}" fill="#6E9A78" opacity=".55"/>
      ${bands}
      ${palm(160, 640, 1.6, '#24401E')}${palm(1420, 560, 1.9, '#24401E')}${palm(1300, 520, 1.3, '#2D4C24')}${palm(330, 520, 1.1, '#2D4C24')}
      <rect width="1600" height="900" fill="#fff" opacity=".07"/>
    `, defs);
  },
  toba() {
    const sky = gid('s'), lake = gid('w');
    const defs = lg(sky, [[0, '#3A86D4'], [1, '#D6ECFF']]) + lg(lake, [[0, '#4C8FC0'], [1, '#1D4E7A']]);
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      ${clouds(91, 7, 80, 300, '#fff', 0.8)}
      <path d="${ridge(92, 470, 180, 1600, 900, { freq: 2 })}" fill="#5D8A73" opacity=".8"/>
      <rect y="480" width="1600" height="420" fill="url(#${lake})"/>
      ${seaShimmer(93, 485, 760, '#fff', 60, 0.35)}
      <path d="M-20,900 L-20,700 C300,680 600,700 900,690 C1200,680 1400,700 1620,690 L1620,900Z" fill="#3F6B35"/>
      <g transform="translate(1040 520)">
        <path d="M-260,160 C-180,120 -120,40 -170,-90 C-60,-10 60,-10 170,-90 C120,40 180,120 260,160Z" fill="#2B2420"/>
        <rect x="-170" y="160" width="340" height="120" fill="#5A2E22"/>
        <path d="M-170,190 H170 M-170,230 H170" stroke="#E7C36A" stroke-width="6"/>
        <path d="M-150,170 L-120,270 M-60,170 L-40,270 M40,170 L60,270 M130,170 L150,270" stroke="#C0392B" stroke-width="5" opacity=".7"/>
      </g>
    `, defs);
  },
  jungle() {
    const sky = gid('s');
    const defs = lg(sky, [[0, '#9FC9B0'], [1, '#E7F3E6']]);
    return wrapSVG(`
      <rect width="1600" height="900" fill="url(#${sky})"/>
      <path d="${ridge(101, 420, 160, 1600, 900, { freq: 3 })}" fill="#7FA88B" opacity=".7"/>
      <path d="${ridge(102, 560, 160, 1600, 900, { freq: 5, oct: 4 })}" fill="#4F7F4F"/>
      <path d="${ridge(103, 720, 160, 1600, 900, { freq: 7, oct: 4 })}" fill="#335F35"/>
      ${palm(260, 900, 2.2, '#1E3A1C')}${palm(1380, 900, 2.6, '#1E3A1C')}
    `, defs);
  },
};
function art(name) {
  const ov = (window.PHOTO_OVERRIDES || {})[name];
  if (ov) return `<img src="${ov}" style="width:100%;height:100%;object-fit:cover;display:block">`;
  return (ART[name] || ART.jungle)();
}

/* ======================  KELANA logo (recreated wordmark)  ====================== */
const SOLE_PTS = [[72, 525], [100, 455], [175, 403], [250, 386], [400, 378], [500, 353], [615, 330], [665, 329], [760, 336], [860, 375], [918, 420], [944, 470], [954, 522], [930, 568], [882, 604], [820, 626], [720, 642], [650, 637], [560, 616], [470, 598], [400, 594], [340, 600], [250, 620], [190, 627], [130, 607], [92, 583]];
const LOGO_LETTERS = [ // [char, x0, x1, skew]
  ['K', 66, 191, -5], ['E', 196, 335, -7], ['L', 339, 472, 5], ['A', 477, 643, 3], ['N', 648, 816, -3], ['A', 821, 962, 6]];
function logoSVG(color = '#35A8FF', opts = {}) {
  const ov = window.LOGO_OVERRIDE;
  if (ov) return `<img src="${ov}" style="width:100%;height:100%;object-fit:contain;display:block">`;
  // Letters follow the "footprint" outline of the Kelana mark: each glyph is
  // stretched so its top/bottom sit on the outline at that x position.
  const top = SOLE_PTS.slice(1, 12), bot = SOLE_PTS.slice(13).reverse();
  const at = (arr, x) => { for (let i = 0; i < arr.length - 1; i++) { const [x0, y0] = arr[i], [x1, y1] = arr[i + 1]; if (x >= x0 && x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0)); } return x < arr[0][0] ? arr[0][1] : arr[arr.length - 1][1]; };
  const F = 200, CAP = 0.714 * F;
  let letters = '';
  LOGO_LETTERS.forEach(([c, x0, x1, sk], i) => {
    const cx = (x0 + x1) / 2;
    const yt = Math.min(at(top, cx) + 14, 418), yb = Math.max(at(bot, cx) - 10, 596);
    const sy = (yb - yt) / CAP;
    letters += `<g class="lgl" data-i="${i}"><g transform="translate(${(cx - 60).toFixed(1)} ${(yb - 310).toFixed(1)}) skewX(${(sk * 0.6).toFixed(1)}) scale(1 ${sy.toFixed(3)})"><text x="0" y="0" font-family="Display" font-weight="900" font-size="${F}" text-anchor="middle" fill="${color}" textLength="${(x1 - x0 - 12)}" lengthAdjust="spacingAndGlyphs">${c}</text></g></g>`;
  });
  const cid = gid('lc');
  return `<svg viewBox="0 0 910 345" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;overflow:visible"><defs><clipPath id="${cid}"><rect x="-60" y="-30" width="1030" height="${345 + 40}"/></clipPath></defs><g clip-path="url(#${cid})">${letters}</g></svg>`;
}

/* ======================  Indonesia dot map data  ====================== */
const ISLANDS = [
  [[95.3, 5.6], [97.5, 5.2], [98.7, 3.8], [100.4, 2.2], [101.5, 1.7], [103.7, 1.0], [104.5, -1.0], [104.4, -2.0], [105.8, -3.0], [105.9, -5.8], [104.5, -5.9], [102.3, -4.0], [100.5, -1.5], [99.0, 0.5], [98.4, 1.8], [96.5, 3.6], [95.2, 5.0]],
  [[105.2, -6.8], [106.0, -5.9], [108.3, -6.2], [110.4, -6.9], [112.7, -6.9], [114.4, -7.7], [114.4, -8.7], [112.0, -8.3], [110.0, -8.1], [108.0, -7.8], [106.4, -7.4], [105.3, -6.9]],
  [[114.5, -8.1], [115.7, -8.4], [115.2, -8.85], [114.6, -8.4]],
  [[116.0, -8.3], [116.7, -8.4], [116.5, -8.9], [116.0, -8.8]],
  [[116.9, -8.5], [117.8, -8.2], [119.0, -8.3], [119.0, -8.7], [117.5, -9.0], [116.8, -8.9]],
  [[119.8, -8.4], [121.5, -8.4], [123.0, -8.2], [122.8, -8.7], [120.5, -8.8], [119.8, -8.7]],
  [[119.0, -9.4], [120.5, -9.6], [120.8, -10.2], [119.5, -9.8]],
  [[123.5, -10.2], [125.0, -9.3], [127.0, -8.4], [126.8, -8.8], [124.5, -10.0], [123.6, -10.4]],
  [[109.0, 1.5], [110.0, 1.8], [111.5, 2.8], [113.0, 3.2], [115.0, 5.0], [116.8, 7.0], [117.6, 6.4], [118.5, 5.0], [118.2, 4.2], [117.8, 1.5], [118.9, 1.0], [117.5, 0.0], [116.8, -1.5], [116.3, -3.5], [114.6, -4.1], [113.0, -3.2], [111.5, -3.0], [110.2, -2.9], [109.5, -1.0], [109.0, 0.0]],
  [[119.4, -5.6], [120.4, -5.5], [120.4, -3.0], [121.0, -2.6], [122.2, -4.8], [123.0, -4.3], [122.0, -3.0], [121.3, -1.9], [123.3, -1.0], [122.5, -0.7], [121.0, -1.2], [120.6, -0.9], [120.8, 0.5], [122.0, 0.9], [124.0, 0.6], [125.2, 1.6], [124.6, 0.2], [123.3, 0.1], [121.0, 0.1], [120.2, 0.4], [119.7, -0.6], [119.0, -2.0], [119.0, -3.5], [119.5, -4.4]],
  [[127.6, 1.9], [128.0, 1.0], [128.6, 0.5], [127.9, 0.0], [128.3, -0.8], [127.6, -0.5], [127.4, 0.8]],
  [[128.0, -2.9], [130.8, -3.1], [130.6, -3.6], [128.3, -3.5]],
  [[126.0, -3.1], [127.2, -3.2], [127.0, -3.8], [126.1, -3.7]],
  [[131.0, -1.2], [132.5, -0.4], [134.0, -0.8], [134.3, -2.3], [135.2, -3.3], [136.5, -2.2], [138.0, -1.6], [140.0, -2.3], [141.0, -2.6], [141.0, -9.1], [139.8, -8.1], [138.0, -8.4], [137.8, -7.4], [138.6, -6.8], [137.2, -5.0], [135.0, -4.4], [133.6, -3.8], [132.8, -4.0], [132.0, -2.8], [133.5, -2.2], [132.2, -2.2], [131.0, -1.6]],
  [[130.3, -0.1], [131.3, -0.2], [130.9, -0.6], [130.3, -0.5]],
  [[105.2, -1.6], [106.4, -2.4], [106.8, -3.0], [105.9, -2.8], [105.1, -2.0]],
  [[107.6, -2.6], [108.3, -2.7], [108.2, -3.2], [107.6, -3.1]],
  [[97.0, 1.5], [97.8, 1.0], [97.4, 0.6], [96.9, 1.1]],
];
const geo = (lon, lat) => [(lon - 95) * 34.8, (7.5 - lat) * 36];
function pointInPoly(x, y, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins;
  }
  return ins;
}
let __dots = null;
function indoDots(step = 9) {
  if (__dots) return __dots;
  const polys = ISLANDS.map(p => p.map(([lo, la]) => geo(lo, la)));
  const dots = [];
  for (let y = 0; y < 660; y += step) for (let x = 0; x < 1610; x += step) {
    const ox = (Math.floor(y / step) % 2) * step / 2;
    if (polys.some(p => pointInPoly(x + ox, y, p))) dots.push([x + ox, y]);
  }
  return (__dots = dots);
}
