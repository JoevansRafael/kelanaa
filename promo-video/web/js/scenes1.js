/* =========================================================
   ACT 1 — THE PROBLEM (0 – 19.6 s)
   Paced slowly: the confused traveller carries the whole act.
   ========================================================= */

/* ---------- S1  "Mau liburan?" — the traveller appears  0 – 4.2 ---------- */
addScene({
  id: 's1', start: T.s1, end: T.s1e,
  build(root) {
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="spot" style="left:50%;top:120px;width:1500px;height:1100px;margin-left:-750px;background:radial-gradient(ellipse at 50% 45%,rgba(53,168,255,.22),rgba(53,168,255,0) 62%)"></div>
      <div class="abs" id="pwrap" style="left:360px;top:170px;width:620px;height:700px">
        <div class="abs" id="pq" style="left:310px;top:330px">${quesField(9, 31)}</div>
        <div class="abs" id="person" style="left:0;top:0;width:620px;height:700px">${personSVG()}</div>
      </div>
      <div class="abs" id="pshadow" style="left:430px;top:838px;width:480px;height:70px;border-radius:50%;background:radial-gradient(ellipse,rgba(2,6,23,.75),rgba(2,6,23,0) 70%)"></div>
      <div class="abs" id="txt" style="left:1040px;top:380px;width:760px">
        <div class="hud" id="eyebrow" style="font-size:22px">Buat kamu yang pengin liburan</div>
        <div class="big" id="t1" style="font-size:130px;margin-top:22px;white-space:nowrap"></div>
        <div id="t2" style="font-size:46px;font-weight:500;color:#CFE8FF;margin-top:26px;white-space:nowrap"></div>
      </div>
    </div>`;
    return {
      p: personParts(root), person: root.querySelector('#person'), pq: [...root.querySelectorAll('#pq .qm')],
      eyebrow: root.querySelector('#eyebrow'), t1: splitText(root.querySelector('#t1'), 'Mau [b]liburan?[/b]'),
      t2: splitText(root.querySelector('#t2'), 'Tapi bingung mulai dari mana…', 'wd'),
      spot: root.querySelector('#spot'), shadow: root.querySelector('#pshadow'), cam: root.querySelector('.cam'),
    };
  },
  update(lt, c, dur, root, at) {
    transition(root, lt, dur, 'fade', 'fade', 0.8, 0.6);
    const pin = E.o4(prog(lt, 0.3, 2.1));
    tf(c.person, `translateY(${((1 - pin) * 190).toFixed(1)}px) scale(${lerp(0.9, 1, pin).toFixed(4)})`);
    op(c.person, prog(lt, 0.3, 1.3));
    op(c.shadow, pin * 0.9);
    tf(c.shadow, `scaleX(${lerp(0.6, 1, pin).toFixed(3)})`);
    personPose(c.p, at, 0);
    op(c.spot, prog(lt, 0, 1.2) * 0.9);
    quesAnim(c.pq, lt, 2.5, 0.17);
    op(c.eyebrow, prog(lt, 1.2, 1.9));
    riseIn(c.t1, lt, 1.6, { stagger: 0.045, dur: 0.9, y: 70, ease: E.o4 });
    riseIn(c.t2, lt, 2.9, { stagger: 0.085, dur: 0.7, y: 36 });
    tf(c.cam, `scale(${lerp(1, 1.05, E.io3(lt / dur)).toFixed(4)})`);
  },
});

/* ---------- S2  dot map "Tapi… mau ke mana?"  3.8 – 8.2 ---------- */
const S2_PINS = [['Danau Toba?', 98.9, 2.6], ['Jogja?', 110.4, -7.8], ['Bromo?', 112.95, -7.94], ['Bali?', 115.2, -8.4], ['Labuan Bajo?', 119.9, -8.5], ['Raja Ampat?', 130.6, -0.4]];
const S2_LIFT = [0, 0, 2, 1, 0, 0];
addScene({
  id: 's2', start: T.s2, end: T.s2e,
  build(root) {
    let pins = '', anchors = '';
    S2_PINS.forEach(([n, lo, la], i) => {
      const [x, y] = geo(lo, la);
      anchors += `<div class="abs s2a" style="left:${x - 1}px;top:${y - 1}px;width:2px;height:2px"></div>`;
      pins += `<div class="abs s2pin" style="left:0;top:0">
        <div class="s2pi" style="position:absolute;left:0;top:0;transform-origin:0 0">
          <div style="position:absolute;left:0;top:${-70 - S2_LIFT[i] * 66}px;width:2px;height:${44 + S2_LIFT[i] * 66}px;background:linear-gradient(#FF6B24,rgba(255,107,36,0));opacity:${S2_LIFT[i] ? 0.85 : 0}"></div>
          <div style="position:absolute;left:-26px;top:-62px;color:#FF6B24;filter:drop-shadow(0 0 10px rgba(255,107,36,.9))">${icon('pin', 52, '#FF6B24', 2.4)}</div>
          <div style="position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:#FF6B24;box-shadow:0 0 20px 6px rgba(255,107,36,.6)"></div>
          <div style="position:absolute;left:32px;top:${-74 - S2_LIFT[i] * 66}px;padding:9px 20px;border-radius:999px;background:rgba(15,23,42,.9);border:1.5px solid rgba(255,107,36,.75);font-size:29px;font-weight:600;white-space:nowrap;box-shadow:0 0 24px rgba(255,107,36,.35)">${n}</div>
        </div></div>`;
    });
    root.innerHTML = `<div class="cam persp" style="perspective:1700px">
      <div class="abs" id="s2plane" style="left:230px;top:330px;width:1610px;height:660px;transform-style:preserve-3d">
        <canvas id="s2cv" width="1610" height="660" style="position:absolute;left:0;top:0"></canvas>
        ${anchors}
      </div>
      ${pins}
      <div class="abs big" id="s2t" style="left:0;right:0;top:120px;text-align:center;font-size:104px"></div>
      <div class="abs" id="s2p" style="left:60px;top:520px;width:400px;height:452px">${personSVG()}</div>
    </div>`;
    return {
      cv: root.querySelector('#s2cv'), plane: root.querySelector('#s2plane'), pins: [...root.querySelectorAll('.s2pin')],
      anchors: [...root.querySelectorAll('.s2a')], t: splitText(root.querySelector('#s2t'), 'Tapi… [o]mau ke mana?[/o]'),
      dots: indoDots(9), pp: personParts(root.querySelector('#s2p')), pEl: root.querySelector('#s2p'),
    };
  },
  update(lt, c, dur, root, at) {
    transition(root, lt, dur, 'zoomOut', 'fade', 0.6, 0.5);
    const k = lt / dur;
    const tilt = 50 - k * 5;
    c.plane.style.transform = `translateZ(${lerp(-150, 50, E.io3(k)).toFixed(1)}px) rotateX(${tilt}deg) rotateZ(${(-5 + k * 3).toFixed(2)}deg)`;
    const x2 = c.cv.getContext('2d');
    x2.clearRect(0, 0, 1610, 660);
    const rev = E.io3(prog(lt, 0.15, 1.9)) * 1950;
    for (const [x, y] of c.dots) {
      const d = rev - (x + y * 0.4);
      if (d < 0) continue;
      const hot = clamp(1 - d / 220);
      x2.fillStyle = hot > 0 ? `rgba(${Math.round(lerp(53, 255, hot))},${Math.round(lerp(168, 255, hot))},255,${0.55 + hot * 0.45})` : 'rgba(53,168,255,0.55)';
      x2.fillRect(x - 2.5, y - 2.5, 5, 5);
    }
    const rr = root.getBoundingClientRect();
    const sc = parseFloat(root.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1);
    c.pins.forEach((p, i) => {
      const t0 = 1.0 + i * 0.3, s = E.back(prog(lt, t0, t0 + 0.42));
      const a = c.anchors[i].getBoundingClientRect();
      const lx = (a.left + a.width / 2 - rr.left) / sc, ly = (a.top + a.height / 2 - rr.top) / sc;
      p.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
      const pi = p.firstElementChild;
      pi.style.transform = `scale(${s.toFixed(3)})`;
      op(pi, prog(lt, t0, t0 + 0.14));
    });
    riseIn(c.t, lt, 0.35, { stagger: 0.035, dur: 0.6, y: 56 });
    personPose(c.pp, at, 0);
    const pe = E.o4(prog(lt, 0.3, 1.1));
    tf(c.pEl, `translateX(${((1 - pe) * -160).toFixed(1)}px)`);
    op(c.pEl, pe);
  },
});
CAPS.push([T.s2 + 1.5, T.s2e - 0.25, 0, 'Pilihan terlalu banyak, malah bingung…', 'warn']);

/* ---------- S3  research chaos  7.8 – 12.4 ---------- */
const S3_TITLES = ['10 Tempat WAJIB di Labuan Bajo!!', 'Itinerary 3D2N Komodo Murah', 'Harga kapal phinisi 2026?', 'Review hotel dekat pelabuhan', 'Cara ke Pulau Padar', 'Budget backpacker NTT', 'Sewa guide Komodo dimana', 'Open trip vs private trip'];
const S3_NOTIF = [
  ['plane', '#DC2626', '#FEE2E2', 'Harga tiket naik 30%', 'Jakarta – Labuan Bajo', 1240, 170, -4],
  ['alert', '#DC2626', '#FEE2E2', 'Jadwal bentrok', 'Kapal jalan 07.00, kamu baru mendarat', 1200, 710, 3],
  ['chat', '#35A8FF', '#EAF5FF', 'Grup “Liburan Bareng”', 'Jadi ke mana nih??? Belum ada yang mutusin', 110, 750, 2],
];
addScene({
  id: 's3', start: T.s3, end: T.s3e,
  build(root) {
    let wins = '';
    const r = mulberry(17);
    const arts = ['padar', 'pinkbeach', 'komodo', 'manta', 'labuanbajo', 'rajaampat', 'bromo', 'toba'];
    S3_TITLES.forEach((tt, i) => {
      const ang = (i / S3_TITLES.length) * Math.PI * 2 + 0.4;
      const x = 960 + Math.cos(ang) * 760 - 290, y = 520 + Math.sin(ang) * 400 - 180;
      wins += `<div class="win s3w" data-x="${x.toFixed(0)}" data-y="${y.toFixed(0)}" data-r="${((r() - 0.5) * 16).toFixed(1)}" data-z="${(i % 3) * 40 - 120}" style="left:0;top:0;width:580px;height:360px;will-change:transform">
        <div class="bar"><div class="tab" style="width:122px">${tt.slice(0, 13)}…</div><div class="tabs"></div></div>
        <div style="height:40px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 14px"><div style="flex:1;height:26px;border-radius:13px;background:#F1F5F9;font-size:13px;color:#94A3B8;padding:5px 14px">www.blog-wisata-${i + 1}.com</div></div>
        <div style="padding:22px 26px;display:flex;gap:20px">
          <div style="flex:1"><div style="font-size:21px;font-weight:700;line-height:1.15">${tt}</div>
          ${'<div style="height:10px;border-radius:5px;background:#E2E8F0;margin-top:11px"></div>'.repeat(4)}</div>
          <div class="thumb" style="width:170px;height:140px;flex:0 0 auto">${art(arts[i])}</div>
        </div></div>`;
    });
    root.innerHTML = `<div class="cam persp" style="perspective:1900px">
      <div class="abs" id="s3wins" style="inset:0;transform-style:preserve-3d">${wins}</div>
      <div class="abs" id="s3vig" style="inset:0;background:radial-gradient(ellipse at 50% 48%,rgba(11,17,32,.95) 24%,rgba(11,17,32,.55) 48%,rgba(11,17,32,0) 70%)"></div>
      <div class="abs" id="s3p" style="left:700px;top:310px;width:520px;height:590px">${personSVG()}</div>
      <div class="abs" id="s3q" style="left:960px;top:430px">${quesField(7, 77, 0.8)}</div>
      ${S3_NOTIF.map(([ic, col, bgc, t, d, x, y, rot]) => `
        <div class="notif s3n" data-r="${rot}" style="left:${x}px;top:${y}px;width:570px;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 2px ${col}55,0 0 40px ${col}55">
          <div class="ni" style="background:${bgc};color:${col}">${icon(ic, 32, col, 2.3)}</div>
          <div><div class="nt">${t}</div><div class="nd">${d}</div></div></div>`).join('')}
      <div class="abs" id="s3count" style="right:90px;top:86px;text-align:right;z-index:30">
        <div class="hud" style="color:#F59E0B;font-size:20px">Tab browser kebuka</div>
        <div class="display" id="s3n" style="font-size:132px;color:#fff;text-shadow:0 0 40px rgba(245,158,11,.75);margin-top:4px">1</div>
      </div>
    </div>`;
    return {
      wins: [...root.querySelectorAll('.s3w')], notif: [...root.querySelectorAll('.s3n')], count: root.querySelector('#s3count'),
      n: root.querySelector('#s3n'), p: personParts(root.querySelector('#s3p')), pEl: root.querySelector('#s3p'),
      q: [...root.querySelectorAll('#s3q .qm')], cam: root.querySelector('.cam'),
    };
  },
  update(lt, c, dur, root, at) {
    transition(root, lt, dur, 'fade', 'fade', 0.55, 0.5);
    personPose(c.p, at, 0);
    const pe = E.o4(prog(lt, 0, 0.6));
    tf(c.pEl, `scale(${lerp(0.92, 1, pe).toFixed(4)})`);
    op(c.pEl, pe);
    c.wins.forEach((w, i) => {
      const t0 = 0.45 + i * 0.28;
      const p = E.o4(prog(lt, t0, t0 + 0.8));
      const x = +w.dataset.x, y = +w.dataset.y, rot = +w.dataset.r, z = +w.dataset.z;
      const drift = Math.sin(lt * 0.7 + i) * 16;
      tf(w, `translate3d(${(x + drift).toFixed(1)}px,${(y + (1 - p) * 220 + Math.cos(lt * 0.6 + i) * 12).toFixed(1)}px,${lerp(-1500, z, p).toFixed(0)}px) rotateZ(${(rot * p).toFixed(2)}deg) rotateY(${((1 - p) * 26).toFixed(1)}deg)`);
      op(w, p * 0.96);
      const tabs = w.querySelector('.tabs');
      const k = Math.floor(clamp((lt - t0) / 1.8) * 7);
      if (tabs.dataset.k != k) { tabs.dataset.k = k; tabs.style.display = 'flex'; tabs.style.gap = '2px'; tabs.innerHTML = '<div class="tab" style="width:58px">…</div>'.repeat(k); }
    });
    const cnt = Math.max(1, Math.round(E.io3(prog(lt, 0.5, 3.3)) * 39) + 1);
    c.n.textContent = cnt;
    op(c.count, prog(lt, 0.4, 0.9));
    tf(c.count, `scale(${(1 + 0.04 * Math.sin(lt * 14) * prog(lt, 2.4, 3.4)).toFixed(3)})`);
    c.notif.forEach((n, i) => {
      const t0 = 2.1 + i * 0.5, d = lt - t0;
      const s = d > 0 ? spring(d, 15, 9) : 0;
      tf(n, `translateY(${((1 - s) * 60).toFixed(1)}px) scale(${(0.86 + 0.14 * s).toFixed(3)}) rotate(${n.dataset.r}deg)`);
      op(n, clamp(d * 4));
    });
    quesAnim(c.q, lt, 1.2, 0.18);
    tf(c.cam, `scale(${lerp(1, 1.07, E.io3(lt / dur)).toFixed(4)})`);
  },
});
CAPS.push([T.s3 + 0.5, T.s3 + 2.6, 0, 'Riset sana-sini, tab makin banyak…', 'warn']);
CAPS.push([T.s3 + 2.6, T.s3e - 0.25, 0, 'Bingung. Takut salah pilih.', 'warn']);
SHAKE.push([T.s3 + 3.5, 7, 0.5]);

/* ---------- S4  budget blows up -> gives up  12.0 – 14.8 ---------- */
addScene({
  id: 's4', start: T.s4, end: T.s4e,
  build(root) {
    let ticks = '';
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI + i / 40 * Math.PI, r1 = 380, r2 = i % 5 ? 400 : 420;
      const col = i < 20 ? '#16A34A' : i < 30 ? '#F59E0B' : '#DC2626';
      ticks += `<line x1="${500 + Math.cos(a) * r1}" y1="${500 + Math.sin(a) * r1}" x2="${500 + Math.cos(a) * r2}" y2="${500 + Math.sin(a) * r2}" stroke="${col}" stroke-width="${i % 5 ? 3 : 6}"/>`;
    }
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="s4g" style="left:460px;top:110px;width:1000px;height:620px">
        <svg width="1000" height="620" viewBox="0 0 1000 620" style="overflow:visible">
          <defs><linearGradient id="s4arc" x1="0" x2="1"><stop offset="0" stop-color="#16A34A"/><stop offset=".55" stop-color="#F59E0B"/><stop offset="1" stop-color="#DC2626"/></linearGradient></defs>
          <path d="M140,500 A360,360 0 0 1 860,500" stroke="#1E293B" stroke-width="44" fill="none" stroke-linecap="round"/>
          <path id="s4fill" d="M140,500 A360,360 0 0 1 860,500" stroke="url(#s4arc)" stroke-width="44" fill="none" stroke-linecap="round" stroke-dasharray="1131" stroke-dashoffset="1131" style="filter:drop-shadow(0 0 18px rgba(220,38,38,.7))"/>
          ${ticks}
          <g id="s4needle"><path d="M484,262 L500,150 L516,262Z" fill="#fff" style="filter:drop-shadow(0 0 10px #fff)"/></g>
          <text x="140" y="570" fill="#94A3B8" font-size="26" text-anchor="middle" font-family="Montserrat" font-weight="600">Rp 0</text>
          <text x="860" y="570" fill="#94A3B8" font-size="26" text-anchor="middle" font-family="Montserrat" font-weight="600">Rp 10 jt</text>
        </svg>
        <div class="abs" style="left:0;right:0;top:250px;text-align:center">
          <div class="hud" style="color:#94A3B8;font-size:19px">Perkiraan total biaya</div>
          <div class="display" id="s4v" style="font-size:140px;color:#fff;margin-top:12px">Rp 0</div>
          <div style="font-size:31px;color:#94A3B8;margin-top:16px">Budget kamu cuma <b style="color:#fff">Rp 5 jt</b></div>
        </div>
      </div>
      <div class="abs" id="s4slam" style="left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(11,17,32,.9);opacity:0">
        <div class="big" id="s4w" style="font-size:84px;text-align:center;white-space:nowrap"></div>
      </div>
    </div>`;
    return { fill: root.querySelector('#s4fill'), needle: root.querySelector('#s4needle'), v: root.querySelector('#s4v'), g: root.querySelector('#s4g'), slam: root.querySelector('#s4slam'), w: splitText(root.querySelector('#s4w'), 'Ujung-ujungnya… [o]nggak jadi liburan.[/o]', 'wd') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'zoomOut', 'fade', 0.45, 0.4);
    const p = E.io3(prog(lt, 0.15, 1.5));
    const over = p * 0.98 + (lt > 1.5 ? Math.sin((lt - 1.5) * 34) * 0.012 : 0);
    c.fill.setAttribute('stroke-dashoffset', (1131 * (1 - over)).toFixed(1));
    c.needle.setAttribute('transform', `rotate(${(-90 + over * 180).toFixed(2)} 500 500)`);
    const v = 9.8 * p;
    c.v.textContent = 'Rp ' + v.toFixed(1).replace('.', ',') + ' jt';
    c.v.style.color = v > 5 ? '#FCA5A5' : '#fff';
    c.v.style.textShadow = v > 5 ? '0 0 40px rgba(220,38,38,.9)' : 'none';
    tf(c.g, `scale(${lerp(0.97, 1.03, lt / dur).toFixed(4)})`);
    op(c.slam, E.o3(prog(lt, 1.75, 2.1)));
    riseIn(c.w, lt, 1.85, { stagger: 0.08, dur: 0.55, y: 44 });
  },
});
CAPS.push([T.s4 + 0.4, T.s4 + 1.7, 0, 'Budget jebol.', 'warn']);
SHAKE.push([T.s4 + 1.5, 9, 0.4], [T.s4 + 1.8, 14, 0.5]);
GLITCH.push([T.s4 + 1.78, T.s4 + 1.88]);

