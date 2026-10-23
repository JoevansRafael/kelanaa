/* =========================================================
   ACT 1 — THE PROBLEM (0 – 14.6 s)
   ========================================================= */

/* ---------- S1  "Mau liburan?"  0.0 – 1.6 ---------- */
addScene({
  id: 's1', start: 0, end: 1.6,
  build(root) {
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="s1line" style="left:50%;top:540px;height:3px;width:1600px;margin-left:-800px;background:linear-gradient(90deg,transparent,#35A8FF,#fff,#35A8FF,transparent);box-shadow:0 0 30px #35A8FF"></div>
      <div class="abs hud" id="s1hud" style="left:120px;top:110px">// Libur panjang · 4 hari lagi</div>
      <div class="abs hud dim" id="s1hud2" style="right:120px;bottom:110px">Cuti sudah di-approve ✓</div>
      <div class="center big" id="s1t" style="font-size:170px;white-space:nowrap;text-align:center"></div>
    </div>`;
    return { line: root.querySelector('#s1line'), t: splitText(root.querySelector('#s1t'), 'Mau [b]liburan?[/b]'), tEl: root.querySelector('#s1t'), hud: root.querySelector('#s1hud'), hud2: root.querySelector('#s1hud2'), cam: root.querySelector('.cam') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'zoomThrough', 0.1, 0.22);
    const lw = E.o5(prog(lt, 0, 0.35));
    c.line.style.transform = `scaleX(${lw.toFixed(3)})`;
    op(c.line, 1 - prog(lt, 0.35, 0.7));
    riseIn(c.t, lt, 0.28, { stagger: 0.03, dur: 0.5, y: 120, scale: 0.6 });
    c.tEl.style.textShadow = `0 0 ${(30 + 30 * Math.sin(lt * 8)).toFixed(0)}px rgba(53,168,255,.5)`;
    op(c.hud, prog(lt, 0.5, 0.7)); op(c.hud2, prog(lt, 0.7, 0.9));
    c.hud.textContent = '// Libur panjang · 4 hari lagi'.slice(0, Math.floor(prog(lt, 0.5, 0.9) * 31));
    tf(c.cam, `scale(${lerp(1, 1.08, lt / dur).toFixed(4)})`);
  },
});

/* ---------- S2  dot map "Tapi… mau ke mana?"  1.5 – 3.1 ---------- */
const S2_PINS = [['Danau Toba?', 98.9, 2.6], ['Jogja?', 110.4, -7.8], ['Bromo?', 112.95, -7.94], ['Bali?', 115.2, -8.4], ['Labuan Bajo?', 119.9, -8.5], ['Raja Ampat?', 130.6, -0.4]];
addScene({
  id: 's2', start: 1.5, end: 3.1,
  build(root) {
    let pins = '', anchors = '';
    S2_PINS.forEach(([n, lo, la], i) => {
      const [x, y] = geo(lo, la);
      anchors += `<div class="abs s2a" style="left:${x - 1}px;top:${y - 1}px;width:2px;height:2px"></div>`;
      pins += `<div class="abs s2pin" style="left:0;top:0">
        <div class="s2pi" style="position:absolute;left:0;top:0;transform-origin:0 0">
          <div style="position:absolute;left:-26px;top:-62px;color:#FF6B24;filter:drop-shadow(0 0 10px rgba(255,107,36,.9))">${icon('pin', 52, '#FF6B24', 2.4)}</div>
          <div style="position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:#FF6B24;box-shadow:0 0 20px 6px rgba(255,107,36,.6)"></div>
          <div style="position:absolute;left:0;top:${-74 - [0, 0, 2, 1, 0, 0][i] * 64}px;width:2px;height:${40 + [0, 0, 2, 1, 0, 0][i] * 64}px;background:linear-gradient(#FF6B24,transparent);opacity:${[0, 0, 2, 1, 0, 0][i] ? 0.8 : 0}"></div>
          <div style="position:absolute;left:32px;top:${-74 - [0, 0, 2, 1, 0, 0][i] * 64}px;padding:8px 18px;border-radius:999px;background:rgba(15,23,42,.85);border:1.5px solid rgba(255,107,36,.7);font-size:28px;font-weight:700;white-space:nowrap;box-shadow:0 0 24px rgba(255,107,36,.35)">${n}</div>
        </div></div>`;
    });
    let qs = '';
    const r = mulberry(5);
    for (let i = 0; i < 14; i++) qs += `<div class="abs s2q display" style="left:${r() * 1800}px;top:${120 + r() * 800}px;font-size:${60 + r() * 120}px;color:rgba(255,255,255,${(0.08 + r() * 0.18).toFixed(2)})">?</div>`;
    root.innerHTML = `<div class="cam persp" style="perspective:1600px">
      ${qs}
      <div class="abs" id="s2plane" style="left:160px;top:300px;width:1610px;height:660px;transform-style:preserve-3d">
        <canvas id="s2cv" width="1610" height="660" style="position:absolute;left:0;top:0"></canvas>
        ${anchors}
      </div>
      ${pins}
      <div class="abs big" id="s2t" style="left:0;right:0;top:110px;text-align:center;font-size:110px"></div>
    </div>`;
    return { cv: root.querySelector('#s2cv'), plane: root.querySelector('#s2plane'), pins: [...root.querySelectorAll('.s2pin')], anchors: [...root.querySelectorAll('.s2a')], t: splitText(root.querySelector('#s2t'), 'Tapi… [o]mau ke mana?[/o]'), qs: [...root.querySelectorAll('.s2q')], dots: indoDots(9) };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'zoomOut', 'whipL', 0.25, 0.2);
    const tilt = 52 - lt * 4;
    c.plane.style.transform = `translateZ(${lerp(-200, 60, E.o3(lt / dur)).toFixed(1)}px) rotateX(${tilt}deg) rotateZ(${(-6 + lt * 3).toFixed(2)}deg)`;
    // dots reveal sweep
    const x2 = c.cv.getContext('2d');
    x2.clearRect(0, 0, 1610, 660);
    const rev = E.o3(prog(lt, 0, 0.7)) * 1900;
    for (const [x, y] of c.dots) {
      const d = rev - (x + y * 0.4);
      if (d < 0) continue;
      const hot = clamp(1 - d / 160);
      x2.fillStyle = hot > 0 ? `rgba(${Math.round(lerp(53, 255, hot))},${Math.round(lerp(168, 255, hot))},255,${0.55 + hot * 0.45})` : 'rgba(53,168,255,0.55)';
      x2.fillRect(x - 2.5, y - 2.5, 5, 5);
    }
    const rr = root.getBoundingClientRect();
    const sc = parseFloat(root.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1);
    c.pins.forEach((p, i) => {
      const t0 = 0.35 + i * 0.14, s = E.back(prog(lt, t0, t0 + 0.28));
      const a = c.anchors[i].getBoundingClientRect();
      // convert from screen space back to scene-local space (root may be scaled/translated)
      const lx = (a.left + a.width / 2 - rr.left) / sc, ly = (a.top + a.height / 2 - rr.top) / sc;
      p.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
      const pi = p.firstElementChild;
      pi.style.transform = `scale(${s.toFixed(3)})`;
      op(pi, prog(lt, t0, t0 + 0.08));
    });
    riseIn(c.t, lt, 0.1, { stagger: 0.03, dur: 0.45, y: 80 });
    c.qs.forEach((q, i) => { tf(q, `translateY(${(-lt * (30 + i * 6)).toFixed(1)}px) rotate(${(Math.sin(lt * 2 + i) * 12).toFixed(1)}deg)`); op(q, prog(lt, 0.2 + i * 0.05, 0.5 + i * 0.05)); });
  },
});
CAPS.push([2.2, 3.05, 0, 'Banyak pilihan, malah bingung…', 'warn']);

/* ---------- S3  search -> tab explosion  3.0 – 5.6 ---------- */
const S3_TITLES = ['10 Tempat WAJIB di Labuan Bajo!!', 'Itinerary 3D2N Komodo Murah', 'Harga kapal phinisi 2026?', 'Review hotel dekat pelabuhan', 'Cara ke Pulau Padar', 'Jadwal kapal Labuan Bajo', 'Budget backpacker NTT', 'Pink Beach worth it ga?', 'Sewa guide Komodo dimana', 'Tiket pesawat promo CGK-LBJ', 'Cuaca Labuan Bajo November', 'Open trip vs private trip'];
addScene({
  id: 's3', start: 3.0, end: 5.6,
  build(root) {
    let wins = '';
    const r = mulberry(17);
    const arts = ['padar', 'pinkbeach', 'komodo', 'manta'];
    S3_TITLES.forEach((tt, i) => {
      const x = 80 + r() * 1080, y = 90 + r() * 520, rot = (r() - 0.5) * 18;
      const img = i < 4 ? art(arts[i]) : '';
      wins += `<div class="win s3w" data-x="${x}" data-y="${y}" data-r="${rot}" style="left:0;top:0;will-change:transform">
        <div class="bar">${'<div class="tab" style="width:120px">' + tt.slice(0, 14) + '…</div>'.repeat(1)}<div class="tabs"></div></div>
        <div style="height:40px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 14px;gap:10px"><div style="flex:1;height:26px;border-radius:13px;background:#F1F5F9;font-size:13px;color:#94A3B8;padding:5px 14px">www.blog-wisata-${i + 1}.com/${tt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 26)}</div></div>
        <div style="padding:22px 26px;display:flex;gap:20px">
          <div style="flex:1"><div style="font-size:26px;font-weight:800;line-height:1.15">${tt}</div>
          ${'<div style="height:12px;border-radius:6px;background:#E2E8F0;margin-top:14px"></div>'.repeat(6)}</div>
          <div class="thumb" style="width:240px;height:200px;flex:0 0 auto;background:${['#FDBA74', '#93C5FD', '#FCA5A5', '#A7F3D0'][i % 4]}">${img}</div>
        </div></div>`;
    });
    root.innerHTML = `<div class="cam persp" style="perspective:1400px">
      <div class="abs" id="s3wins" style="inset:0;transform-style:preserve-3d">${wins}</div>
      <div class="abs" id="s3search" style="left:410px;top:440px;width:1100px">
        <div style="height:104px;border-radius:52px;background:#fff;display:flex;align-items:center;gap:22px;padding:0 40px;color:#0F172A;font-size:38px;font-weight:500;box-shadow:0 0 0 2px #35A8FF,0 0 40px rgba(53,168,255,.7),0 0 120px rgba(53,168,255,.3)">
          ${icon('search', 40, '#35A8FF', 2.6)}<span id="s3q"></span><span class="caret" id="s3c" style="height:42px"></span></div>
        <div id="s3sug" style="margin-top:14px;border-radius:26px;background:rgba(255,255,255,.96);padding:10px 0;color:#334155;font-size:26px;overflow:hidden">
          ${['itinerary labuan bajo 4 hari murah <b>2026</b>', 'itinerary labuan bajo 4 hari murah <b>backpacker</b>', 'itinerary labuan bajo 4 hari murah <b>pasangan</b>', 'itinerary labuan bajo 4 hari murah <b>tanpa guide?</b>'].map(s => `<div class="s3s" style="padding:12px 40px;display:flex;gap:18px;align-items:center">${icon('search', 24, '#94A3B8')}${s}</div>`).join('')}
        </div>
      </div>
      <div class="abs" id="s3count" style="right:110px;top:90px;text-align:right">
        <div class="hud" style="color:#F59E0B">Tab terbuka</div>
        <div class="display" id="s3n" style="font-size:220px;color:#fff;text-shadow:0 0 40px rgba(245,158,11,.8)">1</div>
      </div>
    </div>`;
    return { q: root.querySelector('#s3q'), caret: root.querySelector('#s3c'), search: root.querySelector('#s3search'), sug: root.querySelector('#s3sug'), sugs: [...root.querySelectorAll('.s3s')], wins: [...root.querySelectorAll('.s3w')], count: root.querySelector('#s3count'), n: root.querySelector('#s3n'), cam: root.querySelector('.cam') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'whipL', 'cut', 0.2, 0.1);
    const Q = 'itinerary labuan bajo 4 hari murah';
    c.q.textContent = typed(Q, lt, 0.12, 44);
    op(c.caret, caretOn(lt) ? 1 : 0);
    c.sugs.forEach((s, i) => { const p = E.o3(prog(lt, 0.55 + i * 0.05, 0.75 + i * 0.05)); op(s, p); tf(s, `translateY(${((1 - p) * -14).toFixed(1)}px)`); });
    op(c.sug, prog(lt, 0.5, 0.6));
    // search flies back as tabs explode
    const ps = E.i3(prog(lt, 0.95, 1.25));
    tf(c.search, `translateZ(${(ps * 600).toFixed(0)}px) scale(${(1 - ps * 0.2).toFixed(3)})`);
    op(c.search, 1 - ps);
    // windows
    const n = c.wins.length;
    c.wins.forEach((w, i) => {
      const t0 = 1.0 + Math.pow(i / n, 0.8) * 1.1;
      const p = E.o4(prog(lt, t0, t0 + 0.35));
      const x = +w.dataset.x, y = +w.dataset.y, r = +w.dataset.r;
      const drift = (lt - t0) * 18;
      tf(w, `translate3d(${(x + drift * (i % 2 ? 1 : -1)).toFixed(1)}px,${(y + (1 - p) * 300).toFixed(1)}px,${lerp(-1400, i * 14 - 80, p).toFixed(0)}px) rotateZ(${(r * p).toFixed(2)}deg) rotateY(${((1 - p) * 40).toFixed(1)}deg)`);
      op(w, p);
      // growing tab strip
      const tabs = w.querySelector('.tabs');
      const k = Math.floor(clamp((lt - t0) / 1.3) * 9);
      if (tabs.dataset.k != k) { tabs.dataset.k = k; tabs.style.display = 'flex'; tabs.style.gap = '2px'; tabs.innerHTML = '<div class="tab" style="width:56px">…</div>'.repeat(k); }
    });
    const cnt = Math.max(1, Math.round(E.i3(prog(lt, 1.0, 2.3)) * 39) + 1);
    c.n.textContent = cnt;
    op(c.count, prog(lt, 1.0, 1.15));
    tf(c.count, `scale(${(1 + 0.08 * Math.sin(lt * 30) * prog(lt, 1.6, 2.3)).toFixed(3)})`);
    tf(c.cam, `scale(${lerp(1, 1.06, prog(lt, 1, dur)).toFixed(4)}) rotateZ(${(prog(lt, 1.6, dur) * -1.5).toFixed(2)}deg)`);
  },
});
CAPS.push([4.15, 5.5, 0, 'Riset sana-sini, tab makin banyak…', 'warn']);
SHAKE.push([5.2, 10, 0.35]);
GLITCH.push([5.48, 5.56]);

/* ---------- S4  messy spreadsheet  5.5 – 6.6 ---------- */
addScene({
  id: 's4', start: 5.5, end: 6.6,
  build(root) {
    const head = ['Hari', 'Jam', 'Tempat', 'Transport', 'Biaya', 'Catatan'];
    const rows = [
      ['1', '07.00?', 'Pulau Padar', 'kapal ???', 'Rp ???', 'cek lagi'],
      ['1', '09.00', 'Pink Beach', '???', '#REF!', 'jauh ga?'],
      ['1', '09.30', 'Komodo', 'BENTROK', 'Rp 1,2jt?', ''],
      ['2', '??', 'Manta Point', 'tergantung cuaca', '#VALUE!', 'tanya siapa?'],
      ['2', '13.00', 'Kampung adat?', 'ojek?', 'Rp ???', 'ga yakin'],
      ['3', '—', '???', '???', '#REF!', 'BELUM ADA'],
      ['3', '05.00', 'Sunrise di mana?', '', 'Rp 0?', 'hotel jauh'],
      ['4', '10.00', 'Pulang', 'tiket blm', 'MAHAL', '!!!'],
    ];
    const bad = v => /\?|#|BENTROK|BELUM|MAHAL|!!!/.test(v);
    let cells = '';
    const cw = [110, 150, 300, 260, 200, 260];
    head.forEach((hd, j) => cells += `<div class="s4c" style="left:${cw.slice(0, j).reduce((a, b) => a + b, 0)}px;top:0;width:${cw[j]}px;height:64px;background:#E2E8F0;font-weight:800">${hd}</div>`);
    rows.forEach((r, i) => r.forEach((v, j) => {
      const b = bad(v);
      cells += `<div class="s4c ${b ? 's4bad' : ''}" style="left:${cw.slice(0, j).reduce((a, b) => a + b, 0)}px;top:${64 + i * 64}px;width:${cw[j]}px;height:64px;${b ? 'color:#DC2626;font-weight:700' : ''}">${v}</div>`;
    }));
    root.innerHTML = `<style>.s4c{position:absolute;border:1px solid #CBD5E1;font-size:24px;padding:16px 14px;color:#0F172A;background:#fff;white-space:nowrap;overflow:hidden}</style>
    <div class="cam persp"><div class="abs" id="s4sheet" style="left:220px;top:120px;width:1280px;height:640px;transform-style:preserve-3d;transform-origin:50% 50%">
      <div class="abs" style="left:0;top:-58px;font-size:26px;font-weight:700;color:#fff;display:flex;gap:16px;align-items:center"><div style="width:40px;height:40px;border-radius:8px;background:#16A34A"></div>rencana_liburan_FINAL_rev7(2).xlsx</div>
      <div class="abs" style="left:0;top:0;width:1280px;height:576px;box-shadow:0 30px 90px rgba(0,0,0,.6),0 0 60px rgba(220,38,38,.35);background:#fff">${cells}</div>
    </div></div>`;
    return { sheet: root.querySelector('#s4sheet'), cells: [...root.querySelectorAll('.s4c')], bad: [...root.querySelectorAll('.s4bad')] };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'cut');
    tf(c.sheet, `rotateX(${lerp(26, 14, lt / dur).toFixed(2)}deg) rotateY(${lerp(-18, -8, lt / dur).toFixed(2)}deg) rotateZ(${lerp(3, 1, lt / dur).toFixed(2)}deg) translateZ(${lerp(-100, 60, E.o3(lt / dur)).toFixed(0)}px)`);
    c.cells.forEach((cl, i) => { const t0 = hash(i) * 0.3; const p = E.o3(prog(lt, t0, t0 + 0.12)); op(cl, p); });
    c.bad.forEach((cl, i) => {
      const t0 = 0.35 + hash(i + 50) * 0.5, on = lt > t0;
      const blink = on && Math.floor((lt - t0) * 10) % 2 === 0;
      cl.style.background = on ? (blink ? '#FEE2E2' : '#FECACA') : '#fff';
      cl.style.boxShadow = on ? 'inset 0 0 0 2px #DC2626' : 'none';
      tf(cl, on ? `translate(${(noise1(lt * 30, i) * 4).toFixed(1)}px,${(noise1(lt * 30, i + 9) * 3).toFixed(1)}px)` : '');
    });
  },
});
CAPS.push([5.6, 6.55, 0, 'Jadwal berantakan.', 'warn']);
SHAKE.push([5.85, 6, 0.2], [6.1, 6, 0.2]);

/* ---------- S5  notification storm  6.5 – 7.6 ---------- */
const S5_N = [
  ['plane', '#DC2626', '#FEE2E2', 'Harga tiket naik 30%', 'Jakarta – Labuan Bajo, 12 Nov', 600, 170, -4],
  ['hotel', '#F59E0B', '#FEF3C7', 'Hotel penuh', 'Sisa 0 kamar di tanggalmu', 1180, 260, 3],
  ['chat', '#35A8FF', '#EAF5FF', 'Grup “Liburan Bareng”', 'Jadi ke mana nih??? 3 orang beda pendapat', 150, 420, 2],
  ['alert', '#DC2626', '#FEE2E2', 'Jadwal bentrok', 'Kapal berangkat 07.00, kamu baru mendarat', 980, 520, -3],
  ['sun', '#F59E0B', '#FEF3C7', 'Cuaca berubah', 'Snorkeling mungkin dibatalkan', 420, 650, -2],
  ['chat', '#35A8FF', '#EAF5FF', 'Mama', 'Udah booking belum? Jangan mendadak lho', 1260, 700, 4],
  ['wallet', '#DC2626', '#FEE2E2', 'Budget kurang!', 'Kurang Rp 2,4 jt dari rencana', 720, 370, 1],
];
addScene({
  id: 's5', start: 6.5, end: 7.6,
  build(root) {
    root.innerHTML = `<div class="cam persp">${S5_N.map(([ic, col, bgc, t, d, x, y, r]) => `
      <div class="notif s5n" data-r="${r}" style="left:${x}px;top:${y}px;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 2px ${col}55,0 0 40px ${col}55">
        <div class="ni" style="background:${bgc};color:${col}">${icon(ic, 32, col, 2.3)}</div>
        <div><div class="nt">${t}</div><div class="nd">${d}</div></div>
        <div style="position:absolute;right:20px;top:16px;font-size:15px;color:#94A3B8">baru saja</div></div>`).join('')}</div>`;
    return { n: [...root.querySelectorAll('.s5n')], cam: root.querySelector('.cam') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'cut');
    c.n.forEach((n, i) => {
      const t0 = 0.04 + i * 0.1, d = lt - t0;
      const s = d > 0 ? spring(d, 20, 9) : 0;
      const r = +n.dataset.r;
      const shake = d > 0 && d < 0.3 ? Math.sin(d * 80) * (0.3 - d) * 20 : 0;
      tf(n, `translateZ(${((1 - s) * -300).toFixed(0)}px) scale(${(0.6 + 0.4 * s).toFixed(3)}) rotate(${(r + shake * 0.3).toFixed(2)}deg) translateX(${shake.toFixed(1)}px)`);
      op(n, clamp(d * 12));
    });
    tf(c.cam, `scale(${lerp(1.0, 1.08, lt / dur).toFixed(4)})`);
  },
});
CAPS.push([6.6, 7.55, 0, 'Info di mana-mana, makin pusing.', 'warn']);

/* ---------- S6  budget gauge  7.5 – 8.6 ---------- */
addScene({
  id: 's6', start: 7.5, end: 8.6,
  build(root) {
    let ticks = '';
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI + i / 40 * Math.PI, r1 = 380, r2 = i % 5 ? 400 : 420;
      const col = i < 20 ? '#16A34A' : i < 30 ? '#F59E0B' : '#DC2626';
      ticks += `<line x1="${500 + Math.cos(a) * r1}" y1="${500 + Math.sin(a) * r1}" x2="${500 + Math.cos(a) * r2}" y2="${500 + Math.sin(a) * r2}" stroke="${col}" stroke-width="${i % 5 ? 3 : 6}"/>`;
    }
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="s6g" style="left:460px;top:120px;width:1000px;height:620px">
        <svg width="1000" height="620" viewBox="0 0 1000 620" style="overflow:visible">
          <defs><linearGradient id="s6arc" x1="0" x2="1"><stop offset="0" stop-color="#16A34A"/><stop offset=".55" stop-color="#F59E0B"/><stop offset="1" stop-color="#DC2626"/></linearGradient></defs>
          <path d="M140,500 A360,360 0 0 1 860,500" stroke="#1E293B" stroke-width="44" fill="none" stroke-linecap="round"/>
          <path id="s6fill" d="M140,500 A360,360 0 0 1 860,500" stroke="url(#s6arc)" stroke-width="44" fill="none" stroke-linecap="round" stroke-dasharray="1131" stroke-dashoffset="1131" style="filter:drop-shadow(0 0 18px rgba(220,38,38,.7))"/>
          ${ticks}
          <g id="s6needle"><path d="M484,262 L500,150 L516,262Z" fill="#fff" style="filter:drop-shadow(0 0 10px #fff)"/></g>
          <text x="140" y="570" fill="#94A3B8" font-size="26" text-anchor="middle" font-family="Mono">Rp 0</text>
          <text x="860" y="570" fill="#94A3B8" font-size="26" text-anchor="middle" font-family="Mono">Rp 10 jt</text>
          <line x1="500" y1="110" x2="500" y2="150" stroke="#fff" stroke-width="4" stroke-dasharray="6 6" transform="rotate(0 500 500)"/>
        </svg>
        <div class="abs" style="left:0;right:0;top:250px;text-align:center">
          <div class="hud" style="color:#94A3B8">Perkiraan total biaya</div>
          <div class="display" id="s6v" style="font-size:150px;color:#fff;margin-top:10px">Rp 0</div>
          <div style="font-size:32px;color:#94A3B8;margin-top:14px">Budget kamu cuma <b style="color:#fff">Rp 5 jt</b></div>
        </div>
      </div>
      <div class="abs" id="s6clock" style="left:140px;top:150px;padding:18px 28px;border-radius:20px;background:rgba(15,23,42,.8);border:1.5px solid rgba(245,158,11,.6);display:flex;gap:16px;align-items:center;font-size:30px;font-weight:700">${icon('clock', 40, '#F59E0B', 2.4)}<span>Waktu riset: <span id="s6h">0 jam</span></span></div>
    </div>`;
    return { fill: root.querySelector('#s6fill'), needle: root.querySelector('#s6needle'), v: root.querySelector('#s6v'), h: root.querySelector('#s6h'), g: root.querySelector('#s6g'), clock: root.querySelector('#s6clock') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'zoomOut', 'cut', 0.2);
    const p = E.o3(prog(lt, 0.1, 0.75));
    const over = p * 0.98 + (lt > 0.75 ? Math.sin((lt - 0.75) * 50) * 0.015 : 0);
    c.fill.setAttribute('stroke-dashoffset', (1131 * (1 - over)).toFixed(1));
    c.needle.setAttribute('transform', `rotate(${(-90 + over * 180).toFixed(2)} 500 500)`);
    const v = 9.8 * p;
    c.v.textContent = 'Rp ' + v.toFixed(1).replace('.', ',') + ' jt';
    c.v.style.color = v > 5 ? '#FCA5A5' : '#fff';
    c.v.style.textShadow = v > 5 ? '0 0 40px rgba(220,38,38,.9)' : 'none';
    c.h.textContent = Math.round(E.i3(prog(lt, 0.1, 0.9)) * 48) + ' jam';
    tf(c.clock, `translateY(${((1 - E.o4(prog(lt, 0.05, 0.3))) * -40).toFixed(1)}px)`);
    op(c.clock, prog(lt, 0.05, 0.2));
    tf(c.g, `scale(${lerp(0.96, 1.04, lt / dur).toFixed(4)})`);
  },
});
CAPS.push([7.6, 8.5, 0, 'Budget jebol.', 'warn']);
SHAKE.push([8.25, 12, 0.3]);

