/* =========================================================
   ACT 3 — FEATURE 02: GUIDE BOOKING (34.0 – 48.1 s)
   ACT 4 — RESOLUTION & CTA (48.0 – 56.0 s)
   ========================================================= */

/* ---------- S17  Feature 02 title  34.0 – 36.1 ---------- */
addScene({
  id: 's17', start: 34.0, end: 36.1,
  build(root) {
    let ticks = '';
    for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, r1 = 440, r2 = i % 6 ? 455 : 475; ticks += `<line x1="${500 + Math.cos(a) * r1}" y1="${500 + Math.sin(a) * r1}" x2="${500 + Math.cos(a) * r2}" y2="${500 + Math.sin(a) * r2}" stroke="#35A8FF" stroke-opacity="${i % 6 ? .35 : .9}" stroke-width="2"/>`; }
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="cmp" style="left:460px;top:40px;width:1000px;height:1000px;opacity:.55">
        <svg width="1000" height="1000" viewBox="0 0 1000 1000"><g id="ct">${ticks}</g>
          <circle cx="500" cy="500" r="380" fill="none" stroke="#35A8FF" stroke-opacity=".25" stroke-width="1.5" stroke-dasharray="4 8"/>
          <g id="cn"><path d="M500,140 L520,500 L500,520 L480,500Z" fill="#FF6B24" opacity=".8"/><path d="M500,860 L520,500 L500,480 L480,500Z" fill="#35A8FF" opacity=".5"/></g>
          <text x="500" y="40" fill="#35A8FF" font-family="Montserrat" font-weight="600" font-size="28" text-anchor="middle">U</text></svg>
      </div>
      <div class="abs" style="left:0;right:0;top:300px;text-align:center">
        <div class="hud" id="h" style="font-size:24px"></div>
        <div class="abs" id="l" style="left:640px;right:640px;top:44px;height:2px;background:#FF6B24;box-shadow:0 0 14px #FF6B24"></div>
      </div>
      <div class="abs big" id="t" style="left:0;right:0;top:390px;text-align:center;font-size:122px;line-height:1.08"></div>
      <div class="abs" id="sub" style="left:0;right:0;top:680px;text-align:center;font-size:40px;color:#CFE8FF;font-weight:500">Sewa pemandu lokal untuk tripmu sendiri.</div>
    </div>`;
    const q = s => root.querySelector(s);
    return { t: splitText(q('#t'), 'Jalan bareng orang[br][b]yang tahu jalannya.[/b]', 'wd'), h: q('#h'), l: q('#l'), sub: q('#sub'), ct: q('#ct'), cn: q('#cn'), cmp: q('#cmp') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'zoomOut', 'whipL', 0.3, 0.2);
    const H = 'Fitur 02 · Booking pemandu lokal';
    c.h.textContent = H.slice(0, Math.ceil(prog(lt, 0.15, 0.55) * H.length));
    tf(c.l, `scaleX(${E.o4(prog(lt, 0.1, 0.6)).toFixed(3)})`);
    riseIn(c.t, lt, 0.25, { stagger: 0.07, dur: 0.5, y: 100, rot: 3 });
    op(c.sub, prog(lt, 0.9, 1.2)); tf(c.sub, `translateY(${((1 - E.o3(prog(lt, 0.9, 1.3))) * 30).toFixed(1)}px)`);
    c.ct.setAttribute('transform', `rotate(${(lt * 18).toFixed(2)} 500 500)`);
    c.cn.setAttribute('transform', `rotate(${(-40 + E.elastic(prog(lt, 0.1, 1.4)) * 40 + Math.sin(lt * 3) * 3).toFixed(2)} 500 500)`);
    tf(c.cmp, `scale(${lerp(0.8, 1.05, E.o3(lt / dur)).toFixed(4)})`);
  },
});
FLASH.push([34.0, 0.6, 0.35]);
SHAKE.push([34.0, 12, 0.3]);

/* ---------- guide data (from Kelana booking page) ---------- */
const GUIDES = [
  ['RK', 'ab-blue', 'Rihana Komeng', 'Labuan Bajo, NTT', '4,9', '284', ['Sailing', 'Komodo', 'Free diving'], 'Indonesia, Inggris', '17 tahun memandu', '650'],
  ['KS', 'ab-orange', 'Komang Samaeri Gea', 'Ubud, Bali', '4,8', '412', ['Budaya', 'Upacara adat', 'Kuliner'], 'Indonesia, Inggris, Jepang', '8 tahun memandu', '500'],
  ['TH', 'ab-blue', 'Teguh Hamdi Nugraha', 'Yogyakarta, DIY', '4,9', '321', ['Candi', 'Sejarah', 'Batik'], 'Indonesia, Inggris', '6 tahun memandu', '400'],
  ['YM', 'ab-navy', 'Yosef Mambrasar', 'Waisai, Raja Ampat', '5,0', '176', ['Diving', 'Birdwatching'], 'Indonesia, Inggris', '15 tahun memandu', '900'],
  ['BP', 'ab-green', 'Bayu Pratama', 'Probolinggo, Jatim', '4,8', '490', ['Trekking', 'Sunrise', 'Fotografi'], 'Indonesia', '9 tahun memandu', '450'],
  ['MS', 'ab-orange', 'Mangihut Simanjuntak', 'Samosir, Sumut', '4,7', '198', ['Budaya Batak', 'Danau'], 'Indonesia, Inggris, Batak', '7 tahun memandu', '380'],
];
function guideCard(g, i, x, y) {
  const [ini, ab, name, loc, rt, trips, tags, lang, yrs, price] = g;
  return `<div class="card s18c" style="left:${x}px;top:${y}px;width:500px;height:300px;padding:26px;transform-origin:50% 0">
    <div style="display:flex;gap:18px;align-items:center"><div class="avatar ${ab}">${ini}</div>
      <div><div style="font-size:23px;font-weight:800;display:flex;gap:8px;align-items:center">${name}<span class="s18v" style="color:#16A34A;display:inline-flex">${icon('shield', 24, '#16A34A', 2.2)}</span></div>
      <div class="sub" style="display:flex;gap:6px;align-items:center">${icon('pin', 16, '#64748B')} ${loc}</div>
      <div style="font-size:16px;display:flex;gap:6px;align-items:center;margin-top:2px"><span style="color:#F59E0B">${icon('star', 16, '#F59E0B', 1)}</span><b>${rt}</b><span style="color:#64748B">· ${trips} trip</span></div></div></div>
    <div style="display:flex;gap:8px;margin-top:16px">${tags.map(t => `<span class="chip" style="font-size:15px;padding:5px 12px">${t}</span>`).join('')}</div>
    <div class="sub" style="margin-top:12px;display:flex;gap:8px;align-items:center">${icon('lang', 18, '#64748B')} ${lang}</div>
    <div class="sub" style="margin-top:4px;display:flex;gap:8px;align-items:center">${icon('clock', 18, '#64748B')} ${yrs}</div>
    <div style="position:absolute;left:26px;right:26px;bottom:22px;display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:24px;font-weight:800">Rp ${price} rb</div><div class="sub" style="font-size:14px">per hari</div></div>
      <div class="btn s18b" style="height:48px;font-size:17px;padding:0 22px">Lihat profil</div></div></div>`;
}

/* ---------- S18  Guide search grid  36.0 – 40.1 ---------- */
addScene({
  id: 's18', start: 36.0, end: 40.1, z: 2,
  build(root) {
    const cards = GUIDES.map((g, i) => guideCard(g, i, 130 + (i % 3) * 560, 330 + Math.floor(i / 3) * 330)).join('');
    root.innerHTML = `<div class="cam persp" style="perspective:2200px">
      <div class="abs" id="g" style="left:0;top:0;width:1920px;height:1080px;transform-style:preserve-3d;transform-origin:960px 500px">
        <div class="abs eyebrow" style="left:130px;top:60px">Booking</div>
        <div class="abs big" style="left:130px;top:86px;font-size:52px">Jalan bareng orang yang tahu jalannya</div>
        <div class="card" id="bar" style="left:130px;top:170px;width:1660px;height:96px;display:flex;gap:16px;align-items:center;padding:0 18px">
          <div class="input focus" id="f1" style="flex:1.2;height:62px">${icon('pin', 22, '#35A8FF')}<span id="fv"></span><span class="caret" id="fc"></span></div>
          <div class="input" style="flex:1;height:62px;color:#64748B">Semua spesialisasi</div>
          <div class="input" style="flex:1;height:62px;color:#64748B">Semua bahasa</div>
          <div class="btn" id="cari" style="height:62px">${icon('search', 22, '#fff', 2.6)} Cari pemandu</div>
        </div>
        <div class="abs" id="cnt" style="left:130px;top:284px;font-size:21px;color:#CBD5E1"><b id="cn" style="color:#fff">0</b> pemandu terverifikasi · diurutkan dari rating tertinggi</div>
        <div class="abs chip green" id="vb" style="right:130px;top:280px;font-size:17px">${icon('shield', 18, '#16A34A', 2.2)} Semua pemandu sudah dicek identitas & sertifikasi</div>
        ${cards}
        <div id="cur" class="abs" style="left:0;top:0;width:1920px;height:1080px"></div>
      </div></div>`;
    const q = s => root.querySelector(s);
    const ctx = { g: q('#g'), bar: q('#bar'), fv: q('#fv'), fc: q('#fc'), f1: q('#f1'), cari: q('#cari'), cn: q('#cn'), cnt: q('#cnt'), vb: q('#vb'), cards: [...root.querySelectorAll('.s18c')], vs: [...root.querySelectorAll('.s18v')], bs: [...root.querySelectorAll('.s18b')] };
    ctx.cursor = new Cursor(q('#cur'));
    return ctx;
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'whipL', 'cut', 0.22, 0.1);
    const focus = E.io3(prog(lt, 3.75, 4.1));
    tf(c.g, `translate3d(${lerp(0, 560, focus).toFixed(1)}px,${lerp(0, 40, focus).toFixed(1)}px,${lerp(0, 300, focus).toFixed(0)}px) rotateY(${(lerp(5, -3, lt / dur) * (1 - focus)).toFixed(2)}deg) rotateX(${(3 * (1 - focus)).toFixed(2)}deg) scale(${lerp(0.92, 0.97, lt / dur).toFixed(4)})`);
    const pb = E.o4(prog(lt, 0.05, 0.4)); tf(c.bar, `translateY(${((1 - pb) * -60).toFixed(1)}px)`); op(c.bar, pb);
    c.fv.textContent = typed('Labuan Bajo, NTT', lt, 0.3, 40);
    op(c.fc, lt < 0.75 && caretOn(lt) ? 1 : 0);
    c.f1.classList.toggle('focus', lt < 0.8);
    tf(c.cari, `scale(${lt > 0.78 && lt < 0.9 ? 0.94 : 1})`);
    c.cari.style.boxShadow = lt > 0.78 ? '0 0 40px rgba(53,168,255,.9)' : '';
    c.cn.textContent = Math.round(E.o3(prog(lt, 0.9, 1.6)) * 34);
    op(c.cnt, prog(lt, 0.85, 1.0));
    const vb = E.back(prog(lt, 1.7, 1.95)); tf(c.vb, `scale(${vb.toFixed(3)})`); op(c.vb, prog(lt, 1.7, 1.75));
    c.vb.style.boxShadow = lt > 1.7 ? `0 0 ${(24 + Math.sin(lt * 6) * 10).toFixed(0)}px rgba(22,163,74,.7)` : '';
    c.cards.forEach((cd, i) => {
      const t0 = 0.9 + i * 0.09, d = lt - t0;
      const p = d > 0 ? spring(d, 13, 7) : 0;
      let z = 0, o = clamp(d * 8);
      if (i === 0) { z = lerp(0, 120, focus); cd.style.boxShadow = focus > 0 ? `0 30px 80px rgba(0,0,0,.5),0 0 0 3px #35A8FF,0 0 60px rgba(53,168,255,${(0.9 * focus).toFixed(2)})` : ''; }
      else o *= 1 - focus * 0.85;
      tf(cd, `translateZ(${z.toFixed(0)}px) rotateX(${((1 - p) * -85).toFixed(2)}deg) translateY(${((1 - p) * 60).toFixed(1)}px)`);
      op(cd, o);
    });
    c.vs.forEach((v, i) => { const t0 = 1.75 + i * 0.08; const pl = Math.exp(-Math.max(0, lt - t0) * 5) * (lt > t0 ? 1 : 0); v.style.filter = `drop-shadow(0 0 ${(pl * 14).toFixed(1)}px #16A34A)`; tf(v, `scale(${(1 + pl * 0.5).toFixed(3)})`); });
    tf(c.bs[0], `scale(${lt > 3.6 && lt < 3.72 ? 0.94 : 1})`);
    c.cursor.update(lt, [[0.45, 1400, 300], [0.78, 1690, 218], [1.4, 1500, 500], [2.9, 1100, 760], [3.6, 532, 593], [4.1, 532, 593]], [0.78, 3.6], [0.45, 4.15]);
  },
});
CAPS.push([36.4, 38.2, 0, 'Cari pemandu lokal di kota tujuanmu']);
CAPS.push([38.2, 39.95, 0, 'Semua <span style="color:#4ADE80">terverifikasi</span> — identitas & sertifikasi']);