/* ---------- S5  "Tenang."  14.4 – 16.8 ---------- */
addScene({
  id: 's5', start: T.s5, end: T.s5e,
  build(root) {
    let rays = '';
    for (let i = 0; i < 26; i++) rays += `<div class="abs s5r" data-a="${i / 26 * 360}" style="left:960px;top:540px;width:900px;height:2px;transform-origin:0 50%;background:linear-gradient(90deg,rgba(255,255,255,.85),rgba(53,168,255,0))"></div>`;
    root.innerHTML = `<div class="cam persp">
      ${rays}
      <div class="abs" id="glow" style="left:960px;top:520px;width:1200px;height:900px;margin:-450px -600px;background:radial-gradient(ellipse,rgba(53,168,255,.3),rgba(53,168,255,0) 62%)"></div>
      <div class="abs" id="s5p" style="left:300px;top:300px;width:520px;height:590px">${personSVG()}</div>
      <div class="abs" style="left:900px;top:400px;width:900px">
        <div class="big glowtext" id="s5a" style="font-size:150px">Tenang.</div>
        <div id="s5b" style="font-size:48px;font-weight:500;color:#CFE8FF;margin-top:24px;white-space:nowrap"></div>
      </div>
    </div>`;
    return { a: root.querySelector('#s5a'), b: splitText(root.querySelector('#s5b'), 'Ada cara yang jauh lebih [b]gampang.[/b]', 'wd'), rays: [...root.querySelectorAll('.s5r')], p: personParts(root.querySelector('#s5p')), pEl: root.querySelector('#s5p'), glow: root.querySelector('#glow') };
  },
  update(lt, c, dur, root, at) {
    transition(root, lt, dur, 'fade', 'fade', 0.55, 0.4);
    const calm = E.io3(prog(lt, 0.3, 1.5));
    personPose(c.p, at, calm);
    tf(c.pEl, `scale(${lerp(0.98, 1.02, lt / dur).toFixed(4)})`);
    op(c.glow, 0.5 + calm * 0.5);
    const pa = E.o3(prog(lt, 0.15, 0.95));
    op(c.a, pa);
    c.a.style.letterSpacing = lerp(0.22, 0.01, pa).toFixed(3) + 'em';
    c.a.style.filter = `blur(${((1 - pa) * 12).toFixed(1)}px)`;
    riseIn(c.b, lt, 0.85, { stagger: 0.06, dur: 0.55, y: 30 });
    const pc = prog(lt, 1.45, 2.4);
    c.rays.forEach((r, i) => {
      const a = +r.dataset.a + lt * 12;
      const L = E.o3(pc) * (0.35 + hash(i) * 0.65);
      tf(r, `rotate(${a}deg) scaleX(${L.toFixed(3)})`);
      op(r, pc > 0 ? (1 - pc) * 0.8 : 0);
    });
  },
});