/* ---------- S7  slam words  8.5 – 10.0 ---------- */
addScene({
  id: 's7', start: 8.5, end: 10.0,
  build(root) {
    let frags = '';
    const r = mulberry(77);
    for (let i = 0; i < 18; i++) frags += `<div class="abs s7f" style="left:${r() * 1800}px;top:${r() * 1000}px;width:${120 + r() * 260}px;height:${60 + r() * 160}px;border-radius:14px;background:rgba(255,255,255,${(0.04 + r() * 0.08).toFixed(2)});border:1px solid rgba(220,38,38,.25)"></div>`;
    root.innerHTML = `<div class="cam">${frags}
      ${['Bingung.', 'Takut salah.', 'Ujung-ujungnya…'].map((w, i) => `<div class="center display s7w" style="font-size:${i === 2 ? 210 : 280}px;white-space:nowrap;color:#fff;text-shadow:0 0 60px rgba(220,38,38,.75)">${w}</div>`).join('')}
    </div>`;
    return { w: [...root.querySelectorAll('.s7w')], f: [...root.querySelectorAll('.s7f')] };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'cut');
    c.w.forEach((w, i) => {
      const t0 = i * 0.5, on = lt >= t0 && lt < t0 + 0.5;
      w.style.display = on ? 'block' : 'none';
      if (!on) return;
      const d = lt - t0, s = lerp(1.7, 1, E.o5(prog(d, 0, 0.12))) + d * 0.08;
      tf(w, `translate(-50%,-50%) scale(${s.toFixed(4)})`);
      op(w, prog(d, 0, 0.04));
    });
    c.f.forEach((f, i) => tf(f, `translate(${(Math.sin(i) * lt * 60).toFixed(1)}px,${(Math.cos(i) * lt * 40).toFixed(1)}px) rotate(${(i * 7 + lt * 10).toFixed(1)}deg)`));
  },
});
FLASH.push([8.5, 0.35, 0.18, '#DC2626'], [9.0, 0.35, 0.18, '#DC2626'], [9.5, 0.3, 0.18, '#DC2626']);
SHAKE.push([8.5, 22, 0.25], [9.0, 22, 0.25], [9.5, 18, 0.25]);