/* ---------- S19  Profile + booking  40.0 – 44.1 ---------- */
addScene({
  id: 's19', start: 40.0, end: 44.1, z: 2,
  build(root) {
    const g = GUIDES[0];
    const days = [['Hari 1', '12 Nov'], ['Hari 2', '13 Nov'], ['Hari 3', '14 Nov'], ['Hari 4', '15 Nov']];
    root.innerHTML = `<div class="cam persp" style="perspective:2400px">
      <div class="abs" id="g" style="left:0;top:0;width:1920px;height:1080px;transform-style:preserve-3d;transform-origin:960px 500px">
        <div class="card" id="prof" style="left:140px;top:110px;width:1000px;height:740px">
          <div class="thumb" style="height:230px;border-radius:0">${art('padar')}</div>
          <div class="abs" id="av" style="left:44px;top:160px;width:150px;height:150px;border-radius:36px;border:6px solid #fff;font-size:52px;box-shadow:0 0 0 3px #35A8FF,0 0 40px rgba(53,168,255,.8)"><div class="avatar ${g[1]}" style="width:100%;height:100%;border-radius:30px;font-size:52px">${g[0]}</div></div>
          <div class="abs s19i" style="left:220px;top:250px"><div style="font-size:44px;font-weight:800;letter-spacing:-.02em">${g[2]}</div>
            <div style="display:flex;gap:18px;align-items:center;font-size:20px;color:#64748B;margin-top:4px"><span style="display:flex;gap:6px;align-items:center">${icon('pin', 20, '#64748B')} ${g[3]}</span><span style="display:flex;gap:6px;align-items:center"><span style="color:#F59E0B">${icon('star', 20, '#F59E0B', 1)}</span><b style="color:#0F172A">4,9</b> (284 trip)</span></div></div>
          <div class="abs chip green s19i" id="ver" style="right:40px;top:256px;font-size:18px;padding:9px 18px">${icon('shield', 20, '#16A34A', 2.2)} Terverifikasi</div>
          <div class="abs s19i" style="left:44px;top:350px;display:flex;gap:10px">${g[6].map(t => `<span class="chip" style="font-size:18px">${t}</span>`).join('')}</div>
          <div class="abs s19i" style="left:44px;top:420px;display:flex;gap:16px">
            ${[['clock', '17 tahun', 'pengalaman'], ['lang', 'Indonesia, Inggris', 'bahasa'], ['boat', 'Rute cadangan', 'kalau laut tinggi']].map(([ic, a, b]) => `<div style="width:290px;padding:18px;border-radius:18px;background:#F8FAFC;border:1px solid #E2E8F0;display:flex;gap:14px;align-items:center"><div class="ico" style="width:48px;height:48px;border-radius:12px;background:#EAF5FF;display:flex;align-items:center;justify-content:center">${icon(ic, 26, '#35A8FF')}</div><div><div style="font-size:19px;font-weight:700">${a}</div><div class="sub">${b}</div></div></div>`).join('')}
          </div>
          <div class="abs s19i" style="left:44px;right:44px;top:540px;font-size:22px;line-height:1.5;color:#334155;font-style:italic;border-left:4px solid #35A8FF;padding-left:22px">“Saya lahir di Labuan Bajo. Kalau laut sedang tinggi, saya punya rute cadangan yang tetap bagus.”</div>
          <div class="abs s19i" style="left:44px;top:660px;display:flex;gap:10px;align-items:center;font-size:18px;color:#64748B">${['#35A8FF', '#FF6B24', '#4087C4'].map(cl => `<span style="width:34px;height:34px;border-radius:50%;background:${cl};border:3px solid #fff;margin-right:-16px"></span>`).join('')}<span style="margin-left:24px">Ulasan traveler: <b style="color:#0F172A">“ramah & tepat waktu”</b></span></div>
        </div>
        <div class="card" id="book" style="left:1180px;top:110px;width:600px;height:660px;padding:34px">
          <div style="font-size:28px;font-weight:800">Booking pemandu</div>
          <div class="sub" style="margin-top:4px">Sailing Komodo · 12–15 Nov 2026</div>
          <div class="label" style="margin-top:26px">Pilih tanggal</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${days.map(([a, b], i) => `<div class="opt s19d" style="position:relative;padding:14px 18px;border-radius:16px"><div style="font-size:19px;font-weight:700">${a}</div><div class="sub">${b}</div><div class="check" style="right:12px;top:16px;opacity:0;width:28px;height:28px">${icon('check', 16, '#fff', 3)}</div></div>`).join('')}</div>
          <div style="display:flex;justify-content:space-between;font-size:20px;margin-top:26px"><span style="color:#64748B">Peserta</span><b>2 orang</b></div>
          <div style="display:flex;justify-content:space-between;font-size:20px;margin-top:12px"><span style="color:#64748B">Rp 650 rb × <span id="nd">0</span> hari</span><b id="pr">Rp 0 rb</b></div>
          <div style="height:1px;background:#E2E8F0;margin:20px 0"></div>
          <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:22px;font-weight:700">Total</span><span id="tot" style="font-size:36px;font-weight:800">Rp 0 rb</span></div>
          <div class="btn orange" id="bk" style="width:100%;margin-top:24px;height:72px;font-size:24px"><span id="bkt">Booking pemandu</span><span id="spin" style="display:none;width:30px;height:30px;border-radius:50%;border:4px solid rgba(255,255,255,.4);border-top-color:#fff"></span></div>
          <div id="ok" class="abs" style="inset:0;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0">
            <div id="okc" style="width:170px;height:170px;border-radius:50%;background:#16A34A;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 14px rgba(22,163,74,.15),0 0 60px rgba(22,163,74,.8)">${icon('check', 100, '#fff', 3)}</div>
            <div style="font-size:36px;font-weight:800;margin-top:34px">Pemandu terkonfirmasi!</div>
            <div class="sub" style="font-size:20px;margin-top:8px">Rihana akan menemanimu di Hari 2</div>
            ${Array.from({ length: 12 }, (_, i) => `<div class="abs s19ray" data-a="${i * 30}" style="left:300px;top:250px;width:8px;height:40px;margin:-20px -4px;border-radius:4px;background:${i % 2 ? '#35A8FF' : '#16A34A'}"></div>`).join('')}
          </div>
        </div>
        <div class="card" id="mini" style="left:460px;top:800px;width:1000px;height:120px;display:flex;align-items:center;gap:20px;padding:0 26px;background:#EAF5FF;border:2px solid #35A8FF">
          <div style="width:64px;height:64px;border-radius:14px;background:#4087C4;color:#fff;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:13px;line-height:1">HARI<span style="font-size:28px">2</span></div>
          <div style="flex:1"><div style="font-size:24px;font-weight:800">Padar, Pink Beach & Komodo</div><div class="sub" style="font-size:18px">Jum, 13 Nov · 4 aktivitas</div></div>
          <div id="slot" style="display:flex;gap:12px;align-items:center;padding:10px 18px 10px 10px;border-radius:999px;background:#fff;border:2px dashed #93C5FD"><div class="avatar ab-blue" style="width:48px;height:48px;border-radius:50%;font-size:18px">RK</div><div><div style="font-size:18px;font-weight:700">Rihana Komeng</div><div style="font-size:14px;color:#16A34A;font-weight:700">Pemandu lokal · terkonfirmasi</div></div></div>
        </div>
        <div id="fly" class="abs avatar ab-blue" style="left:0;top:0;width:56px;height:56px;border-radius:50%;font-size:20px;box-shadow:0 0 30px rgba(53,168,255,1);opacity:0">RK</div>
        <div id="cur" class="abs" style="left:0;top:0;width:1920px;height:1080px"></div>
      </div></div>`;
    const q = s => root.querySelector(s);
    const ctx = { g: q('#g'), prof: q('#prof'), book: q('#book'), info: [...root.querySelectorAll('.s19i')], av: q('#av'), days: [...root.querySelectorAll('.s19d')], nd: q('#nd'), pr: q('#pr'), tot: q('#tot'), bk: q('#bk'), bkt: q('#bkt'), spin: q('#spin'), ok: q('#ok'), okc: q('#okc'), rays: [...root.querySelectorAll('.s19ray')], mini: q('#mini'), slot: q('#slot'), fly: q('#fly'), ver: q('#ver') };
    ctx.cursor = new Cursor(q('#cur'));
    return ctx;
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'zoomOut', 'whipL', 0.3, 0.2);
    tf(c.g, `rotateY(${(-4 + Math.sin(lt * 0.7) * 2).toFixed(2)}deg) rotateX(3deg) scale(${lerp(0.94, 0.98, lt / dur).toFixed(4)})`);
    const pp = E.o5(prog(lt, 0, 0.45)); tf(c.prof, `translateZ(${lerp(-300, 0, pp).toFixed(0)}px)`); op(c.prof, pp);
    const pb = E.o5(prog(lt, 0.2, 0.6)); tf(c.book, `translate3d(${((1 - pb) * 300).toFixed(1)}px,0,40px)`); op(c.book, pb);
    c.info.forEach((e, i) => { const p = E.o4(prog(lt, 0.2 + i * 0.07, 0.55 + i * 0.07)); tf(e, `translateY(${((1 - p) * 30).toFixed(1)}px)`); op(e, p); });
    tf(c.av, `scale(${E.back(prog(lt, 0.15, 0.5)).toFixed(3)})`);
    c.ver.style.boxShadow = lt > 0.7 ? `0 0 ${(18 + Math.sin(lt * 6) * 8).toFixed(0)}px rgba(22,163,74,.6)` : '';
    const picked = lt > 0.95;
    c.days.forEach((d, i) => { const on = i === 1 && picked; d.classList.toggle('sel', on); const ck = d.querySelector('.check'); op(ck, on ? 1 : 0); tf(ck, `scale(${on ? E.back(prog(lt, 0.95, 1.12)).toFixed(3) : 0})`); });
    const n = picked ? 1 : 0;
    c.nd.textContent = n; c.pr.textContent = `Rp ${Math.round(650 * E.o3(prog(lt, 0.95, 1.3)))} rb`; c.tot.textContent = c.pr.textContent;
    // booking press -> spinner -> success
    const pressed = lt > 1.75;
    tf(c.bk, `scale(${lt > 1.75 && lt < 1.87 ? 0.95 : 1})`);
    c.bkt.style.display = pressed && lt < 2.3 ? 'none' : ''; c.spin.style.display = pressed && lt < 2.3 ? 'block' : 'none';
    tf(c.spin, `rotate(${(lt * 900).toFixed(0)}deg)`);
    const okp = E.o3(prog(lt, 2.3, 2.45)); op(c.ok, okp);
    tf(c.okc, `scale(${E.back(prog(lt, 2.32, 2.6)).toFixed(3)})`);
    c.rays.forEach(r => { const a = +r.dataset.a * Math.PI / 180, p = E.o3(prog(lt, 2.35, 2.85)), R = 110 + p * 120; tf(r, `translate(${(Math.sin(a) * R).toFixed(1)}px,${(-Math.cos(a) * R).toFixed(1)}px) rotate(${r.dataset.a}deg) scaleY(${(1 - p).toFixed(3)})`); op(r, p > 0 ? 1 - p : 0); });
    // mini itinerary + flying avatar
    const pm = E.o5(prog(lt, 2.75, 3.15)); tf(c.mini, `translate3d(0,${((1 - pm) * 200).toFixed(1)}px,90px)`); op(c.mini, pm);
    const fp = E.io3(prog(lt, 3.05, 3.5));
    const sx = 1480, sy = 330, ex = 1165, ey = 860;
    const fx = lerp(sx, ex, fp), fy = lerp(sy, ey, fp) - Math.sin(fp * Math.PI) * 160;
    tf(c.fly, `translate3d(${(fx - 28).toFixed(1)}px,${(fy - 28).toFixed(1)}px,140px) scale(${lerp(1.3, 0.85, fp).toFixed(3)})`);
    op(c.fly, fp > 0 && fp < 1 ? 1 : 0);
    const snapped = lt > 3.5;
    op(c.slot, snapped ? 1 : 0.0);
    c.slot.style.borderStyle = snapped ? 'solid' : 'dashed';
    c.slot.style.boxShadow = snapped ? `0 0 ${(30 * Math.exp(-(lt - 3.5) * 3) + 10).toFixed(0)}px rgba(53,168,255,.9)` : '';
    tf(c.slot, `scale(${(snapped ? 1 + 0.12 * Math.exp(-(lt - 3.5) * 8) : 1).toFixed(3)})`);
    c.cursor.update(lt, [[0.55, 1000, 600], [0.95, 1540, 382], [1.4, 1500, 560], [1.75, 1480, 645], [2.2, 1480, 645]], [0.95, 1.75], [0.5, 2.25]);
  },
});
CAPS.push([40.4, 42.6, 0, 'Pilih tanggal, booking — <span class="blue">cuma beberapa klik</span>']);
CAPS.push([42.6, 43.95, 0, 'Pemandu langsung masuk ke itinerary-mu']);

