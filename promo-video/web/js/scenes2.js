/* =========================================================
   ACT 2 — FEATURE 01: CUSTOM ITINERARY (14.5 – 34.1 s)
   ========================================================= */

/* ---------- S11  "Rencana liburan beres dalam 5 menit"  14.5 – 16.5 ---------- */
addScene({
  id: 's11', start: 14.5, end: 16.5,
  build(root) {
    const orb = (ic, x, y, col) => `<div class="abs s11o" style="left:${x}px;top:${y}px;width:110px;height:110px;border-radius:30px;background:rgba(15,23,42,.85);border:1.5px solid ${col};display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px ${col}88">${icon(ic, 52, col, 2.2)}</div>`;
    root.innerHTML = `<div class="cam persp">
      ${orb('pin', 230, 230, '#35A8FF')}${orb('cal', 1560, 200, '#35A8FF')}${orb('wallet', 1580, 720, '#FF6B24')}${orb('users', 260, 700, '#35A8FF')}
      <div class="abs" style="left:0;right:0;top:250px;text-align:center">
        <div class="hud" id="s11h" style="font-size:24px">Fitur 01 · Itinerary sesuai keinginanmu</div>
        <div class="abs" id="s11l" style="left:660px;right:660px;top:44px;height:2px;background:#35A8FF;box-shadow:0 0 14px #35A8FF"></div>
      </div>
      <div class="abs big" id="s11t" style="left:0;right:0;top:350px;text-align:center;font-size:136px;line-height:1.08"></div>
    </div>`;
    return { t: splitText(root.querySelector('#s11t'), 'Rencana liburan[br][o]beres dalam 5 menit.[/o]', 'wd'), h: root.querySelector('#s11h'), l: root.querySelector('#s11l'), o: [...root.querySelectorAll('.s11o')] };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'zoomOut', 'whipL', 0.3, 0.2);
    riseIn(c.t, lt, 0.08, { stagger: 0.09, dur: 0.5, y: 100, rot: 4 });
    op(c.h, prog(lt, 0.7, 0.9));
    c.h.textContent = 'Fitur 01 · Itinerary sesuai keinginanmu'.slice(0, Math.ceil(prog(lt, 0.7, 1.2) * 39));
    tf(c.l, `scaleX(${E.o4(prog(lt, 0.6, 1.1)).toFixed(3)})`);
    c.o.forEach((o, i) => { const p = E.back(prog(lt, 0.3 + i * 0.08, 0.7 + i * 0.08)); tf(o, `translateY(${(Math.sin(lt * 2 + i * 1.7) * 14).toFixed(1)}px) scale(${p.toFixed(3)}) rotate(${(Math.sin(lt + i) * 8).toFixed(1)}deg)`); });
  },
});

/* ---------- shared UI builders ---------- */
/* ---------- shared UI builders (mirrors the Kelana web design) ---------- */
function navbarHTML(active = 'Jelajah') {
  return `<div class="navbar" style="height:84px;padding:0 60px;font-size:18px;gap:0;justify-content:space-between">
    <div style="width:118px;height:44px">${logoSVG('#35A8FF')}</div>
    <div style="display:flex;gap:44px;font-weight:600">${['Beranda', 'Jelajah', 'Forum', 'Booking', 'Trip Saya'].map(n => `<span style="${n === active ? 'color:#35A8FF' : ''}">${n}</span>`).join('')}</div>
    <div style="display:flex;gap:26px;align-items:center;font-weight:600"><span>Masuk</span><span class="btn" style="height:46px;padding:0 26px;font-size:17px">Daftar</span></div></div>`;
}
function stepperHTML(n) {
  const st = (i, l) => {
    const on = i === n;
    return `<div style="display:flex;align-items:center;gap:12px;color:${on ? '#35A8FF' : '#94A3B8'};font-weight:600;font-size:19px">
      <div style="width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;${on ? 'background:#35A8FF;color:#fff;box-shadow:0 0 18px rgba(53,168,255,.7)' : 'background:#fff;border:1.5px solid #E2E8F0;color:#64748B'}">${i}</div>${l}</div>`;
  };
  return `<div style="display:flex;align-items:center;gap:16px">${st(1, 'Dasar')}<div style="width:60px;height:2px;background:#E2E8F0"></div>${st(2, 'Minat')}<div style="width:60px;height:2px;background:#E2E8F0"></div>${st(3, 'Rencana')}</div>`;
}
function summaryHTML(rows, extra = '') {
  return `<div style="padding:26px 24px">
    <div style="font-size:24px;font-weight:600">Ringkasan</div>
    <div class="thumb" style="height:200px;margin-top:16px;border-radius:16px">${art('balibeach')}</div>
    ${rows.map(([k, id, v]) => `<div style="display:flex;justify-content:space-between;font-size:17px;margin-top:14px"><span style="color:#64748B">${k}</span><b id="${id}" style="font-weight:700">${v}</b></div>`).join('')}
    ${extra}</div>`;
}
/* light "web page" panel floating on the dark stage */
function pageShell(h, inner) {
  return `<div class="abs kpage" style="left:200px;top:0;width:1520px;height:${h}px;background:#F8FAFC;border-radius:28px;overflow:hidden;color:#0F172A;
    box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1.5px rgba(53,168,255,.55),0 0 70px rgba(53,168,255,.35);transform-origin:760px ${h / 2}px">
    ${navbarHTML('Jelajah')}${inner}</div>`;
}
/* place the page so that page-y `fy` sits at screen-y 470 */
function camPage(el, H, fy, S, extra = '') {
  const top = 490 - (fy - H / 2) * S - H / 2;
  el.style.transform = `translate3d(0px,${top.toFixed(1)}px,0) ${extra} scale(${S})`;
}
const uiCard = (x, y, w, h, inner, id = '') => `<div class="abs" ${id ? `id="${id}"` : ''} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:#fff;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 4px 18px rgba(15,23,42,.05)">${inner}</div>`;
const uiChoice = (x, y, w, h, ic, t, d, cls = '', icoStyle = '') => `<div class="abs ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border:1.5px solid #E2E8F0;border-radius:18px;background:#fff;padding:20px">
  <div style="width:46px;height:46px;border-radius:12px;background:#EAF5FF;display:flex;align-items:center;justify-content:center;${icoStyle}">${icon(ic, 24, icoStyle.includes('color') ? 'currentColor' : '#35A8FF', 2)}</div>
  <div style="font-size:20px;font-weight:700;margin-top:16px">${t}</div><div style="font-size:15px;color:#64748B;margin-top:6px">${d}</div>
  <div class="check" style="right:14px;top:14px;opacity:0;width:30px;height:30px">${icon('check', 17, '#fff', 3)}</div></div>`;