/* ---------- S8  "…nggak jadi liburan."  10.0 – 10.8 ---------- */
addScene({
  id: 's8', start: 10.0, end: 10.8,
  build(root) {
    root.innerHTML = `<div class="cam" id="s8cam" style="transform-origin:50% 50%">
      <div class="center big" style="font-size:130px;white-space:nowrap;color:#fff">…nggak jadi <span style="color:#FCA5A5">liburan.</span></div>
      <div class="abs" id="s8bar" style="left:0;right:0;top:536px;height:8px;background:#fff;box-shadow:0 0 40px #fff;opacity:0"></div>
    </div>`;
    return { cam: root.querySelector('#s8cam'), bar: root.querySelector('#s8bar') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'cut');
    const p1 = E.i4(prog(lt, 0.5, 0.64)), p2 = E.i3(prog(lt, 0.64, 0.78));
    tf(c.cam, `scale(${lerp(1, 1.6, p2).toFixed(3)},${lerp(1, 0.004, p1).toFixed(4)})`);
    op(c.bar, p1 > 0.9 ? 1 - p2 : 0);
    tf(c.bar, `scaleX(${(1 - p2).toFixed(3)})`);
    op(root.firstElementChild.firstElementChild, 1 - p1 * 0.6);
  },
});
GLITCH.push([10.0, 10.12], [10.3, 10.36]);