/* ---------- S6  logo reveal  16.4 – 19.6 ---------- */
addScene({
  id: 's6', start: T.s6, end: T.s6e, z: 2,
  build(root) {
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="ring" style="left:960px;top:470px;width:400px;height:400px;margin:-200px;border-radius:50%;border:3px solid #35A8FF;box-shadow:0 0 50px rgba(53,168,255,.9),inset 0 0 50px rgba(53,168,255,.6)"></div>
      <div class="abs" id="ring2" style="left:960px;top:470px;width:400px;height:400px;margin:-200px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7)"></div>
      <div class="abs" id="logo" style="left:510px;top:310px;width:900px;height:324px;filter:drop-shadow(0 0 30px rgba(53,168,255,.85)) drop-shadow(0 0 80px rgba(53,168,255,.45))">${logoSVG('#35A8FF')}</div>
      <div class="abs" id="shine" style="left:510px;top:310px;width:900px;height:324px;mix-blend-mode:screen;opacity:0;-webkit-mask-image:linear-gradient(100deg,transparent 40%,#000 50%,transparent 60%);-webkit-mask-size:300% 100%;-webkit-mask-repeat:no-repeat">${logoSVG('#ffffff')}</div>
      ${['tl', 'tr', 'bl', 'br'].map(k => `<div class="abs s6br" data-k="${k}" style="width:46px;height:46px;border-color:#35A8FF;border-style:solid;border-width:${k[0] === 't' ? 3 : 0}px ${k[1] === 'r' ? 3 : 0}px ${k[0] === 'b' ? 3 : 0}px ${k[1] === 'l' ? 3 : 0}px;left:${k[1] === 'l' ? 450 : 1424}px;top:${k[0] === 't' ? 258 : 646}px"></div>`).join('')}
      <div class="abs hud" id="sub" style="left:0;right:0;top:700px;text-align:center;font-size:30px;letter-spacing:.6em;color:#CFE8FF">KELILING NUSANTARA</div>
      <div class="abs" id="tag" style="left:0;right:0;top:778px;text-align:center;font-size:48px;font-weight:500;color:#fff"></div>
    </div>`;
    return {
      logo: root.querySelector('#logo'), shine: root.querySelector('#shine'), ring: root.querySelector('#ring'), ring2: root.querySelector('#ring2'),
      letters: [...root.querySelectorAll('#logo .lgl')], sL: [...root.querySelectorAll('#shine .lgl')], br: [...root.querySelectorAll('.s6br')],
      sub: root.querySelector('#sub'), tag: splitText(root.querySelector('#tag'), 'Teman ngatur [b]liburanmu.[/b]', 'wd'), cam: root.querySelector('.cam'),
    };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'fade', 0.1, 0.45);
    const ps = E.o5(prog(lt, 0, 1.0));
    tf(c.logo, `scale(${lerp(1.18, 1, ps).toFixed(4)})`); tf(c.shine, `scale(${lerp(1.18, 1, ps).toFixed(4)})`);
    const wp = E.o4(prog(lt, 0.05, 0.85));
    if (!c.letters.length) c.logo.style.clipPath = wp >= 1 ? 'none' : `inset(-80px ${((1 - wp) * 100).toFixed(2)}% -80px -80px)`;
    c.letters.forEach((l, i) => { const p = E.o5(prog(lt, 0.04 + i * 0.07, 0.6 + i * 0.07)); l.setAttribute('transform', `translate(0 ${((1 - p) * 360).toFixed(1)})`); if (c.sL[i]) c.sL[i].setAttribute('transform', `translate(0 ${((1 - p) * 360).toFixed(1)})`); });
    const sp = prog(lt, 0.95, 1.85);
    c.shine.style.webkitMaskPosition = `${lerp(100, 0, sp).toFixed(1)}% 0`;
    op(c.shine, sp > 0 && sp < 1 ? 0.85 : 0);
    const r1 = E.o4(prog(lt, 0, 1.4));
    tf(c.ring, `scale(${lerp(0.2, 4.2, r1).toFixed(3)})`); op(c.ring, (1 - r1) * 0.9);
    const r2 = E.o4(prog(lt, 0.14, 1.7));
    tf(c.ring2, `scale(${lerp(0.2, 3.4, r2).toFixed(3)})`); op(c.ring2, (1 - r2) * 0.7);
    c.br.forEach(b => { const k = b.dataset.k, p = E.o4(prog(lt, 0.45, 1.15)); tf(b, `translate(${((k[1] === 'l' ? -1 : 1) * (1 - p) * 120).toFixed(1)}px,${((k[0] === 't' ? -1 : 1) * (1 - p) * 80).toFixed(1)}px)`); op(b, p * 0.9); });
    const pS = E.o4(prog(lt, 0.7, 1.5));
    op(c.sub, pS); c.sub.style.letterSpacing = lerp(1.2, 0.6, pS).toFixed(3) + 'em';
    riseIn(c.tag, lt, 1.5, { stagger: 0.07, dur: 0.6, y: 36 });
    tf(c.cam, `scale(${lerp(1, 1.04, lt / dur).toFixed(4)})`);
  },
});
FLASH.push([T.s6, 1, 0.6]);
SHAKE.push([T.s6, 14, 0.5]);
