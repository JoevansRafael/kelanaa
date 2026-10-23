/* =========================================================
   Sound design + music, fully synthesized with OfflineAudioContext.
   window.renderAudio() -> { sampleRate, left:Float32Array, right:Float32Array }
   ========================================================= */
window.renderAudio = async function () {
  const SR = 48000, LEN = DURATION;
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * LEN), SR);
  const R = mulberry(2026);

  /* ---------- buses ---------- */
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.18;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.08;
  const master = ctx.createGain(); master.gain.value = 0.9;
  comp.connect(limiter); limiter.connect(master); master.connect(ctx.destination);
  // master fade out
  master.gain.setValueAtTime(0.9, 58.4); master.gain.linearRampToValueAtTime(0.0, 60.0);

  const mkIR = (sec, decay) => {
    const b = ctx.createBuffer(2, SR * sec, SR);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / d.length, decay); }
    return b;
  };
  const verb = ctx.createConvolver(); verb.buffer = mkIR(3.2, 3.2);
  const verbIn = ctx.createGain(); verbIn.gain.value = 1; verbIn.connect(verb);
  const verbOut = ctx.createGain(); verbOut.gain.value = 0.32; verb.connect(verbOut); verbOut.connect(comp);

  const music = ctx.createGain(); music.gain.value = 0.62; music.connect(comp);
  const sfx = ctx.createGain(); sfx.gain.value = 0.85; sfx.connect(comp);
  // sidechain "duck" bus for pads/bass, pumped by the kick
  const duck = ctx.createGain(); duck.gain.value = 1; duck.connect(music);

  const noiseBuf = (() => { const b = ctx.createBuffer(1, SR * 3, SR); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; return b; })();
  const noise = (t, dur) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.start(t, R() * 2); s.stop(t + dur + 0.05); return s; };
  const out = (node, bus, pan = 0, send = 0) => {
    const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(bus);
    if (send) { const s = ctx.createGain(); s.gain.value = send; p.connect(s); s.connect(verbIn); }
    return p;
  };
  const gainEnv = (t, a, peak, d, curve = 'exp') => {
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    if (curve === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); else g.gain.linearRampToValueAtTime(0.0001, t + a + d);
    return g;
  };
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  /* =================== SFX library =================== */
  function whoosh(t, dur = 0.35, gain = 0.5, f0 = 250, f1 = 5000, pan0 = -0.7, pan1 = 0.7) {
    const n = noise(t, dur);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7); bp.frequency.exponentialRampToValueAtTime(f1 * 0.5, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.65); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner(); p.pan.setValueAtTime(pan0, t); p.pan.linearRampToValueAtTime(pan1, t + dur);
    n.connect(bp); bp.connect(g); g.connect(p); p.connect(sfx);
    const s = ctx.createGain(); s.gain.value = 0.25; p.connect(s); s.connect(verbIn);
  }
  function impact(t, gain = 0.9, f0 = 140, f1 = 38, len = 0.9) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.35);
    const g = gainEnv(t, 0.004, gain, len); o.connect(g); out(g, sfx, 0, 0.2); o.start(t); o.stop(t + len + 0.1);
    const n = noise(t, 0.3); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3500, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    const g2 = gainEnv(t, 0.002, gain * 0.55, 0.28); n.connect(lp); lp.connect(g2); out(g2, sfx, 0, 0.35);
  }
  function crash(t, gain = 0.35, len = 1.8) {
    const n = noise(t, len); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4500;
    const g = gainEnv(t, 0.003, gain, len); n.connect(hp); hp.connect(g); out(g, sfx, 0, 0.4);
  }
  function bigImpact(t, gain = 1) {
    impact(t, gain, 160, 32, 1.6); crash(t, 0.3 * gain, 2.2);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 46;
    const g = gainEnv(t, 0.01, 0.5 * gain, 2.2); o.connect(g); out(g, sfx); o.start(t); o.stop(t + 2.4);
  }
  function click(t, gain = 0.32, f = 2600) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.03);
    const g = gainEnv(t, 0.001, gain, 0.045); o.connect(g); out(g, sfx, 0.1, 0.1); o.start(t); o.stop(t + 0.08);
    const n = noise(t, 0.02); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000;
    const g2 = gainEnv(t, 0.0005, gain * 0.5, 0.015); n.connect(hp); hp.connect(g2); out(g2, sfx, 0.1);
  }
  function key(t, gain = 0.12) {
    const n = noise(t, 0.03); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500 + R() * 2500; bp.Q.value = 2;
    const g = gainEnv(t, 0.0008, gain, 0.025); n.connect(bp); bp.connect(g); out(g, sfx, (R() - 0.5) * 0.4);
  }
  function blip(t, f = 1600, gain = 0.18, dur = 0.07, type = 'sine', pan = 0) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
    const g = gainEnv(t, 0.002, gain, dur); o.connect(g); out(g, sfx, pan, 0.15); o.start(t); o.stop(t + dur + 0.05);
  }
  function pop(t, f = 700, gain = 0.3, pan = 0) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f * 0.55, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
    const g = gainEnv(t, 0.003, gain, 0.12); o.connect(g); out(g, sfx, pan, 0.2); o.start(t); o.stop(t + 0.2);
  }
  function bell(t, f, gain = 0.2, dur = 1.2, pan = 0, send = 0.45) {
    [[1, 1], [2.01, 0.35], [3.02, 0.15], [4.1, 0.08]].forEach(([m, a]) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * m;
      const g = gainEnv(t, 0.003, gain * a, dur / m); o.connect(g); out(g, sfx, pan, send); o.start(t); o.stop(t + dur + 0.1);
    });
  }
  function ping(t, f = 1320, gain = 0.2, pan = 0) { bell(t, f, gain, 0.6, pan); bell(t + 0.07, f * 1.5, gain * 0.7, 0.5, pan); }
  function chime(t, notes, gain = 0.18, step = 0.06) { notes.forEach((n, i) => bell(t + i * step, midi(n), gain, 1.4, (i - notes.length / 2) * 0.2)); }
  function buzz(t, gain = 0.16, dur = 0.22, f = 110) {
    [f, f * 1.06].forEach(fr => {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = fr;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
      const g = gainEnv(t, 0.004, gain, dur, 'lin'); o.connect(lp); lp.connect(g); out(g, sfx, 0, 0.1); o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function tick(t, gain = 0.12, f = 7000) {
    const n = noise(t, 0.02); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = f;
    const g = gainEnv(t, 0.0005, gain, 0.018); n.connect(hp); hp.connect(g); out(g, sfx, (R() - 0.5) * 0.6);
  }
  function riser(t0, t1, gain = 0.35, f0 = 200, f1 = 7000) {
    const d = t1 - t0, n = noise(t0, d);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3;
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(f1, t1);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t1 - 0.02); g.gain.linearRampToValueAtTime(0.0001, t1);
    n.connect(bp); bp.connect(g); out(g, sfx, 0, 0.3);
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(880, t1);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t0); lp.frequency.exponentialRampToValueAtTime(5000, t1);
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t0); g2.gain.exponentialRampToValueAtTime(gain * 0.25, t1 - 0.02); g2.gain.linearRampToValueAtTime(0.0001, t1);
    o.connect(lp); lp.connect(g2); out(g2, sfx, 0, 0.3); o.start(t0); o.stop(t1 + 0.05);
  }
  function glitch(t0, t1, gain = 0.25) {
    for (let t = t0; t < t1; t += 0.022) {
      if (R() < 0.35) continue;
      const n = noise(t, 0.02); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300 + R() * 6000; bp.Q.value = 4;
      const g = gainEnv(t, 0.001, gain, 0.018, 'lin'); n.connect(bp); bp.connect(g); out(g, sfx, (R() - 0.5));
      if (R() < 0.4) blip(t, 200 + R() * 3000, gain * 0.5, 0.02, 'square', (R() - 0.5));
    }
  }
  function powerDown(t, gain = 0.3) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.35);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(4000, t); lp.frequency.exponentialRampToValueAtTime(200, t + 0.35);
    const g = gainEnv(t, 0.005, gain, 0.4, 'lin'); o.connect(lp); lp.connect(g); out(g, sfx, 0, 0.2); o.start(t); o.stop(t + 0.5);
  }
  function shimmer(t, dur = 1.2, gain = 0.06, base = 84) {
    for (let i = 0; i < 18; i++) {
      const tt = t + R() * dur * 0.7, n = base + [0, 4, 7, 12, 16, 19, 24][Math.floor(R() * 7)];
      bell(tt, midi(n), gain, 0.6, (R() - 0.5) * 1.4, 0.7);
    }
  }
  function revSwell(t0, t1, gain = 0.3) {
    const d = t1 - t0, n = noise(t0, d);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t0); lp.frequency.exponentialRampToValueAtTime(9000, t1);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t1 - 0.01); g.gain.linearRampToValueAtTime(0.0001, t1);
    n.connect(lp); lp.connect(g); out(g, sfx, 0, 0.5);
  }

  /* =================== MUSIC =================== */
  const BEAT = 0.5;
  function kick(t, gain = 0.85, pump = true) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const g = gainEnv(t, 0.002, gain, 0.32); o.connect(g); out(g, music); o.start(t); o.stop(t + 0.4);
    const n = noise(t, 0.01); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    const g2 = gainEnv(t, 0.0005, gain * 0.25, 0.01); n.connect(hp); hp.connect(g2); out(g2, music);
    if (pump) { duck.gain.setValueAtTime(0.3, t); duck.gain.linearRampToValueAtTime(1, t + 0.24); }
  }
  function clap(t, gain = 0.32) {
    [0, 0.012, 0.024].forEach((d, i) => {
      const n = noise(t + d, 0.15); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.8;
      const g = gainEnv(t + d, 0.001, gain * (i === 2 ? 1 : 0.6), i === 2 ? 0.16 : 0.02); n.connect(bp); bp.connect(g); out(g, music, 0, 0.3);
    });
  }
  function snare(t, gain = 0.25) {
    const n = noise(t, 0.12); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.7;
    const g = gainEnv(t, 0.001, gain, 0.1); n.connect(bp); bp.connect(g); out(g, music, 0, 0.15);
  }
  function hat(t, gain = 0.09, open = false, pan = 0.25) {
    const n = noise(t, open ? 0.25 : 0.05); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 8000;
    const g = gainEnv(t, 0.0005, gain, open ? 0.2 : 0.035); n.connect(hp); hp.connect(g); out(g, music, pan);
  }
  function pluck(t, f, gain = 0.1, pan = 0, cutoff = 3200) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = f * 1.003;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 4;
    lp.frequency.setValueAtTime(cutoff, t); lp.frequency.exponentialRampToValueAtTime(400, t + 0.18);
    const g = gainEnv(t, 0.002, gain, 0.22); o.connect(lp); o2.connect(lp); lp.connect(g); out(g, music, pan, 0.35);
    o.start(t); o2.start(t); o.stop(t + 0.3); o2.stop(t + 0.3);
  }
  function bassNote(t, f, dur, gain = 0.32) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const s = ctx.createOscillator(); s.type = 'sine'; s.frequency.value = f / 2;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(220, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.01); g.gain.setValueAtTime(gain, t + dur - 0.03); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    const gs = ctx.createGain(); gs.gain.value = 0.9;
    o.connect(lp); lp.connect(g); s.connect(gs); gs.connect(g); out(g, duck);
    o.start(t); s.start(t); o.stop(t + dur + 0.02); s.stop(t + dur + 0.02);
  }
  function pad(t, notes, dur, gain = 0.05, cutoff = 1800, bus = duck) {
    notes.forEach((n, i) => [-7, 7].forEach(det => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = det;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(0.5, dur * 0.3)); g.gain.setValueAtTime(gain, t + dur - 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(lp); lp.connect(g); out(g, bus, det > 0 ? 0.35 : -0.35, 0.4); o.start(t); o.stop(t + dur + 0.05);
    }));
  }

  /* ---- ACT 1: slow tension build (0 – 14.4) ---- */
  [38, 50].forEach((n, i) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = i ? 6 : -4;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(200, 0); lp.frequency.linearRampToValueAtTime(950, 14.2);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, 0); g.gain.linearRampToValueAtTime(0.08, 1.6); g.gain.linearRampToValueAtTime(0.13, 14.0); g.gain.linearRampToValueAtTime(0.0001, 14.5);
    o.connect(lp); lp.connect(g); out(g, music, i ? 0.3 : -0.3, 0.2); o.start(0); o.stop(14.6);
  });
  pad(T.s3, [62, 63, 69], 4.6, 0.028, 1400, music);
  for (let t = 1.0; t < 14.4; t += 0.25) hat(t, 0.025 + 0.05 * (t / 14.4), false, (Math.floor(t * 4) % 2 ? 0.3 : -0.3));
  for (let t = T.s2; t < 14.3; t += BEAT) { kick(t, 0.42, false); if (t > 10.5) kick(t + 0.2, 0.26, false); }
  for (let t = T.s3; t < 14.3; t += 0.25) bassNote(t, midi(38), 0.2, 0.11);
  for (let t = 13.0; t < 14.4; t += 0.14) snare(t, 0.05 + (t - 13.0) * 0.1);

  /* ---- calm -> logo (14.4 – 19.6) ---- */
  pad(T.s5, [53, 57, 60, 64, 67], 2.6, 0.035, 1600, music);
  pad(T.s6, [41, 53, 57, 60, 65], 3.4, 0.042, 2400, music);
  bassNote(T.s6, midi(29), 3.0, 0.3);
  for (let i = 0; i < 24; i++) { const notes = [65, 69, 72, 76, 77, 76, 72, 69]; pluck(T.s6 + i * 0.125, midi(notes[i % 8]), 0.05 + i * 0.002, (i % 2 ? 0.4 : -0.4), 2400); }

  /* ---- ACT 2-3: main groove, F – C – Dm – Bb (19.2 – 56.0) ---- */
  const PROG = [[41, [65, 69, 72]], [36, [64, 67, 72]], [38, [62, 65, 69]], [34, [62, 65, 70]]];
  const G0 = T.s11, G1 = T.s23;
  const breaks = [[T.s14, T.s14e - 0.2], [T.s17 - 0.2, T.s17 + 0.3], [T.s22 - 1.0, T.s22]];
  const inBreak = t => breaks.some(([a, b]) => t >= a && t < b);
  for (let bar = 0; G0 + bar * 2 < G1; bar++) {
    const t0 = G0 + bar * 2, [root, chord] = PROG[bar % 4];
    pad(t0, chord.map(n => n - 12).concat([chord[0]]), 2.0, 0.026, 2000);
    for (let b = 0; b < 4; b++) {
      const t = t0 + b * BEAT;
      if (t >= G1) break;
      const br = inBreak(t);
      if (!br) { kick(t, 0.78); if (b === 1 || b === 3) clap(t, 0.27); hat(t + 0.25, 0.075, b === 3, 0.25); }
      for (let sx = 0; sx < 4; sx++) if (!br) hat(t + sx * 0.125, 0.024, false, -0.3);
      if (!br) { bassNote(t + 0.25, midi(root), 0.22, 0.25); if (b % 2) bassNote(t, midi(root + 12), 0.2, 0.11); }
      for (let sx = 0; sx < 4; sx++) {
        const tt = t + sx * 0.125;
        if (inBreak(tt)) continue;
        const pat = [0, 1, 2, 3, 2, 1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 3];
        const k = pat[(b * 4 + sx) % 16], n = k === 3 ? chord[0] + 12 : chord[k];
        pluck(tt, midi(n), 0.05, (sx % 2 ? 0.45 : -0.45), 1600 + 2400 * clamp((tt - G0) / 22));
      }
    }
  }
  riser(T.s14 + 0.3, T.s14e - 0.2, 0.26, 300, 6000);
  for (let t = T.s22 - 1.0; t < T.s22; t += (t < T.s22 - 0.5 ? 0.125 : 0.0625)) snare(t, 0.08 + (t - (T.s22 - 1.0)) * 0.2);
  riser(T.s22 - 1.1, T.s22, 0.3);
  pad(T.s23, [41, 53, 57, 60, 64, 65], 4.0, 0.045, 2200, music);
  bassNote(T.s23, midi(29), 3.0, 0.3);
  [65, 69, 72, 76, 79, 81, 84].forEach((n, i) => bell(T.s23 + 0.25 + i * 0.12, midi(n), 0.07, 2.4, (i - 3) * 0.2, 0.6));

  /* =================== SFX, locked to the picture =================== */
  // S1 — traveller appears, question marks float up
  riser(T.s1, T.s1 + 0.6, 0.16, 800, 9000);
  whoosh(T.s1 + 0.3, 0.6, 0.22, 250, 5000);
  for (let i = 0; i < 9; i++) pop(T.s1 + 1.9 + i * 0.13, 460 + i * 70, 0.17, -0.6 + i * 0.15);
  bell(T.s1 + 1.2, midi(72), 0.07, 1.6, 0, 0.6);
  // S2 — map sweep + pins
  whoosh(T.s2, 0.7, 0.4, 200, 4000);
  for (let i = 0; i < 6; i++) { pop(T.s2 + 1.0 + i * 0.3, 520 + i * 80, 0.26, -0.6 + i * 0.24); blip(T.s2 + 1.05 + i * 0.3, 1600 + i * 120, 0.05, 0.06); }
  // S3 — research chaos piling up
  whoosh(T.s3, 0.6, 0.35, 200, 4500);
  for (let i = 0; i < 8; i++) { whoosh(T.s3 + 0.4 + i * 0.28, 0.3, 0.16, 500, 4200, (i % 2 ? 0.6 : -0.6), 0); pop(T.s3 + 0.52 + i * 0.28, 820 + i * 45, 0.12, (i % 2 ? 0.4 : -0.4)); }
  for (let i = 0; i < 26; i++) blip(T.s3 + 0.6 + i * 0.1, 2100 + i * 22, 0.045, 0.03, 'square');
  S3_NOTIF.forEach((n, i) => { const t = T.s3 + 2.1 + i * 0.5; ping(t, n[1] === '#35A8FF' ? 1568 : 1175, 0.13, (n[5] - 960) / 1100); if (n[1] === '#DC2626') buzz(t, 0.09, 0.11, 165); });
  // S4 — budget blows past the limit, then deflates
  whoosh(T.s4, 0.4, 0.35);
  riser(T.s4 + 0.2, T.s4 + 1.5, 0.22, 300, 4000);
  buzz(T.s4 + 1.5, 0.14, 0.13, 220); buzz(T.s4 + 1.66, 0.14, 0.13, 220);
  impact(T.s4 + 1.8, 0.95, 170, 34, 0.9); crash(T.s4 + 1.8, 0.14, 0.9);
  glitch(T.s4 + 1.78, T.s4 + 1.9, 0.26);
  powerDown(T.s4 + 2.0, 0.26);
  // S5 — relief
  bell(T.s5 + 0.15, midi(77), 0.1, 2.6, 0, 0.8); bell(T.s5 + 0.22, midi(72), 0.07, 2.6, -0.3, 0.8);
  revSwell(T.s5 + 0.5, T.s6, 0.3);
  // S6 — logo
  bigImpact(T.s6, 1.0); shimmer(T.s6 + 0.5, 1.5, 0.05, 88); whoosh(T.s6 + 0.9, 0.6, 0.22, 600, 8000);
  // S11 — feature 01 title
  whoosh(T.s11 - 0.3, 0.5, 0.42, 200, 7000); impact(T.s11, 0.5, 150, 45, 0.6);
  for (let k = 0; k < 22; k++) key(T.s11 + 0.9 + k * 0.028, 0.055);
  // S12 — form: typing, picking, slider  (beats scale with the scene)
  const k12 = (T.s12e - T.s12) / 4.2;
  whoosh(T.s12 - 0.15, 0.5, 0.33, 150, 3000);
  for (let n = 0; n < 17; n++) key(T.s12 + (0.5 + n / 30) * k12);
  for (let n = 0; n < 13; n++) key(T.s12 + (1.12 + n / 40) * k12);
  pop(T.s12 + 1.52 * k12, 900, 0.2); pop(T.s12 + 1.64 * k12, 1000, 0.2); pop(T.s12 + 1.78 * k12, 1300, 0.15);
  click(T.s12 + 2.37 * k12); chime(T.s12 + 2.39 * k12, [77, 81], 0.1);
  click(T.s12 + 2.92 * k12, 0.2);
  for (let i = 0; i < 14; i++) tick(T.s12 + (2.97 + i * 0.038) * k12, 0.055, 5000 + i * 180);
  click(T.s12 + 3.86 * k12);
  whoosh(T.s12e - 0.45, 0.45, 0.45, 300, 6000, 0.8, -0.8);
  // S13 — interests + pace
  const k13 = (T.s13e - T.s13) / 3.6;
  [[0.55, 72], [0.9, 76], [1.25, 79]].forEach(([o, n]) => { click(T.s13 + o * k13); chime(T.s13 + (o + 0.02) * k13, [n, n + 7], 0.1); });
  click(T.s13 + 2.05 * k13); chime(T.s13 + 2.07 * k13, [84], 0.1);
  click(T.s13 + 2.85 * k13, 0.33);
  riser(T.s13 + 2.9 * k13, T.s13e, 0.28, 300, 8000);
  whoosh(T.s13 + 3.0 * k13, 0.6, 0.35, 100, 3000);
  // S14 — engine
  impact(T.s14, 0.48, 120, 40, 0.6);
  const k14 = (T.s14e - T.s14) / 2.1;
  for (let i = 0; i < 6; i++) {
    const t0 = T.s14 + (0.2 + i * 0.25) * k14;
    for (let n = 0; n < 7; n++) blip(t0 + n * 0.032, 2000 + R() * 2000, 0.028, 0.015, 'square', (R() - 0.5));
    blip(t0 + 0.42 * k14, midi(84 + (i % 3) * 2), 0.065, 0.12);
  }
  chime(T.s14e - 0.35, [72, 76, 79, 84], 0.14, 0.055);
  whoosh(T.s14e - 0.3, 0.4, 0.42, 300, 8000);
  // S15 — result itinerary: reveal, drag, smart fix
  const k15 = (T.s15e - T.s15) / 5.1;
  whoosh(T.s15, 0.5, 0.36, 200, 4000);
  for (let i = 0; i < 4; i++) whoosh(T.s15 + (0.62 + i * 0.12) * k15, 0.3, 0.13, 600, 5000, 0.8, 0);
  for (let i = 0; i < 20; i++) tick(T.s15 + (0.8 + i * 0.05) * k15, 0.055, 6000);
  chime(T.s15 + 1.85 * k15, [79, 84], 0.12);
  click(T.s15 + 2.45 * k15, 0.3);
  whoosh(T.s15 + 2.55 * k15, 0.5, 0.12, 300, 1500, -0.2, 0.2);
  click(T.s15 + 3.05 * k15, 0.2, 1200); blip(T.s15 + 3.08 * k15, 1760, 0.08); blip(T.s15 + 3.16 * k15, 2093, 0.08);
  ping(T.s15 + 3.55 * k15, 988, 0.13); buzz(T.s15 + 3.55 * k15, 0.04, 0.09, 330);
  click(T.s15 + 4.3 * k15, 0.3); chime(T.s15 + 4.33 * k15, [72, 76, 79], 0.12, 0.05);
  pop(T.s15 + 4.6 * k15, 1400, 0.15);
  whoosh(T.s15e - 0.4, 0.45, 0.45, 200, 7000);
  // S16 — route map
  const k16 = (T.s16e - T.s16) / 3.1;
  whoosh(T.s16, 0.5, 0.33, 150, 3000);
  riser(T.s16 + 0.25 * k16, T.s16 + 2.9 * k16, 0.075, 400, 3000);
  [0.25, 0.62, 0.92, 1.3, 1.85].forEach((o, i) => pop(T.s16 + o * k16, 600 + i * 120, 0.22, -0.6 + i * 0.3));
  [1.5, 2.0, 2.5].forEach(o => impact(T.s16 + o * k16, 0.5, 180, 50, 0.45));
  whoosh(T.s16e - 0.45, 0.45, 0.45, 300, 7000, 0.8, -0.8);
  // S17 — feature 02 title
  bigImpact(T.s17, 0.75);
  for (let k = 0; k < 26; k++) key(T.s17 + 0.15 + k * 0.016, 0.05);
  whoosh(T.s17 + 0.3, 0.6, 0.24, 200, 5000);
  whoosh(T.s17e - 0.45, 0.45, 0.45, 300, 6000, 0.8, -0.8);
  // S18 — verified guides
  const k18 = (T.s18e - T.s18) / 4.1;
  whoosh(T.s18, 0.5, 0.3);
  for (let n = 0; n < 16; n++) key(T.s18 + (0.3 + n / 40) * k18);
  click(T.s18 + 0.78 * k18, 0.3);
  for (let i = 0; i < 6; i++) { whoosh(T.s18 + (0.88 + i * 0.09) * k18, 0.26, 0.12, 700, 6000, -0.6 + i * 0.24, 0); pop(T.s18 + (0.95 + i * 0.09) * k18, 700 + i * 60, 0.1); }
  chime(T.s18 + 1.7 * k18, [76, 79, 84], 0.11, 0.055);
  for (let i = 0; i < 6; i++) blip(T.s18 + (1.75 + i * 0.08) * k18, 2637, 0.04, 0.045);
  click(T.s18 + 3.6 * k18, 0.3);
  whoosh(T.s18e - 0.4, 0.5, 0.35, 150, 3000);
  // S19 — profile, booking, lands in the itinerary
  const k19 = (T.s19e - T.s19) / 4.1;
  whoosh(T.s19, 0.5, 0.3, 200, 4000);
  click(T.s19 + 0.95 * k19); chime(T.s19 + 0.97 * k19, [79], 0.1);
  click(T.s19 + 1.75 * k19, 0.35);
  for (let i = 0; i < 9; i++) tick(T.s19 + (1.8 + i * 0.06) * k19, 0.05, 6000);
  chime(T.s19 + 2.3 * k19, [72, 76, 79, 84, 88], 0.17, 0.065);
  impact(T.s19 + 2.3 * k19, 0.34, 200, 60, 0.45); shimmer(T.s19 + 2.35 * k19, 0.9, 0.035, 88);
  whoosh(T.s19 + 2.75 * k19, 0.45, 0.22, 200, 3000);
  whoosh(T.s19 + 3.05 * k19, 0.55, 0.3, 400, 7000, 0.7, -0.4);
  pop(T.s19 + 3.5 * k19, 1200, 0.25); bell(T.s19 + 3.52 * k19, midi(88), 0.1, 0.9);
  whoosh(T.s19e - 0.4, 0.45, 0.45, 300, 6000, 0.8, -0.8);
  // S21 — dashboard checklist
  const k21 = (T.s21e - T.s21) / 2.1;
  whoosh(T.s21, 0.5, 0.3);
  for (let i = 0; i < 5; i++) { click(T.s21 + (0.45 + i * 0.22) * k21, 0.18, 1800); blip(T.s21 + (0.46 + i * 0.22) * k21, midi(79 + i * 2), 0.07, 0.11); }
  // S22 — destination montage
  bigImpact(T.s22, 0.9);
  for (let i = 1; i < 4; i++) whoosh(T.s22 + i * S22_CUT - 0.14, 0.2, 0.26, 500, 7000, (i % 2 ? -0.7 : 0.7), 0);
  impact(T.s22 + 0.8, 0.8, 170, 40, 0.65); impact(T.s22 + 1.6, 0.8, 170, 40, 0.65);
  crash(T.s22 + 0.8, 0.12, 0.85); crash(T.s22 + 1.6, 0.12, 0.85);
  riser(T.s22e - 0.6, T.s22e, 0.28, 400, 9000);
  // S23 — end card
  bigImpact(T.s23, 1.0); shimmer(T.s23 + 0.1, 1.6, 0.05, 88);
  for (let i = 0; i < 4; i++) whoosh(T.s23 + 0.5 + i * 0.08, 0.35, 0.1, 400, 4000);
  [0.95, 1.07, 1.19].forEach((o, i) => pop(T.s23 + o, 800 + i * 160, 0.2, -0.4 + i * 0.4));
  [1.45, 1.57].forEach((o, i) => pop(T.s23 + o, 600 + i * 200, 0.25));
  bell(T.s23 + 2.1, midi(84), 0.06, 2.6, 0, 0.9);
  // soft tick as each caption appears
  CAPS.forEach(c => blip(c[0], 2793, 0.032, 0.05, 'sine', 0));

  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  let peak = 0; for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(Rr[i]));
  const k = peak > 0 ? 0.89 / peak : 1; // normalise to about -1 dBFS
  for (let i = 0; i < L.length; i++) { L[i] *= k; Rr[i] *= k; }
  return { sampleRate: SR, left: L, right: Rr, peak };
};