/* ---------- S9  "Tenang."  10.8 – 12.0 ---------- */
addScene({
  id: 's9', start: 10.8, end: 12.05,
  build(root) {
    let rays = '';
    for (let i = 0; i < 26; i++) { const a = i / 26 * 360; rays += `<div class="abs s9r" data-a="${a}" style="left:960px;top:540px;width:900px;height:2px;transform-origin:0 50%;background:linear-gradient(90deg,rgba(255,255,255,.9),rgba(53,168,255,0))"></div>`; }
    root.innerHTML = `<div class="cam">
      ${rays}
      <div class="center" style="text-align:center;top:520px">
        <div class="big glowtext" id="s9a" style="font-size:150px;letter-spacing:.02em">Tenang.</div>
        <div id="s9b" style="font-size:52px;font-weight:500;color:#CFE8FF;margin-top:20px;white-space:nowrap"></div>
      </div>
      <div class="abs" id="s9core" style="left:960px;top:540px;width:20px;height:20px;margin:-10px;border-radius:50%;background:#fff;box-shadow:0 0 60px 30px rgba(53,168,255,.9),0 0 200px 80px rgba(53,168,255,.5)"></div>
    </div>`;
    return { a: root.querySelector('#s9a'), b: splitText(root.querySelector('#s9b'), 'Ada cara yang lebih [b]mudah[/b].'), rays: [...root.querySelectorAll('.s9r')], core: root.querySelector('#s9core') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'fade', 'cut', 0.2);
    const pa = E.o3(prog(lt, 0.05, 0.5));
    op(c.a, pa * (1 - prog(lt, 0.95, 1.1)));
    c.a.style.letterSpacing = lerp(0.3, 0.02, pa).toFixed(3) + 'em';
    c.a.style.filter = `blur(${((1 - pa) * 14).toFixed(1)}px)`;
    riseIn(c.b, lt, 0.42, { stagger: 0.02, dur: 0.35, y: 30 });
    riseOut(c.b, lt, 0.95, { dur: 0.15, y: -10, stagger: 0.003 });
    const pc = prog(lt, 0.85, 1.25);
    c.rays.forEach((r, i) => {
      const a = +r.dataset.a + lt * 20;
      const L = (1 - E.i3(pc)) * (0.4 + hash(i) * 0.6);
      tf(r, `rotate(${a}deg) scaleX(${L.toFixed(3)})`);
      op(r, pc > 0 ? pc * 1.5 : 0);
    });
    const cs = E.i4(pc);
    tf(c.core, `scale(${(0.2 + cs * 4).toFixed(3)})`);
    op(c.core, pc > 0 ? 0.3 + cs : 0);
  },
});