function setSel(el, on, t0, lt) {
  el.style.borderColor = on ? '#35A8FF' : '#E2E8F0';
  el.style.background = on ? '#EAF5FF' : '#fff';
  el.style.boxShadow = on ? '0 0 0 3px rgba(53,168,255,.18),0 0 26px rgba(53,168,255,.45)' : '';
  const ck = el.querySelector('.check');
  op(ck, on ? 1 : 0); tf(ck, `scale(${on ? E.back(prog(lt, t0, t0 + 0.18)).toFixed(3) : 0})`);
  tf(el, `scale(${(on ? 1 + 0.05 * Math.exp(-(lt - t0) * 9) : 1).toFixed(4)})`);
}
const inputBox = (id, ph, rightIcon = '') => `<div class="input" id="${id}" style="height:62px;border-radius:14px;font-size:20px;justify-content:space-between"><span><span class="v"></span><span class="caret" style="height:24px;opacity:0"></span><span class="ph" style="color:#94A3B8">${ph}</span></span>${rightIcon}</div>`;

/* ---------- S12  Step 1 — "Cerita dulu soal rencanamu"  16.4 – 20.6 ---------- */
const S12_H = 1250;
addScene({
  id: 's12', start: 16.4, end: 20.6, z: 2,
  build(root) {
    const lbl = (x, y, t) => `<div class="abs" style="left:${x}px;top:${y}px;font-size:18px;font-weight:600">${t}</div>`;
    const hint = (x, y, t, id = '') => `<div class="abs" ${id ? `id="${id}"` : ''} style="left:${x}px;top:${y}px;font-size:15px;color:#64748B">${t}</div>`;
    const calIco = icon('cal', 22, '#0F172A', 1.8);
    const cardA = uiCard(60, 250, 960, 380, `
      <div class="abs" style="left:32px;top:28px;font-size:27px;font-weight:700">Ke mana dan kapan?</div>
      ${lbl(32, 92, 'Tujuan utama')}<div class="abs" style="left:32px;top:124px;width:430px">${inputBox('in1', '')}</div>${hint(32, 196, 'Bisa tambah kota kedua nanti.')}
      ${lbl(498, 92, 'Titik keberangkatan')}<div class="abs" style="left:498px;top:124px;width:430px">${inputBox('in2', '')}</div>${hint(498, 196, 'Dipakai buat estimasi tiket pesawat.')}
      ${lbl(32, 238, 'Tanggal pergi')}<div class="abs" style="left:32px;top:270px;width:430px">${inputBox('in3', 'mm/dd/yyyy', calIco)}</div>
      ${lbl(498, 238, 'Tanggal pulang')}<div class="abs" style="left:498px;top:270px;width:430px">${inputBox('in4', 'mm/dd/yyyy', calIco)}</div>${hint(498, 342, '4 hari 3 malam', 'dhint')}`);
    const cardB = uiCard(60, 650, 960, 270, `
      <div class="abs" style="left:32px;top:28px;font-size:27px;font-weight:700">Jalan sama siapa?</div>
      ${uiChoice(32, 92, 288, 150, 'compass', 'Sendiri', 'Fleksibel, hemat', 'o1')}${uiChoice(336, 92, 288, 150, 'heart', 'Pasangan', '2 orang', 'o2')}${uiChoice(640, 92, 288, 150, 'users', 'Rombongan', '3–12 orang', 'o3')}`);
    const cardC = uiCard(60, 940, 960, 200, `
      <div class="abs" style="left:32px;top:28px;font-size:27px;font-weight:700">Budget per orang</div>
      <div class="abs" id="bval" style="right:32px;top:26px;font-size:28px;font-weight:700;color:#4087C4">Rp 0,50 jt</div>
      <div class="abs" style="left:32px;top:96px;width:896px;height:8px;border-radius:4px;background:#E2E8F0"><div id="bfill" style="height:100%;width:0;border-radius:4px;background:#35A8FF"></div></div>
      <div class="abs" id="knob" style="left:32px;top:100px;width:24px;height:24px;margin:-12px;border-radius:50%;background:#35A8FF;box-shadow:0 0 0 5px rgba(53,168,255,.2),0 0 16px rgba(53,168,255,.9)"></div>
      ${hint(32, 120, 'Rp 500 rb')}<div class="abs" style="right:32px;top:120px;font-size:15px;color:#64748B">Rp 15 jt</div>
      ${hint(32, 156, 'Belum termasuk tiket pesawat. Kelana bakal nyusun rencana yang pas di angka ini.')}`);
    root.innerHTML = `<div class="cam persp" style="perspective:2600px">
      ${pageShell(S12_H, `
        <div class="abs eyebrow" style="left:60px;top:128px;font-size:15px">Penyusun itinerary</div>
        <div class="abs" style="left:60px;top:154px;font-size:42px;font-weight:700;letter-spacing:-.02em">Cerita dulu soal rencanamu</div>
        <div class="abs" style="right:60px;top:140px">${stepperHTML(1)}</div>
        ${cardA}${cardB}${cardC}
        <div class="abs" style="left:60px;top:1160px;height:62px;display:flex;align-items:center;gap:10px;font-size:20px;font-weight:600">${icon('arrow', 20, '#0F172A', 2.4).replace('<svg', '<svg style="transform:scaleX(-1);display:block"')} Batal</div>
        <div class="abs btn" id="next" style="left:740px;top:1158px;width:280px;height:66px;font-size:21px;font-weight:600">Lanjut ke minat ${icon('arrow', 22, '#fff', 2.4)}</div>
        <div class="abs" id="sum" style="left:1060px;top:250px;width:400px;height:420px;background:#fff;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 10px 30px rgba(15,23,42,.08)">${summaryHTML([['Tujuan', 'r1', '–'], ['Durasi', 'r2', '–'], ['Peserta', 'r3', '–'], ['Budget', 'r4', '–']])}</div>
        <div id="cur" class="abs" style="left:0;top:0;width:1520px;height:${S12_H}px"></div>`)}
    </div>`;
    const q = s => root.querySelector(s);
    const ctx = { g: q('.kpage'), ins: ['#in1', '#in2', '#in3', '#in4'].map(s => q(s)), dhint: q('#dhint'), o2: q('.o2'), bval: q('#bval'), bfill: q('#bfill'), knob: q('#knob'), next: q('#next'), sum: q('#sum'), r: [q('#r1'), q('#r2'), q('#r3'), q('#r4')] };
    ctx.cursor = new Cursor(q('#cur'));
    return ctx;
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'whipL', 0.1, 0.22);
    const pin = E.o5(prog(lt, 0, 0.55));
    const fy = track(lt, [[0, 470], [1.85, 470], [2.25, 790], [2.6, 790], [2.95, 1060], [3.5, 1060], [3.8, 1120], [4.2, 1120]], E.io3);
    camPage(c.g, S12_H, fy, 0.95, `translateZ(${lerp(-900, 0, pin).toFixed(0)}px) rotateY(${(lerp(-34, -5, pin) + Math.sin(lt * 0.8) * 1.5).toFixed(2)}deg) rotateX(${lerp(16, 4, pin).toFixed(2)}deg)`);
    op(c.g, prog(lt, 0, 0.15));
    // inputs
    const vals = [typed('Labuan Bajo, Nusa Tenggara Timur', lt, 0.5, 58), typed('Jakarta (CGK)', lt, 1.1, 40), lt > 1.5 ? '11/12/2026' : '', lt > 1.62 ? '11/15/2026' : ''];
    const foc = [lt > 0.45 && lt < 1.08, lt >= 1.08 && lt < 1.48, lt >= 1.48 && lt < 1.62, lt >= 1.62 && lt < 1.85];
    c.ins.forEach((el, i) => {
      el.classList.toggle('focus', foc[i]);
      el.querySelector('.v').textContent = vals[i];
      el.querySelector('.ph').style.display = vals[i] ? 'none' : '';
      op(el.querySelector('.caret'), foc[i] && i < 2 && caretOn(lt) ? 1 : 0);
    });
    op(c.dhint, prog(lt, 1.75, 1.9));
    setSel(c.o2, lt > 2.37, 2.37, lt);
    // budget slider (Rp 0,5 – 15 jt)
    const bp = E.io3(prog(lt, 2.95, 3.45));
    const val = lerp(0.5, 5.0, bp), w = (val - 0.5) / 14.5 * 896;
    c.bval.textContent = fmtJt(val);
    c.bfill.style.width = w.toFixed(1) + 'px';
    c.knob.style.left = (32 + w).toFixed(1) + 'px';
    tf(c.knob, `scale(${lt > 2.9 && lt < 3.5 ? 1.3 : 1})`);
    tf(c.next, `scale(${lt > 3.85 && lt < 4.0 ? 0.94 : 1})`);
    c.next.style.boxShadow = lt > 3.85 ? '0 0 0 6px rgba(53,168,255,.25),0 0 40px rgba(53,168,255,.9)' : '';
    const rv = [lt > 1.1 ? 'Labuan Bajo' : '–', lt > 1.8 ? '4H 3M' : '–', lt > 2.37 ? '2 orang' : '–', lt > 3.0 ? fmtJt(val) + ' / orang' : '–'];
    c.r.forEach((r, i) => { if (r.textContent !== rv[i]) r.textContent = rv[i]; r.style.color = rv[i] !== '–' ? '#0F172A' : '#94A3B8'; });
    tf(c.sum, `translateZ(${(50 + Math.sin(lt * 1.5) * 10).toFixed(1)}px)`);
    // cursor in page coordinates (card A @y250, B @650, C @940)
    c.cursor.update(lt, [[1.85, 700, 600], [2.3, 540, 830], [2.6, 540, 840], [2.9, 92, 1040], [3.45, 92 + 278, 1040], [3.55, 500, 1100], [3.85, 880, 1190], [4.2, 880, 1190]], [2.35, 2.9, 3.85], [1.85, 4.3]);
  },
});
CAPS.push([16.75, 18.3, 1, 'Tulis mau ke mana & kapan']);
CAPS.push([18.3, 19.25, 2, 'Pergi sama siapa?']);
CAPS.push([19.25, 20.45, 3, 'Atur budget-mu']);