/* ---------- S20  Open trip patungan  44.0 – 46.1 ---------- */
addScene({
  id: 's20', start: 44.0, end: 46.1, z: 2,
  build(root) {
    const tiers = [['1 orang', 4.80], ['4 orang', 3.70], ['6 orang · penuh', 3.10]];
    root.innerHTML = `<div class="cam persp" style="perspective:2200px">
      <div class="abs" id="g" style="left:0;top:0;width:1920px;height:1080px;transform-style:preserve-3d;transform-origin:960px 520px">
        <div class="abs eyebrow" style="left:260px;top:110px">Open trip patungan</div>
        <div class="abs big" style="left:260px;top:138px;font-size:72px">Mau lebih <span class="orange">hemat?</span></div>
        <div class="card" id="c" style="left:260px;top:280px;width:1400px;height:520px">
          <div class="abs thumb" style="left:0;top:0;width:440px;height:520px;border-radius:0">${art('labuanbajo')}</div>
          <div class="abs chip orange" style="left:24px;top:24px;background:#fff">${icon('users', 18, '#FF6B24')} Hampir penuh</div>
          <div class="abs" style="left:480px;top:40px;width:470px">
            <div class="sub" style="display:flex;gap:6px;align-items:center">${icon('pin', 18, '#64748B')} Labuan Bajo, NTT</div>
            <div style="font-size:32px;font-weight:800;line-height:1.2;margin-top:10px">Sailing Komodo: Padar, Pink Beach & Manta Point</div>
            <div style="display:flex;gap:10px;margin-top:16px"><span class="chip gray">${icon('cal', 16, '#475569')} 14–17 Des 2026</span><span class="chip gray">4H 3M</span></div>
            <div class="sub" style="margin-top:20px;font-size:18px;line-height:1.5">Biaya kapal, pemandu, dan makan dibagi rata ke semua peserta. Makin banyak yang gabung, makin murah.</div>
            <div style="margin-top:26px;font-size:17px;color:#64748B">Sudah gabung</div>
            <div style="display:flex;margin-top:8px">${['AN', 'DW', 'RS', 'KM'].map((a, i) => `<div class="avatar s20a ${['ab-blue', 'ab-orange', 'ab-navy', 'ab-green'][i]}" style="width:58px;height:58px;border-radius:50%;font-size:19px;border:3px solid #fff;margin-right:-12px">${a}</div>`).join('')}</div>
          </div>
          <div class="abs" style="left:990px;top:40px;width:370px">
            <div style="display:flex;justify-content:space-between;font-size:19px;font-weight:700"><span>Kuota peserta</span><span id="kq">1/6</span></div>
            <div style="height:12px;border-radius:6px;background:#E2E8F0;margin-top:10px"><div id="kb" style="height:100%;width:16%;border-radius:6px;background:#35A8FF;box-shadow:0 0 12px #35A8FF"></div></div>
            <div style="font-size:16px;color:#64748B;margin-top:20px;font-weight:700;letter-spacing:.08em">HARGA PER ORANG</div>
            ${tiers.map(([a, v], i) => `<div class="s20t" style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-radius:14px;border:1.5px solid #E2E8F0;margin-top:10px;font-size:19px"><span>${a}</span><b>${fmtJt(v)}</b></div>`).join('')}
            <div class="btn" style="width:100%;margin-top:20px">Gabung trip ini</div>
          </div>
        </div>
        <div class="abs" id="pp" style="left:1400px;top:150px;padding:16px 26px;border-radius:22px;background:#16A34A;font-size:34px;font-weight:800;box-shadow:0 0 40px rgba(22,163,74,.8)">Hemat <span id="hm">Rp 0</span></div>
      </div></div>`;
    const q = s => root.querySelector(s);
    return { g: q('#g'), c: q('#c'), av: [...root.querySelectorAll('.s20a')], kq: q('#kq'), kb: q('#kb'), tiers: [...root.querySelectorAll('.s20t')], pp: q('#pp'), hm: q('#hm') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'whipL', 'whipL', 0.22, 0.2);
    tf(c.g, `rotateY(${lerp(6, -4, lt / dur).toFixed(2)}deg) rotateX(3deg) scale(${lerp(0.95, 1.0, lt / dur).toFixed(4)})`);
    const joins = [0.35, 0.6, 0.85, 1.1];
    let n = 1;
    c.av.forEach((a, i) => { const p = E.back(prog(lt, joins[i], joins[i] + 0.22)); tf(a, `scale(${p.toFixed(3)})`); op(a, prog(lt, joins[i], joins[i] + 0.05)); if (lt > joins[i]) n = i + 2; });
    n = Math.min(n, 4) + (lt > 1.1 ? 0 : 0);
    const cnt = lt > 1.1 ? 4 : n;
    c.kq.textContent = cnt + '/6';
    c.kb.style.width = (cnt / 6 * 100).toFixed(1) + '%';
    const tier = cnt >= 4 ? 1 : 0;
    c.tiers.forEach((t, i) => { const on = i === tier; t.style.borderColor = on ? '#35A8FF' : '#E2E8F0'; t.style.background = on ? '#EAF5FF' : '#fff'; t.style.boxShadow = on ? '0 0 24px rgba(53,168,255,.5)' : ''; });
    const hp = E.back(prog(lt, 1.2, 1.45)); tf(c.pp, `scale(${hp.toFixed(3)}) rotate(-4deg)`); op(c.pp, prog(lt, 1.2, 1.25));
    c.hm.textContent = fmtJt(1.1 * E.o3(prog(lt, 1.2, 1.7)));
  },
});
CAPS.push([44.3, 45.95, 0, 'Gabung open trip — <span class="blue">biaya dibagi rata</span>']);

/* ---------- S21  Dashboard countdown  46.0 – 48.1 ---------- */
addScene({
  id: 's21', start: 46.0, end: 48.1, z: 2,
  build(root) {
    const list = ['Tiket pesawat dibeli', 'DP kapal ditransfer', 'Pemandu dibooking', 'Asuransi perjalanan', 'Sewa alat snorkeling'];
    root.innerHTML = `<div class="cam persp" style="perspective:2200px">
      <div class="abs" id="g" style="left:0;top:0;width:1920px;height:1080px;transform-style:preserve-3d;transform-origin:960px 520px">
        <div class="abs eyebrow" style="left:210px;top:120px">Trip saya</div>
        <div class="abs big" style="left:210px;top:148px;font-size:64px">Halo, Traveler!</div>
        <div class="card" style="left:210px;top:260px;width:1500px;height:540px;padding:44px">
          <div class="abs" style="left:44px;top:44px;width:640px">
            <div class="chip green">Trip berikutnya</div>
            <div style="display:flex;gap:24px;margin-top:22px;align-items:center"><div class="thumb" style="width:170px;height:130px;flex:0 0 auto">${art('padar')}</div>
            <div><div style="font-size:32px;font-weight:800;line-height:1.2">Sailing Komodo: Padar, Pink Beach & Manta Point</div>
            <div class="sub" style="font-size:18px;margin-top:8px">12–15 Nov 2026 · Labuan Bajo, NTT · 2 orang</div></div></div>
            <div style="display:flex;gap:14px;margin-top:34px"><div class="btn">Buka rencana ${icon('arrow', 22, '#fff', 2.6)}</div><div class="btn ghost">Simpan offline</div></div>
            <div style="display:flex;gap:12px;align-items:center;margin-top:34px;padding:16px 20px;border-radius:18px;background:#EAF5FF"><div class="avatar ab-blue" style="width:52px;height:52px;border-radius:50%;font-size:18px">RK</div><div><div style="font-size:19px;font-weight:700">Rihana Komeng · pemandu Hari 2</div><div class="sub">Terverifikasi · 4,9</div></div></div>
          </div>
          <div class="abs" style="left:760px;top:44px;width:696px">
            <div style="font-size:16px;font-weight:700;letter-spacing:.12em;color:#64748B">BERANGKAT DALAM</div>
            <div style="display:flex;gap:16px;margin-top:12px">${[['d', '27', 'HARI'], ['h', '14', 'JAM'], ['m', '08', 'MENIT'], ['s', '42', 'DETIK']].map(([k, v, l]) => `<div style="flex:1;height:124px;border-radius:18px;background:#EAF5FF;display:flex;flex-direction:column;align-items:center;justify-content:center"><div id="cd${k}" style="font-size:54px;font-weight:800;color:#35A8FF">${v}</div><div style="font-size:14px;font-weight:700;color:#4087C4;letter-spacing:.1em">${l}</div></div>`).join('')}</div>
            <div style="margin-top:24px;padding:20px 24px;border-radius:18px;background:#F8FAFC;border:1px solid #E2E8F0">
              <div style="display:flex;justify-content:space-between;font-size:19px;font-weight:700"><span>Persiapan</span><span id="pc">0 dari 5</span></div>
              <div style="height:10px;border-radius:5px;background:#E2E8F0;margin-top:10px"><div id="pb" style="height:100%;width:0;border-radius:5px;background:#16A34A;box-shadow:0 0 12px #16A34A"></div></div>
              ${list.map(l => `<div class="s21l" style="display:flex;gap:12px;align-items:center;font-size:19px;margin-top:12px;color:#94A3B8"><span class="s21c" style="width:28px;height:28px;border-radius:50%;border:2px solid #CBD5E1;display:flex;align-items:center;justify-content:center"></span>${l}</div>`).join('')}
            </div>
          </div>
        </div>
      </div></div>`;
    const q = s => root.querySelector(s);
    return { g: q('#g'), ls: [...root.querySelectorAll('.s21l')], cs: [...root.querySelectorAll('.s21c')], pc: q('#pc'), pb: q('#pb'), cds: q('#cds'), cdm: q('#cdm') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'whipL', 'cut', 0.22, 0.1);
    tf(c.g, `rotateY(${lerp(-5, 3, lt / dur).toFixed(2)}deg) rotateX(3deg) scale(${lerp(0.95, 1.02, lt / dur).toFixed(4)})`);
    c.cds.textContent = String(42 - Math.floor(lt)).padStart(2, '0');
    let done = 0;
    c.ls.forEach((l, i) => {
      const t0 = 0.45 + i * 0.22, on = lt > t0;
      if (on) done++;
      l.style.color = on ? '#0F172A' : '#94A3B8';
      const ck = c.cs[i];
      if (on && !ck.dataset.on) { ck.dataset.on = 1; ck.innerHTML = icon('check', 16, '#fff', 3.2); }
      if (!on && ck.dataset.on) { delete ck.dataset.on; ck.innerHTML = ''; }
      ck.style.background = on ? '#16A34A' : 'transparent'; ck.style.borderColor = on ? '#16A34A' : '#CBD5E1';
      tf(ck, `scale(${on ? (1 + 0.4 * Math.exp(-(lt - t0) * 10)).toFixed(3) : 1})`);
      ck.style.boxShadow = on ? `0 0 ${(16 * Math.exp(-(lt - t0) * 4)).toFixed(1)}px #16A34A` : '';
    });
    c.pc.textContent = done + ' dari 5';
    c.pb.style.width = (done / 5 * 100) + '%';
  },
});
CAPS.push([46.3, 47.95, 0, 'Semua rencana rapi di satu tempat']);
FLASH.push([48.0, 0.8, 0.3]);