/* ---------- S10  logo reveal  12.0 – 14.6 ---------- */
addScene({
  id: 's10', start: 12.0, end: 14.6, z: 2,
  build(root) {
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="s10ring" style="left:960px;top:470px;width:400px;height:400px;margin:-200px;border-radius:50%;border:3px solid #35A8FF;box-shadow:0 0 50px rgba(53,168,255,.9),inset 0 0 50px rgba(53,168,255,.6)"></div>
      <div class="abs" id="s10ring2" style="left:960px;top:470px;width:400px;height:400px;margin:-200px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7)"></div>
      <div class="abs" id="s10logo" style="left:510px;top:300px;width:900px;height:341px;filter:drop-shadow(0 0 30px rgba(53,168,255,.85)) drop-shadow(0 0 80px rgba(53,168,255,.45))">${logoSVG('#35A8FF')}</div>
      <div class="abs" id="s10shine" style="left:510px;top:300px;width:900px;height:341px;mix-blend-mode:screen;opacity:.9;-webkit-mask-image:linear-gradient(100deg,transparent 40%,#000 50%,transparent 60%);-webkit-mask-size:300% 100%;-webkit-mask-repeat:no-repeat">${logoSVG('#ffffff')}</div>
      ${['tl', 'tr', 'bl', 'br'].map(k => `<div class="abs s10br" data-k="${k}" style="width:46px;height:46px;border-color:#35A8FF;border-style:solid;border-width:${k[0] === 't' ? 3 : 0}px ${k[1] === 'r' ? 3 : 0}px ${k[0] === 'b' ? 3 : 0}px ${k[1] === 'l' ? 3 : 0}px;left:${k[1] === 'l' ? 450 : 1424}px;top:${k[0] === 't' ? 250 : 646}px"></div>`).join('')}
      <div class="abs hud" id="s10sub" style="left:0;right:0;top:700px;text-align:center;font-size:30px;letter-spacing:.6em;color:#CFE8FF">KELILING NUSANTARA</div>
      <div class="abs" id="s10tag" style="left:0;right:0;top:770px;text-align:center;font-size:46px;font-weight:600;color:#fff"></div>
    </div>`;
    return {
      logo: root.querySelector('#s10logo'), shine: root.querySelector('#s10shine'), ring: root.querySelector('#s10ring'), ring2: root.querySelector('#s10ring2'),
      letters: [...root.querySelectorAll('#s10logo .lgl')], sL: [...root.querySelectorAll('#s10shine .lgl')], br: [...root.querySelectorAll('.s10br')],
      sub: root.querySelector('#s10sub'), tag: splitText(root.querySelector('#s10tag'), 'Teman merencanakan [b]liburanmu.[/b]'), cam: root.querySelector('.cam'),
    };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'zoomThrough', 0.1, 0.25);
    const ps = E.o5(prog(lt, 0, 0.6));
    tf(c.logo, `scale(${lerp(1.25, 1, ps).toFixed(4)})`); tf(c.shine, `scale(${lerp(1.25, 1, ps).toFixed(4)})`);
    c.letters.forEach((l, i) => { const p = E.o5(prog(lt, 0.02 + i * 0.05, 0.4 + i * 0.05)); l.setAttribute('transform', `translate(0 ${((1 - p) * 360).toFixed(1)})`); c.sL[i].setAttribute('transform', `translate(0 ${((1 - p) * 360).toFixed(1)})`); });
    const sp = prog(lt, 0.55, 1.15);
    c.shine.style.webkitMaskPosition = `${lerp(100, 0, sp).toFixed(1)}% 0`;
    op(c.shine, sp > 0 && sp < 1 ? 0.9 : 0);
    const r1 = E.o4(prog(lt, 0, 0.9));
    tf(c.ring, `scale(${lerp(0.2, 4.2, r1).toFixed(3)})`); op(c.ring, (1 - r1) * 0.9);
    const r2 = E.o4(prog(lt, 0.08, 1.1));
    tf(c.ring2, `scale(${lerp(0.2, 3.4, r2).toFixed(3)})`); op(c.ring2, (1 - r2) * 0.7);
    c.br.forEach(b => { const k = b.dataset.k, p = E.o4(prog(lt, 0.3, 0.7)); const dx = (k[1] === 'l' ? -1 : 1) * (1 - p) * 120, dy = (k[0] === 't' ? -1 : 1) * (1 - p) * 80; tf(b, `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`); op(b, p * 0.9); });
    const pS = E.o4(prog(lt, 0.45, 1.0));
    op(c.sub, pS); c.sub.style.letterSpacing = lerp(1.2, 0.6, pS).toFixed(3) + 'em';
    riseIn(c.tag, lt, 0.95, { stagger: 0.02, dur: 0.4, y: 40 });
    tf(c.cam, `scale(${lerp(1, 1.05, lt / dur).toFixed(4)})`);
  },
});
FLASH.push([12.0, 1, 0.45]);
SHAKE.push([12.0, 16, 0.4]);