/* ---------- S13  Step 2 — "Apa yang kamu inginkan?"  20.5 – 24.1 ---------- */
const S13_TILES = [['globe', 'Budaya & sejarah', 'Kampung adat, museum'], ['camera', 'Pemandangan alam', 'Bukit, pantai, air terjun'], ['food', 'Kuliner lokal', 'Warung, pasar malam'], ['bed', 'Santai & istirahat', 'Ngga mau dikejar waktu'], ['sun', 'Sunrise & sunset', 'Siap bangun subuh'], ['compass', 'Snorkeling laut', 'Terumbu, pulau kecil']];
const S13_H = 1210;
addScene({
  id: 's13', start: 20.5, end: 24.1, z: 2,
  build(root) {
    const tiles = S13_TILES.map(([ic, t, d], i) => uiChoice(32 + (i % 3) * 304, 116 + Math.floor(i / 3) * 156, 288, 140, ic, t, d, 's13t')).join('');
    const pace = [['bed', 'Santai 2–3 aktivitas sehari', 'Banyak waktu luang, bisa bangun siang!', 'background:#D1D5DB;color:#334155'], ['route', 'Seimbang 4–5 aktivitas sehari', 'Cukup padat tapi masih ada jeda', 'background:#EAF5FF;color:#35A8FF'], ['cal', 'Padat 6++ aktivitas sehari', 'Maksimalkan tiap jam, siap capek', 'background:#FFF1E9;color:#FF6B24']]
      .map(([ic, t, d, st], i) => `<div class="abs s13p" style="left:32px;top:${84 + i * 92}px;width:896px;height:78px;border:1.5px solid #E2E8F0;border-radius:16px;background:#fff;display:flex;align-items:center;gap:18px;padding:0 18px">
        <div style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;${st}">${icon(ic, 24, 'currentColor', 2)}</div>
        <div><div style="font-size:19px;font-weight:600">${t}</div><div style="font-size:15px;color:#64748B;margin-top:2px">${d}</div></div>
        <div class="check" style="right:18px;top:24px;opacity:0;width:30px;height:30px">${icon('check', 17, '#fff', 3)}</div></div>`).join('');
    root.innerHTML = `<div class="cam persp" style="perspective:2600px">
      ${pageShell(S13_H, `
        <div class="abs eyebrow" style="left:60px;top:128px;font-size:15px">Penyusun itinerary</div>
        <div class="abs" style="left:60px;top:154px;font-size:42px;font-weight:700;letter-spacing:-.02em">Apa yang kamu inginkan?</div>
        <div class="abs" style="right:60px;top:140px">${stepperHTML(2)}</div>
        ${uiCard(60, 250, 960, 440, `<div class="abs" style="left:32px;top:28px;font-size:27px;font-weight:700">Apa yang bikin kamu semangat?</div>
          <div class="abs" style="left:32px;top:72px;font-size:16px;color:#64748B">Pilih minimal 2. Ini yang nentuin aktivitas apa yang masuk rencana</div>${tiles}`)}
        ${uiCard(60, 710, 960, 380, `<div class="abs" style="left:32px;top:28px;font-size:27px;font-weight:700">Mau seberapa padat jadwalnya?</div>${pace}`)}
        <div class="abs" style="left:60px;top:1112px;height:62px;padding:0 30px;border-radius:999px;background:#fff;display:flex;align-items:center;font-size:20px;font-weight:600;box-shadow:0 2px 10px rgba(15,23,42,.06)">Kembali</div>
        <div class="abs btn" id="go" style="left:700px;top:1110px;width:320px;height:66px;font-size:21px;font-weight:600">${icon('check', 22, '#fff', 2.8)} Susun rencana saya</div>
        <div class="abs" id="sum" style="left:1060px;top:250px;width:400px;height:430px;background:#fff;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 10px 30px rgba(15,23,42,.08)">${summaryHTML([['Tujuan', 'x1', 'Labuan Bajo'], ['Durasi', 'x2', '4H 3M'], ['Tempo', 'x3', '–']], `<div style="height:1px;background:#E2E8F0;margin-top:16px"></div><div id="tags" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><span class="chip" style="font-size:15px">Alam</span><span class="chip" style="font-size:15px">Snorkeling</span><span class="chip" style="font-size:15px">Sunrise</span></div>`)}</div>
        <div id="cur" class="abs" style="left:0;top:0;width:1520px;height:${S13_H}px"></div>`)}
      <div class="abs" id="burst" style="left:0;top:0;width:200px;height:200px;margin:-100px;border-radius:50%;background:#35A8FF;opacity:0"></div>
    </div>`;
    const q = s => root.querySelector(s);
    const ctx = { g: q('.kpage'), tiles: [...root.querySelectorAll('.s13t')], pace: [...root.querySelectorAll('.s13p')], go: q('#go'), tags: [...root.querySelectorAll('#tags .chip')], tempo: q('#x3'), sum: q('#sum'), burst: q('#burst') };
    ctx.cursor = new Cursor(q('#cur'));
    return ctx;
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'whipL', 'cut', 0.22, 0.1);
    const fy = track(lt, [[0, 480], [1.45, 480], [1.8, 900], [2.25, 900], [2.55, 1080], [3.6, 1080]], E.io3);
    const zoomOut = E.i3(prog(lt, 2.95, 3.4));
    camPage(c.g, S13_H, fy, 0.95, `translateZ(${(-zoomOut * 300).toFixed(0)}px) rotateY(${(-4 + Math.sin(lt * 0.8) * 1.5).toFixed(2)}deg) rotateX(4deg)`);
    // picks: Pemandangan alam, Sunrise & sunset, Snorkeling laut ; tag order Alam · Snorkeling · Sunrise
    const picks = { 1: 0.55, 4: 0.9, 5: 1.25 };
    c.tiles.forEach((t, i) => { const tp = picks[i]; setSel(t, tp !== undefined && lt > tp, tp || 0, lt); });
    [0.55, 1.25, 0.9].forEach((tp, i) => { const p = E.back(prog(lt, tp + 0.05, tp + 0.25)); tf(c.tags[i], `scale(${p.toFixed(3)})`); op(c.tags[i], p > 0 ? 1 : 0); });
    const ps = lt > 2.05;
    c.pace.forEach((p, i) => { const on = i === 1 && ps; p.style.borderColor = on ? '#35A8FF' : '#E2E8F0'; p.style.background = on ? '#EAF5FF' : '#fff'; p.style.boxShadow = on ? '0 0 0 3px rgba(53,168,255,.18),0 0 26px rgba(53,168,255,.45)' : ''; const ck = p.querySelector('.check'); op(ck, on ? 1 : 0); tf(ck, `scale(${on ? E.back(prog(lt, 2.05, 2.23)).toFixed(3) : 0})`); });
    c.tempo.textContent = ps ? 'Seimbang' : '–'; c.tempo.style.color = ps ? '#0F172A' : '#94A3B8';
    const pressed = lt > 2.85;
    tf(c.go, `scale(${pressed && lt < 3.0 ? 0.94 : 1})`);
    c.go.style.boxShadow = pressed ? `0 0 0 ${(6 + Math.sin(lt * 30) * 3).toFixed(1)}px rgba(53,168,255,.3),0 0 60px rgba(53,168,255,1)` : '';
    tf(c.sum, `translateZ(${(50 + Math.sin(lt * 1.5) * 10).toFixed(1)}px)`);
    // cursor in page coordinates (card A @y250, B @710)
    c.cursor.update(lt, [[0.3, 700, 420], [0.55, 540, 440], [0.9, 236, 596], [1.25, 840, 596], [1.5, 840, 700], [2.05, 600, 940], [2.3, 700, 1020], [2.85, 860, 1143], [3.3, 860, 1143]], [0.55, 0.9, 1.25, 2.05, 2.85], [0.25, 3.05]);
    const bp = E.i4(prog(lt, 3.0, 3.6));
    const br = c.go.getBoundingClientRect(), rr = root.getBoundingClientRect();
    c.burst.style.left = (br.left + br.width / 2 - rr.left).toFixed(1) + 'px';
    c.burst.style.top = (br.top + br.height / 2 - rr.top).toFixed(1) + 'px';
    tf(c.burst, `scale(${(bp * 26).toFixed(3)})`);
    op(c.burst, bp > 0 ? 1 : 0);
  },
});
CAPS.push([20.75, 22.2, 4, 'Pilih yang kamu suka']);
CAPS.push([22.2, 23.0, 5, 'Atur padatnya jadwal']);
CAPS.push([23.0, 24.0, 6, 'Klik — rencana langsung disusun']);