/* ---------- S22  Destination montage  48.0 – 51.1 ---------- */
const S22 = [['padar', 'Pulau Padar · NTT', '8.65°S 119.58°E'], ['bromo', 'Gunung Bromo · Jawa Timur', '7.94°S 112.95°E'], ['rajaampat', 'Raja Ampat · Papua Barat Daya', '0.23°S 130.52°E'], ['borobudur', 'Candi Borobudur · Jawa Tengah', '7.61°S 110.20°E'], ['balibeach', 'Nusa Penida · Bali', '8.73°S 115.45°E'], ['terraces', 'Sawah Tegallalang · Bali', '8.43°S 115.28°E'], ['toba', 'Rumah Adat Batak · Samosir', '2.68°N 98.87°E'], ['jogja', 'Tugu Jogja · Yogyakarta', '7.78°S 110.37°E']];
const S22_CUT = 3.0 / S22.length;
addScene({
  id: 's22', start: 48.0, end: 51.1, z: 2,
  build(root) {
    root.innerHTML = `<div class="cam">
      ${S22.map(([a], i) => `<div class="abs s22s" style="inset:0;overflow:hidden"><div class="fill s22i">${art(a)}</div></div>`).join('')}
      <div class="abs" style="inset:0;background:linear-gradient(180deg,rgba(11,17,32,.35),rgba(11,17,32,.15) 40%,rgba(11,17,32,.75))"></div>
      ${['tl', 'tr', 'bl', 'br'].map(k => `<div class="abs" style="width:60px;height:60px;border-color:rgba(255,255,255,.9);border-style:solid;border-width:${k[0] === 't' ? 3 : 0}px ${k[1] === 'r' ? 3 : 0}px ${k[0] === 'b' ? 3 : 0}px ${k[1] === 'l' ? 3 : 0}px;${k[1] === 'l' ? 'left' : 'right'}:60px;${k[0] === 't' ? 'top' : 'bottom'}:60px"></div>`).join('')}
      <div class="abs hud" style="left:100px;top:96px;color:#fff;font-size:20px">Kelana // Destinasi <span id="dn">01</span></div>
      <div class="abs" style="left:100px;bottom:100px"><div id="loc" style="font-size:40px;font-weight:800"></div><div class="hud" id="co" style="color:#CFE8FF;margin-top:6px;font-size:20px"></div></div>
      <div class="abs hud" style="right:100px;top:96px;color:#fff;font-size:20px;display:flex;gap:10px;align-items:center"><span style="width:14px;height:14px;border-radius:50%;background:#DC2626;box-shadow:0 0 12px #DC2626"></span>REC</div>
      ${['Nggak bingung.', 'Nggak takut salah.', 'Tinggal berangkat.'].map((w, i) => `<div class="center display s22w" style="font-size:${i === 2 ? 160 : 170}px;white-space:nowrap;color:#fff;text-shadow:0 0 50px rgba(53,168,255,.8),0 8px 40px rgba(0,0,0,.5)">${i === 2 ? '<span style="color:#FF6B24">Tinggal</span> berangkat.' : w}</div>`).join('')}
    </div>`;
    return { s: [...root.querySelectorAll('.s22s')], im: [...root.querySelectorAll('.s22i')], w: [...root.querySelectorAll('.s22w')], loc: root.querySelector('#loc'), co: root.querySelector('#co'), dn: root.querySelector('#dn') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'cut');
    const idx = Math.min(S22.length - 1, Math.floor(lt / S22_CUT));
    c.s.forEach((s, i) => {
      const on = i === idx; s.style.display = on ? 'block' : 'none';
      if (!on) return;
      const d = lt - i * S22_CUT;
      const dir = i % 2 ? 1 : -1;
      tf(c.im[i], `scale(${lerp(1.18, 1.06, E.o3(d / S22_CUT)).toFixed(4)}) translateX(${(dir * lerp(40, 0, E.o4(d / S22_CUT))).toFixed(1)}px)`);
    });
    if (c.loc.dataset.i != idx) { c.loc.dataset.i = idx; c.loc.textContent = S22[idx][1]; c.co.textContent = S22[idx][2]; c.dn.textContent = '0' + (idx + 1); }
    c.w.forEach((w, i) => {
      const t0 = i * 1.0, on = lt >= t0 && lt < t0 + 1.0;
      w.style.display = on ? 'block' : 'none';
      if (!on) return;
      const d = lt - t0;
      tf(w, `translate(-50%,-50%) scale(${(lerp(1.5, 1, E.o5(prog(d, 0, 0.14))) + d * 0.05).toFixed(4)})`);
      op(w, prog(d, 0, 0.05));
    });
  },
});
for (let i = 1; i < S22.length; i++) FLASH.push([48.0 + i * S22_CUT, 0.22, 0.1]);
SHAKE.push([49.0, 10, 0.2], [50.0, 10, 0.2]);

/* ---------- S23  End card  51.0 – 56.0 ---------- */
addScene({
  id: 's23', start: 51.0, end: 56.0, z: 3,
  build(root) {
    const feat = [['route', 'Itinerary sesuai keinginan'], ['shield', 'Pemandu lokal terverifikasi'], ['wallet', 'Pas dengan budget']];
    root.innerHTML = `<div class="cam persp">
      <div class="abs" id="halo" style="left:960px;top:330px;width:1100px;height:600px;margin:-300px -550px;border-radius:50%;background:radial-gradient(ellipse,rgba(53,168,255,.35),rgba(53,168,255,0) 65%)"></div>
      <div class="abs" id="logo" style="left:640px;top:165px;width:640px;height:230px;filter:drop-shadow(0 0 26px rgba(53,168,255,.85)) drop-shadow(0 0 70px rgba(53,168,255,.4))">${logoSVG('#35A8FF')}</div>
      <div class="abs hud" id="sub" style="left:0;right:0;top:420px;text-align:center;letter-spacing:.6em;color:#CFE8FF;font-size:22px">Keliling Nusantara</div>
      <div class="abs big" id="tag" style="left:0;right:0;top:490px;text-align:center;font-size:66px"></div>
      <div class="abs" id="feat" style="left:0;right:0;top:620px;display:flex;justify-content:center;gap:22px">${feat.map(([ic, t]) => `<div class="s23f" style="display:flex;gap:14px;align-items:center;padding:16px 26px;border-radius:999px;background:rgba(15,23,42,.8);border:1.5px solid rgba(53,168,255,.6);font-size:25px;font-weight:700;box-shadow:0 0 24px rgba(53,168,255,.3)">${icon(ic, 30, '#35A8FF', 2.2)} ${t}</div>`).join('')}</div>
      <div class="abs" id="cta" style="left:0;right:0;top:760px;display:flex;justify-content:center;gap:24px">
        <div class="btn orange s23b" style="height:86px;font-size:30px;padding:0 50px;box-shadow:0 0 50px rgba(255,107,36,.75)">Susun itinerary sekarang ${icon('arrow', 30, '#fff', 2.6)}</div>
        <div class="btn s23b" style="height:86px;font-size:30px;padding:0 50px;box-shadow:0 0 50px rgba(53,168,255,.7)">${icon('users', 30, '#fff', 2.4)} Cari pemandu</div>
      </div>
      <div class="abs" id="fine" style="left:0;right:0;top:900px;text-align:center;font-size:24px;color:#94A3B8">Rencana jalan-jalan yang rapi, realistis, dan siap jalan.</div>
      <div class="abs" id="black" style="inset:0;background:#000;opacity:0"></div>
    </div>`;
    const q = s => root.querySelector(s);
    return { logo: q('#logo'), letters: [...root.querySelectorAll('#logo .lgl')], sub: q('#sub'), tag: splitText(q('#tag'), 'Liburan bukan keinginan, [o]tapi kebutuhan.[/o]', 'wd'), f: [...root.querySelectorAll('.s23f')], b: [...root.querySelectorAll('.s23b')], fine: q('#fine'), black: q('#black'), halo: q('#halo'), cam: root.querySelector('.cam') };
  },
  update(lt, c, dur, root) {
    transition(root, lt, dur, 'cut', 'cut');
    const ps = E.o5(prog(lt, 0, 0.7));
    tf(c.logo, `scale(${lerp(1.4, 1, ps).toFixed(4)})`);
    { const wp = E.o4(prog(lt, 0, 0.55)); c.logo.style.clipPath = wp >= 1 ? 'none' : `inset(-80px ${((1 - wp) * 100).toFixed(2)}% -80px -80px)`; }
    c.letters.forEach((l, i) => { const p = E.o5(prog(lt, 0.02 + i * 0.05, 0.42 + i * 0.05)); l.setAttribute('transform', `translate(0 ${((1 - p) * 360).toFixed(1)})`); });
    op(c.halo, 0.6 + Math.sin(lt * 2) * 0.2);
    const pS = E.o4(prog(lt, 0.4, 0.9)); op(c.sub, pS); c.sub.style.letterSpacing = lerp(1.1, 0.6, pS).toFixed(3) + 'em';
    riseIn(c.tag, lt, 0.6, { stagger: 0.07, dur: 0.5, y: 60 });
    c.f.forEach((f, i) => { const p = E.back(prog(lt, 1.2 + i * 0.12, 1.5 + i * 0.12)); tf(f, `scale(${p.toFixed(3)})`); op(f, prog(lt, 1.2 + i * 0.12, 1.3 + i * 0.12)); });
    c.b.forEach((b, i) => { const p = E.back(prog(lt, 1.8 + i * 0.12, 2.15 + i * 0.12)); const pulse = lt > 2.6 ? 1 + Math.sin((lt - 2.6) * 5 + i) * 0.015 : 1; tf(b, `translateY(${((1 - E.o4(prog(lt, 1.8 + i * 0.12, 2.2 + i * 0.12))) * 40).toFixed(1)}px) scale(${(p * pulse).toFixed(4)})`); op(b, prog(lt, 1.8 + i * 0.12, 1.9 + i * 0.12)); });
    op(c.fine, prog(lt, 2.4, 2.8));
    tf(c.cam, `scale(${lerp(1.0, 1.035, lt / dur).toFixed(4)})`);
    op(c.black, E.io3(prog(lt, 4.35, 5.0)));
  },
});
FLASH.push([51.0, 1, 0.5]);
SHAKE.push([51.0, 14, 0.4]);