/* ---------- S14  Itinerary engine  24.0 – 26.1 ---------- */
addScene({
  id: 's14', start: 24.0, end: 26.1, z: 3,
  build(root) {
    let ticks = '';
    for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, r1 = 300, r2 = i % 10 ? 312 : 326; ticks += `<line x1="${400 + Math.cos(a) * r1}" y1="${400 + Math.sin(a) * r1}" x2="${400 + Math.cos(a) * r2}" y2="${400 + Math.sin(a) * r2}" stroke="#35A8FF" stroke-opacity="${i % 10 ? .4 : .9}" stroke-width="2"/>`; }
    const logs = ['Membaca minat: Alam · Sunrise · Snorkeling', 'Menghitung rute & waktu tempuh kapal', 'Menyesuaikan budget Rp 5,00 jt / orang', 'Mencari spot sunrise terbaik', 'Memilih 11 aktivitas yang cocok', 'Mengecek jadwal yang bentrok'];
    const thumbs = ['padar', 'pinkbeach', 'komodo', 'manta', 'rajaampat', 'terraces'];
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="fill" style="inset:0;background:#35A8FF"></div>
      <div class="abs" id="ring" style="left:780px;top:120px;width:800px;height:800px">
        <svg width="800" height="800" viewBox="0 0 800 800" style="overflow:visible">
          <g id="tk">${ticks}</g>
          <circle cx="400" cy="400" r="270" fill="none" stroke="#1E3A5F" stroke-width="10"/>
          <circle id="pr" cx="400" cy="400" r="270" fill="none" stroke="#35A8FF" stroke-width="10" stroke-linecap="round" stroke-dasharray="1696" stroke-dashoffset="1696" transform="rotate(-90 400 400)" style="filter:drop-shadow(0 0 16px #35A8FF)"/>
          <g id="a1"><path d="M400,170 A230,230 0 0 1 630,400" fill="none" stroke="#FF6B24" stroke-width="4" stroke-linecap="round" style="filter:drop-shadow(0 0 10px #FF6B24)"/></g>
          <g id="a2"><path d="M400,600 A200,200 0 0 1 200,400" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-dasharray="8 10"/></g>
          <circle cx="400" cy="400" r="190" fill="rgba(53,168,255,.08)" stroke="rgba(53,168,255,.35)" stroke-width="1.5"/>
        </svg>
        <div class="abs" style="left:0;right:0;top:300px;text-align:center">
          <div class="hud" style="font-size:20px">Menyusun rencana</div>
          <div id="pct" style="font-family:Montserrat;font-weight:700;font-size:130px;color:#fff;text-shadow:0 0 30px rgba(53,168,255,.9)">0%</div>
        </div>
        <div class="abs" id="ok" style="left:300px;top:300px;width:200px;height:200px;border-radius:50%;background:#16A34A;display:flex;align-items:center;justify-content:center;box-shadow:0 0 60px rgba(22,163,74,.9);opacity:0">${icon('check', 120, '#fff', 3)}</div>
      </div>
      <div class="abs" style="left:90px;top:330px;width:580px">${logs.map(l => `<div class="s14l" style="font-family:Montserrat;font-size:21px;color:#CFE8FF;margin-bottom:26px;display:flex;gap:12px;align-items:flex-start"><span class="s14k" style="color:#35A8FF;flex:0 0 auto">›</span><span class="s14x"></span></div>`).join('')}</div>
      ${thumbs.map((t, i) => `<div class="abs thumb s14th" style="left:0;top:0;width:210px;height:140px;border:2px solid rgba(255,255,255,.85);box-shadow:0 0 30px rgba(53,168,255,.6)">${art(t)}</div>`).join('')}
    </div>`;
    const q = s => root.querySelector(s);
    return { fill: q('#fill'), pr: q('#pr'), tk: q('#tk'), a1: q('#a1'), a2: q('#a2'), pct: q('#pct'), ok: q('#ok'), logs: logs, ls: [...root.querySelectorAll('.s14x')], ks: [...root.querySelectorAll('.s14k')], th: [...root.querySelectorAll('.s14th')], ring: q('#ring') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'zoomThrough', 0.1, 0.22);
    op(c.fill, 1 - E.o3(prog(lt, 0, 0.35)));
    const p = E.io3(prog(lt, 0.15, 1.75));
    c.pr.setAttribute('stroke-dashoffset', (1696 * (1 - p)).toFixed(1));
    c.pct.textContent = Math.round(p * 100) + '%';
    c.tk.setAttribute('transform', `rotate(${(lt * 25).toFixed(2)} 400 400)`);
    c.a1.setAttribute('transform', `rotate(${(lt * 220).toFixed(2)} 400 400)`);
    c.a2.setAttribute('transform', `rotate(${(-lt * 140).toFixed(2)} 400 400)`);
    c.ls.forEach((l, i) => {
      const t0 = 0.2 + i * 0.25;
      const txt = typed(c.logs[i], lt, t0, 90);
      const done = lt > t0 + 0.42;
      l.innerHTML = txt + (done ? ' <span style="color:#16A34A;font-weight:700">OK</span>' : '');
      op(l.parentElement, prog(lt, t0, t0 + 0.05));
      c.ks[i].style.color = done ? '#16A34A' : '#35A8FF';
    });
    c.th.forEach((t, i) => {
      const a = i / c.th.length * Math.PI * 2 + lt * 1.6;
      const R = 420 + Math.sin(lt * 2 + i) * 20;
      const conv = E.i3(prog(lt, 1.55, 1.85));
      const x = 1180 + Math.cos(a) * R * 0.88 * (1 - conv) - 105, y = 520 + Math.sin(a) * R * 0.55 * (1 - conv) - 70;
      tf(t, `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${(Math.sin(a) * 200).toFixed(0)}px) scale(${(1 - conv * 0.7).toFixed(3)})`);
      op(t, prog(lt, 0.3 + i * 0.08, 0.45 + i * 0.08) * (1 - conv));
    });
    const ok = E.back(prog(lt, 1.8, 2.0));
    op(c.ok, prog(lt, 1.8, 1.85)); tf(c.ok, `scale(${ok.toFixed(3)})`);
    tf(c.ring, `scale(${lerp(0.9, 1.04, E.o3(lt / dur)).toFixed(4)})`);
  },
});
CAPS.push([24.3, 26.0, 0, 'Kelana menyusun rencanamu <span class="blue">otomatis</span>']);
FLASH.push([25.82, 0.35, 0.25]);

/* ---------- S15  Result itinerary  26.0 – 31.1 ---------- */
const S15_ROWS = [
  ['07.30', 'padar', 'Trekking sunrise Pulau Padar', '800 anak tangga, 45 menit naik', [['Wajib', 'orange'], ['3,5 jam', 'gray']]],
  ['11.00', 'pinkbeach', 'Pink Beach — snorkeling & sarapan', 'Terumbu dangkal, aman buat pemula', [['2 jam', 'gray'], ['Makan termasuk', 'gray']]],
  ['13.00', 'komodo', 'Pulau Komodo — trekking bareng ranger', 'Rute pendek 1,5 km, tiket sudah termasuk', [['Ranger wajib', ''], ['Rp 320 rb', 'gray']]],
  ['15.30', 'manta', 'Manta Point — berenang bareng pari manta', 'Arus lebih tenang jam ini', [['Tergantung cuaca', ''], ['1,5 jam', 'gray']]],
];
addScene({
  id: 's15', start: 26.0, end: 31.1, z: 2,
  build(root) {
    const rowH = (r, i) => {
      const [tm, img, t, d, chips] = r;
      return `<div class="card s15r" style="left:90px;top:${i * 112}px;width:960px;height:98px;border-radius:20px;display:flex;align-items:center;gap:22px;padding:0 22px;box-shadow:0 10px 30px rgba(0,0,0,.25)">
        <div style="color:#CBD5E1">${icon('grip', 24, '#94A3B8')}</div>
        <div class="s15tm" style="font-size:22px;font-weight:800;color:#35A8FF;width:70px">${tm}</div>
        <div class="thumb" style="width:110px;height:72px;flex:0 0 auto">${art(img)}</div>
        <div style="flex:1;min-width:0"><div style="font-size:22px;font-weight:700;white-space:nowrap">${t}</div><div class="sub" style="white-space:nowrap">${d}</div>
          <div style="display:flex;gap:8px;margin-top:6px">${chips.map(([c, k]) => `<span class="chip ${k}" style="font-size:14px;padding:3px 12px">${c}</span>`).join('')}</div></div></div>`;
    };
    const costs = [['Kapal & kru', '2,09 jt', '#35A8FF', 43], ['Tiket & ranger', '920 rb', '#4087C4', 19], ['Makan', '780 rb', '#FF6B24', 16], ['Penginapan', '630 rb', '#F59E0B', 13], ['Lain-lain', '435 rb', '#CBD5E1', 9]];
    root.innerHTML = `<div class="cam persp" style="perspective:2400px">
      <div class="abs" id="g" style="left:0;top:0;width:1920px;height:1080px;transform-style:preserve-3d;transform-origin:960px 540px">
        <div class="abs eyebrow" id="eb" style="left:150px;top:74px">Penyusun itinerary · Rencana</div>
        <div class="abs big" id="ttl" style="left:150px;top:102px;font-size:60px"></div>
        <div class="card" id="ban" style="left:150px;top:198px;width:1050px;height:96px;background:#EAF5FF;border-color:#BFE0FF;display:flex;align-items:center;gap:20px;padding:0 28px">
          <div style="width:54px;height:54px;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center">${icon('sparkle', 30, '#35A8FF')}</div>
          <div><div style="font-size:23px;font-weight:700">Rencana 4 hari kamu sudah siap</div><div class="sub" style="font-size:18px">11 aktivitas sesuai minatmu · estimasi <b style="color:#0F172A">Rp 4,85 jt / orang</b> — masih di bawah budget</div></div></div>
        <div class="abs" id="tabs" style="left:150px;top:316px;display:flex;gap:6px;padding:6px;border-radius:999px;background:rgba(255,255,255,.12)">
          ${['Hari 1', 'Hari 2', 'Hari 3', 'Hari 4'].map((d, i) => `<div class="s15d" style="position:relative;padding:10px 26px;border-radius:999px;font-size:19px;font-weight:700;${i === 1 ? 'background:#fff;color:#0F172A' : 'color:#CBD5E1'}">${d}${i === 2 ? '<span id="plus" style="position:absolute;right:-8px;top:-10px;background:#16A34A;color:#fff;font-size:13px;padding:2px 8px;border-radius:999px;opacity:0">+1</span>' : ''}</div>`).join('')}
        </div>
        <div class="card" id="dh" style="left:150px;top:386px;width:1050px;height:76px;background:#EAF5FF;display:flex;align-items:center;gap:18px;padding:0 20px">
          <div style="width:52px;height:52px;border-radius:12px;background:#4087C4;color:#fff;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;line-height:1">HARI<span style="font-size:22px">2</span></div>
          <div><div style="font-size:22px;font-weight:700">Padar, Pink Beach & Komodo</div><div class="sub">Jum, 13 Nov · 4 aktivitas</div></div></div>
        <div class="abs" id="tl" style="left:150px;top:482px;width:1050px;height:440px">
          <div class="abs" id="tline" style="left:30px;top:20px;width:3px;height:420px;background:linear-gradient(#35A8FF,rgba(53,168,255,.2));transform-origin:0 0;box-shadow:0 0 10px #35A8FF"></div>
          ${S15_ROWS.map((r, i) => `<div class="abs s15dot" style="left:22px;top:${i * 112 + 41}px;width:19px;height:19px;border-radius:50%;background:#0F172A;border:3px solid #35A8FF;box-shadow:0 0 12px #35A8FF"></div>`).join('')}
          ${S15_ROWS.map(rowH).join('')}
        </div>
        <div class="card" id="cost" style="left:1250px;top:198px;width:520px;height:640px;padding:30px">
          <div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:26px;font-weight:700">Estimasi biaya</div><span class="chip green" id="badge">${icon('check', 16, '#16A34A', 3)} Di bawah budget</span></div>
          <div class="sub" style="margin-top:18px">Total per orang</div>
          <div id="tot" style="font-size:58px;font-weight:800;letter-spacing:-.02em">Rp 0,00 jt</div>
          <div style="display:flex;height:14px;border-radius:7px;overflow:hidden;background:#F1F5F9;margin-top:8px">${costs.map(([, , col, w]) => `<div class="s15seg" data-w="${w}" style="width:0;background:${col}"></div>`).join('')}</div>
          <div class="sub" style="margin-top:8px;font-size:15px">Budget kamu Rp 5,00 jt — sisa Rp 150 rb</div>
          ${costs.map(([k, v, col]) => `<div class="s15c" style="display:flex;align-items:center;gap:14px;font-size:20px;margin-top:20px"><span style="width:14px;height:14px;border-radius:4px;background:${col}"></span><span style="flex:1;color:#334155">${k}</span><b>${v}</b></div>`).join('')}
          <div class="btn ghost" style="width:100%;margin-top:26px;height:56px;font-size:19px">${icon('users', 22, '#35A8FF')} Undang rombongan</div>
        </div>
        <div class="card" id="warn" style="left:330px;top:600px;width:820px;padding:26px 30px;background:#FFFBEB;border:2px solid #F59E0B;box-shadow:0 30px 80px rgba(0,0,0,.5),0 0 50px rgba(245,158,11,.5)">
          <div id="wa">
            <div style="display:flex;gap:14px;align-items:center;font-size:23px;font-weight:700;color:#92400E">${icon('alert', 28, '#F59E0B', 2.4)} Satu hal yang perlu kamu cek</div>
            <div style="font-size:19px;color:#92400E;margin-top:10px;line-height:1.45">Ke Manta Point butuh 75 menit berlayar, waktunya mepet.<br>Kelana sarankan pindah Manta Point ke <b>Hari 3</b>.</div>
            <div style="display:flex;gap:16px;margin-top:18px"><div class="btn" id="apply" style="height:54px;font-size:19px;padding:0 26px">Terapkan saran</div><div style="height:54px;display:flex;align-items:center;font-size:19px;font-weight:600;color:#0F172A">Biarkan saja</div></div>
          </div>
          <div id="wb" class="abs" style="inset:0;display:flex;align-items:center;justify-content:center;gap:16px;font-size:28px;font-weight:800;color:#16A34A;background:#F0FDF4;opacity:0">${icon('check', 40, '#16A34A', 3)} Rencana diperbarui otomatis</div>
        </div>
        <div id="cur" class="abs" style="left:0;top:0;width:1920px;height:1080px"></div>
      </div></div>`;
    const q = s => root.querySelector(s);
    const ctx = {
      g: q('#g'), ttl: splitText(q('#ttl'), 'Asikk, rencanamu sudah siap!'), eb: q('#eb'), ban: q('#ban'), tabs: q('#tabs'), dh: q('#dh'), tline: q('#tline'), dots: [...root.querySelectorAll('.s15dot')],
      rows: [...root.querySelectorAll('.s15r')], tms: [...root.querySelectorAll('.s15tm')], cost: q('#cost'), tot: q('#tot'), segs: [...root.querySelectorAll('.s15seg')], cs: [...root.querySelectorAll('.s15c')], badge: q('#badge'),
      warn: q('#warn'), wa: q('#wa'), wb: q('#wb'), apply: q('#apply'), plus: q('#plus'),
    };
    ctx.cursor = new Cursor(q('#cur'));
    return ctx;
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'whipU', 'zoomThrough', 0.3, 0.25);
    // camera
    const zin = E.io3(prog(lt, 2.0, 2.5)), zout = E.io3(prog(lt, 3.4, 3.8));
    const k = zin * (1 - zout);
    const s = lerp(0.94, 1.12, k), tx = lerp(0, 140, k), ty = lerp(0, -120, k);
    tf(c.g, `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)}) rotateY(${(-4 + Math.sin(lt * 0.6) * 2.5).toFixed(2)}deg) rotateX(${(4 - k * 2).toFixed(2)}deg)`);
    riseIn(c.ttl, lt, 0.12, { stagger: 0.02, dur: 0.4, y: 50 });
    op(c.eb, prog(lt, 0.1, 0.3));
    const slide = (el, t0, dx = 0, dy = 40) => { const p = E.o4(prog(lt, t0, t0 + 0.4)); tf(el, `translate3d(${((1 - p) * dx).toFixed(1)}px,${((1 - p) * dy).toFixed(1)}px,0)`); op(el, p); };
    slide(c.ban, 0.3); slide(c.tabs, 0.42); slide(c.dh, 0.52);
    tf(c.tline, `scaleY(${E.o3(prog(lt, 0.6, 1.3)).toFixed(3)})`);
    // drag & drop: row 2 (Komodo) moves above row 1 (Pink Beach)
    const dragP = E.io3(prog(lt, 2.55, 3.0));
    const lifted = lt > 2.45 && lt < 3.08;
    const order = [0, 112, 224, 336];
    c.rows.forEach((r, i) => {
      const t0 = 0.62 + i * 0.12;
      const p = E.o5(prog(lt, t0, t0 + 0.45));
      let y = order[i], x = (1 - p) * 500, z = 0, rot = 0, sc = 1;
      if (i === 2) { y = lerp(224, 112, dragP); if (lifted) { z = 80; sc = 1.03; rot = -1.2; } }
      if (i === 1) y = lerp(112, 224, E.io3(prog(lt, 2.7, 3.05)));
      // row 3 (Manta) leaves to Hari 3 after suggestion applied
      if (i === 3) { const out = E.i3(prog(lt, 4.45, 4.8)); x += out * 1300; }
      r.style.top = y.toFixed(1) + 'px';
      tf(r, `translate3d(${x.toFixed(1)}px,0,${z}px) rotate(${rot}deg) scale(${sc})`);
      op(r, p * (i === 3 ? 1 - prog(lt, 4.55, 4.8) : 1));
      r.style.boxShadow = lifted && i === 2 ? '0 40px 80px rgba(0,0,0,.45),0 0 0 2px #35A8FF,0 0 40px rgba(53,168,255,.8)' : '';
      r.style.zIndex = i === 2 ? 5 : 1;
    });
    c.dots.forEach((d, i) => op(d, prog(lt, 0.7 + i * 0.12, 0.8 + i * 0.12) * (i === 3 ? 1 - prog(lt, 4.55, 4.8) : 1)));
    // times recalculated
    const swapped = lt > 3.05;
    c.tms[2].textContent = swapped ? '11.00' : '13.00';
    c.tms[1].textContent = swapped ? '13.30' : '11.00';
    const hl = swapped && lt < 3.6;
    [1, 2].forEach(i => { c.tms[i].style.textShadow = hl ? '0 0 16px rgba(53,168,255,1)' : ''; c.tms[i].style.transform = hl ? `scale(${(1 + 0.25 * Math.exp(-(lt - 3.05) * 6)).toFixed(3)})` : ''; });
    // cost card
    slide(c.cost, 0.45, 300, 0);
    const tv = 4.85 * E.o3(prog(lt, 0.8, 1.8));
    c.tot.textContent = fmtJt(tv);
    c.segs.forEach((sg, i) => { const p = E.o3(prog(lt, 0.9 + i * 0.12, 1.4 + i * 0.12)); sg.style.width = (+sg.dataset.w * 0.97 * p).toFixed(2) + '%'; });
    c.cs.forEach((r, i) => op(r, prog(lt, 1.0 + i * 0.1, 1.2 + i * 0.1)));
    const bp = E.back(prog(lt, 1.85, 2.1));
    tf(c.badge, `scale(${bp.toFixed(3)})`);
    c.badge.style.boxShadow = lt > 1.85 ? `0 0 ${(20 + Math.sin(lt * 6) * 8).toFixed(0)}px rgba(22,163,74,.6)` : '';
    // smart suggestion
    const wp = E.o5(prog(lt, 3.55, 3.95)), wout = E.i3(prog(lt, 4.75, 4.95));
    tf(c.warn, `translate3d(0,${((1 - wp) * 140).toFixed(1)}px,${(120 - wout * 200).toFixed(0)}px) scale(${lerp(0.9, 1, wp).toFixed(3)})`);
    op(c.warn, wp * (1 - wout));
    const applied = lt > 4.32;
    op(c.wb, applied ? E.o3(prog(lt, 4.32, 4.45)) : 0);
    c.apply.style.transform = lt > 4.28 && lt < 4.4 ? 'scale(.94)' : '';
    op(c.plus, prog(lt, 4.6, 4.7)); tf(c.plus, `scale(${E.back(prog(lt, 4.6, 4.8)).toFixed(3)})`);
    c.cursor.update(lt, [[2.15, 900, 760], [2.45, 300, 765], [3.0, 300, 653], [3.35, 700, 700], [3.95, 560, 790], [4.3, 590, 830], [4.8, 640, 860]], [2.45, 4.3], [2.15, 4.9]);
  },
});
CAPS.push([26.45, 28.25, 0, 'Itinerary jadi — <span class="blue">pas dengan budget-mu</span>']);
CAPS.push([28.25, 29.55, 0, 'Tinggal geser, jam diatur ulang otomatis']);
CAPS.push([29.55, 30.95, 0, 'Ada yang bentrok? Kelana kasih saran']);

/* ---------- S16  Route map  31.0 – 34.1 ---------- */
const S16_PTS = [['Labuan Bajo', 1740, 430, 'Mulai', 'labuanbajo'], ['Pulau Padar', 1200, 860, 'Hari 2', 'padar'], ['Pink Beach', 880, 760, 'Hari 2', 'pinkbeach'], ['Pulau Komodo', 650, 430, 'Hari 2', 'komodo'], ['Manta Point', 1020, 330, 'Hari 3', 'manta']];
addScene({
  id: 's16', start: 31.0, end: 34.1, z: 2,
  build(root) {
    const isl = [blob(620, 560, 330, 360, 3, 16, 0.25), blob(1380, 640, 190, 250, 8, 14, 0.3), blob(1170, 900, 90, 60, 11, 10, 0.3), blob(2050, 600, 330, 900, 5, 16, 0.12), blob(990, 520, 50, 35, 13, 9, 0.3), blob(1550, 330, 40, 30, 17, 9, 0.3)];
    const route = smoothPath(S16_PTS.map(p => [p[1], p[2]]), false, 0.8);
    root.innerHTML = `<div class="cam persp" style="perspective:1700px;transform-style:flat">
      <div class="abs" id="plane" style="left:-40px;top:-60px;width:2000px;height:1200px;transform-style:preserve-3d;transform-origin:1000px 600px">
        <svg width="2000" height="1200" viewBox="0 0 2000 1200" style="position:absolute;left:0;top:0">
          <defs>
            <radialGradient id="s16sea" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#0E4A6E"/><stop offset="1" stop-color="#071E33"/></radialGradient>
            <linearGradient id="s16land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6E8F4A"/><stop offset=".6" stop-color="#4E6B34"/><stop offset="1" stop-color="#8A7A4A"/></linearGradient>
            <filter id="s16b"><feGaussianBlur stdDeviation="14"/></filter>
          </defs>
          <rect width="2000" height="1200" fill="url(#s16sea)"/>
          ${Array.from({ length: 21 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="1200" stroke="#35A8FF" stroke-opacity=".08"/>`).join('')}
          ${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="2000" y2="${i * 100}" stroke="#35A8FF" stroke-opacity=".08"/>`).join('')}
          ${isl.map(d => `<path d="${d}" fill="#3FD0C9" opacity=".35" filter="url(#s16b)"/>`).join('')}
          ${isl.map(d => `<path d="${d}" fill="url(#s16land)" stroke="#9FF3E6" stroke-width="3" stroke-opacity=".6"/>`).join('')}
          <path d="${route}" fill="none" stroke="#35A8FF" stroke-width="26" stroke-opacity=".25" stroke-linecap="round" filter="url(#s16b)" id="rg" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000"/>
          <path d="${route}" fill="none" stroke="#7CC8FF" stroke-width="7" stroke-linecap="round" id="rc" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000"/>
          <path d="${route}" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="10 16" id="rd" opacity=".8"/>
          <path d="${route}" fill="none" stroke="none" id="rp"/>
        </svg>
        ${S16_PTS.map((p, i) => `<div class="abs s16a" style="left:${p[1] - 1}px;top:${p[2] - 1}px;width:2px;height:2px"></div>`).join('')}
      </div>
      ${S16_PTS.map(([n, x, y, d, img], i) => `<div class="abs s16p" style="left:0;top:0"><div class="s16pi" style="position:absolute;left:0;top:0">
        <div style="position:absolute;left:-12px;top:-12px;width:24px;height:24px;border-radius:50%;background:${i ? '#35A8FF' : '#FF6B24'};border:4px solid #fff;box-shadow:0 0 24px ${i ? '#35A8FF' : '#FF6B24'}"></div>
        <div style="position:absolute;left:-46px;top:-150px;width:92px;height:92px;border-radius:50%;overflow:hidden;border:4px solid #fff;box-shadow:0 0 30px rgba(53,168,255,.8)">${art(img)}</div>
        <div style="position:absolute;left:58px;top:-130px;padding:10px 18px;border-radius:16px;background:rgba(255,255,255,.96);color:#0F172A;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.4)"><div style="font-size:22px;font-weight:800">${n}</div><div style="font-size:15px;color:${i ? '#4087C4' : '#FF6B24'};font-weight:700">${d}</div></div>
      </div></div>`).join('')}
      <div class="abs" id="boat" style="left:0;top:0;width:56px;height:56px;margin:-28px;border-radius:50%;background:#FF6B24;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px #FF6B24">${icon('boat', 30, '#fff', 2.4)}</div>
      <div class="abs" style="left:0;top:0;width:1300px;height:760px;background:radial-gradient(ellipse at 0 0,rgba(11,17,32,.95) 30%,rgba(11,17,32,0) 70%)"></div>
      <div class="abs" style="left:130px;top:120px">
        <div class="hud" id="mh" style="font-size:20px">Rute perjalanan · 4 hari</div>
        ${['Rapi.', 'Realistis.', 'Sesuai budget.'].map((w, i) => `<div class="big s16w" style="font-size:118px;margin-top:${i ? 0 : 14}px;${i === 2 ? 'color:#35A8FF;text-shadow:0 0 40px rgba(53,168,255,.7)' : ''}">${w}</div>`).join('')}
      </div>
    </div>`;
    const q = s => root.querySelector(s);
    return { plane: q('#plane'), rg: q('#rg'), rc: q('#rc'), rd: q('#rd'), rp: q('#rp'), an: [...root.querySelectorAll('.s16a')], pins: [...root.querySelectorAll('.s16p')], boat: q('#boat'), w: [...root.querySelectorAll('.s16w')], mh: q('#mh') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'zoomOut', 'whipL', 0.35, 0.2);
    const k = lt / dur;
    tf(c.plane, `translate3d(${lerp(180, -60, E.io3(k)).toFixed(1)}px,${lerp(80, 40, k).toFixed(1)}px,${lerp(-300, 0, E.o3(k)).toFixed(0)}px) rotateX(${lerp(50, 40, k).toFixed(2)}deg) rotateZ(${lerp(-8, 2, k).toFixed(2)}deg)`);
    const rp = E.io3(prog(lt, 0.25, 1.9));
    c.rg.setAttribute('stroke-dashoffset', (1000 * (1 - rp)).toFixed(1));
    c.rc.setAttribute('stroke-dashoffset', (1000 * (1 - rp)).toFixed(1));
    c.rd.style.opacity = 0; // dashed overlay only after draw
    if (rp >= 1) { c.rd.style.opacity = 0.8; c.rd.setAttribute('stroke-dashoffset', (-lt * 60).toFixed(1)); }
    const rr = root.getBoundingClientRect();
    const sc = parseFloat(root.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1);
    const toLocal = (el) => { const a = el.getBoundingClientRect(); return [(a.left + a.width / 2 - rr.left) / sc, (a.top + a.height / 2 - rr.top) / sc]; };
    const L = c.rp.getTotalLength();
    // pin pop when the route reaches each stop (approx by index)
    const reach = [0.25, 0.62, 0.92, 1.3, 1.85];
    c.pins.forEach((p, i) => {
      const [x, y] = toLocal(c.an[i]);
      p.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      const s = E.back(prog(lt, reach[i], reach[i] + 0.3));
      tf(p.firstElementChild, `scale(${s.toFixed(3)})`); op(p.firstElementChild, prog(lt, reach[i], reach[i] + 0.06));
    });
    // boat follows the drawn route head: place a temp anchor using path point in plane coords
    const pt = c.rp.getPointAtLength(L * rp);
    if (!c.ba) { c.ba = document.createElement('div'); c.ba.className = 'abs'; c.ba.style.cssText = 'width:2px;height:2px'; c.plane.appendChild(c.ba); }
    c.ba.style.left = (pt.x - 1) + 'px'; c.ba.style.top = (pt.y - 1) + 'px';
    const [bx, by] = toLocal(c.ba);
    c.boat.style.left = bx.toFixed(1) + 'px'; c.boat.style.top = by.toFixed(1) + 'px';
    op(c.boat, prog(lt, 0.25, 0.35) * (1 - prog(lt, 2.0, 2.2)));
    op(c.mh, prog(lt, 0.2, 0.4));
    c.w.forEach((w, i) => { const t0 = 1.5 + i * 0.5; const p = E.o5(prog(lt, t0, t0 + 0.2)); tf(w, `translateX(${((1 - p) * -80).toFixed(1)}px) scale(${lerp(1.3, 1, p).toFixed(3)})`); op(w, p); w.style.transformOrigin = '0 50%'; });
  },
});
SHAKE.push([32.5, 6, 0.2], [33.0, 6, 0.2], [33.5, 8, 0.25]);
