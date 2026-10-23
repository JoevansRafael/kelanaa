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
  master.gain.setValueAtTime(0.9, 54.6); master.gain.linearRampToValueAtTime(0.0, 56.0);

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

  /* ---- ACT 1: tension (0 – 10.0) ---- */
  // drone D
  [38, 50].forEach((n, i) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = i ? 6 : -4;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(220, 0); lp.frequency.linearRampToValueAtTime(900, 9.9);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, 0); g.gain.linearRampToValueAtTime(0.09, 1.0); g.gain.linearRampToValueAtTime(0.13, 9.8); g.gain.linearRampToValueAtTime(0.0001, 10.02);
    o.connect(lp); lp.connect(g); out(g, music, i ? 0.3 : -0.3, 0.2); o.start(0); o.stop(10.1);
  });
  // dissonant tension pad (D + Eb + A)
  pad(5.5, [62, 63, 69], 4.5, 0.03, 1400, music);
  // ticking clock + heartbeat kicks
  for (let t = 0.5; t < 10; t += 0.25) hat(t, 0.03 + 0.05 * (t / 10), false, (Math.floor(t * 4) % 2 ? 0.3 : -0.3));
  for (let t = 3.0; t < 8.5; t += BEAT) { kick(t, 0.45, false); if (t > 5.4) kick(t + 0.18, 0.28, false); }
  for (let t = 7.5; t < 8.5; t += 0.125) snare(t, 0.06 + (t - 7.5) * 0.12);
  // pulse bass 8ths in D
  for (let t = 3.0; t < 8.5; t += 0.25) bassNote(t, midi(38), 0.2, 0.12);

  /* ---- 10.8 – 14.5: calm → logo ---- */
  pad(10.8, [53, 57, 60, 64, 67], 3.9, 0.035, 1600, music);
  pad(12.0, [41, 53, 57, 60, 65], 2.6, 0.04, 2400, music);
  for (let i = 0; i < 20; i++) { const t = 12.0 + i * 0.125; const notes = [65, 69, 72, 76, 77, 76, 72, 69]; pluck(t, midi(notes[i % 8]), 0.05 + i * 0.002, (i % 2 ? 0.4 : -0.4), 2400); }
  bassNote(12.0, midi(29), 2.4, 0.3);

  /* ---- 14.5 – 51: main groove (F – C – Dm – Bb) ---- */
  const PROG = [[41, [65, 69, 72]], [36, [64, 67, 72]], [38, [62, 65, 69]], [34, [62, 65, 70]]];
  const G0 = 14.5, G1 = 51.0;
  const breaks = [[24.0, 25.9], [33.5, 34.0], [47.0, 48.0]];
  const inBreak = t => breaks.some(([a, b]) => t >= a && t < b);
  for (let bar = 0; G0 + bar * 2 < G1; bar++) {
    const t0 = G0 + bar * 2, [root, chord] = PROG[bar % 4];
    pad(t0, chord.map(n => n - 12).concat([chord[0]]), 2.0, 0.026, 2000);
    for (let b = 0; b < 4; b++) {
      const t = t0 + b * BEAT;
      if (t >= G1) break;
      const br = inBreak(t);
      if (!br) kick(t, 0.8);
      if (!br && (b === 1 || b === 3)) clap(t, 0.28);
      if (!br) hat(t + 0.25, 0.08, b === 3, 0.25);
      for (let s = 0; s < 4; s++) if (!br || t >= 24.0 && t < 25.9) hat(t + s * 0.125, 0.025, false, -0.3);
      // bass offbeat 8ths
      if (!br || (t >= 24 && t < 25.9)) { bassNote(t + 0.25, midi(root), 0.22, 0.26); if (b % 2) bassNote(t, midi(root + 12), 0.2, 0.12); }
      // arp 16ths
      for (let s = 0; s < 4; s++) {
        const tt = t + s * 0.125, idx = (b * 4 + s);
        const pat = [0, 1, 2, 3, 2, 1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 3];
        const k = pat[idx % 16], n = k === 3 ? chord[0] + 12 : chord[k];
        const brightness = 1600 + 2600 * clamp((tt - 14.5) / 20);
        if (tt >= 47 && tt < 48) continue;
        pluck(tt, midi(n), 0.055, (s % 2 ? 0.45 : -0.45), brightness);
      }
    }
  }
  // processing section: filtered build
  riser(24.2, 25.9, 0.28, 300, 6000);
  // pre-drop build before montage
  for (let t = 47.0; t < 48.0; t += (t < 47.5 ? 0.125 : 0.0625)) snare(t, 0.08 + (t - 47) * 0.22);
  riser(46.9, 48.0, 0.32);
  // outro chord
  pad(51.0, [41, 53, 57, 60, 64, 65], 5.0, 0.045, 2200, music);
  bassNote(51.0, midi(29), 3.0, 0.3);
  [65, 69, 72, 76, 79, 81, 84].forEach((n, i) => bell(51.25 + i * 0.12, midi(n), 0.07, 2.4, (i - 3) * 0.2, 0.6));

  /* =================== SFX cues (synced to the picture) =================== */
  // S1
  riser(0.0, 0.4, 0.18, 800, 9000); whoosh(0.25, 0.4, 0.25);
  // S2
  whoosh(1.32, 0.32, 0.5, 300, 6000);
  for (let i = 0; i < 6; i++) pop(1.5 + 0.35 + i * 0.14, 520 + i * 90, 0.3, -0.6 + i * 0.24);
  // S3
  whoosh(2.86, 0.3, 0.55, 200, 5000, 0.8, -0.8);
  for (let k = 0; k < 34; k++) key(3.0 + 0.12 + k / 44);
  click(3.92, 0.25); blip(3.56, 1800, 0.08);
  for (let i = 0; i < 12; i++) { const t = 3.0 + 1.0 + Math.pow(i / 12, 0.8) * 1.1; whoosh(t - 0.05, 0.22, 0.18, 500, 4000, (i % 2 ? 0.6 : -0.6), 0); pop(t + 0.05, 900 + i * 40, 0.12, (i % 2 ? 0.4 : -0.4)); }
  { let last = 1; for (let f = 0; f < 2.6 * 60; f++) { const lt = f / 60; const cnt = Math.max(1, Math.round(E.i3(prog(lt, 1.0, 2.3)) * 39) + 1); if (cnt !== last) { blip(3.0 + lt, 2200 + cnt * 20, 0.07, 0.03, 'square'); last = cnt; } } }
  glitch(5.46, 5.58, 0.25);
  // S4
  impact(5.5, 0.4, 200, 60, 0.4);
  [5.88, 6.08, 6.3].forEach(t => buzz(t, 0.1, 0.12, 180));
  // S5
  S5_N.forEach((n, i) => { const t = 6.5 + 0.04 + i * 0.1; if (n[1] === '#DC2626') buzz(t, 0.08, 0.1, 160); ping(t, n[1] === '#35A8FF' ? 1568 : 1175, 0.12, (n[5] - 960) / 1100); });
  // S6
  whoosh(7.38, 0.25, 0.4); riser(7.6, 8.25, 0.2, 300, 4000);
  buzz(8.25, 0.14, 0.12, 220); buzz(8.4, 0.14, 0.12, 220);
  // S7 slams
  [8.5, 9.0, 9.5].forEach((t, i) => { impact(t, 1.0, 170, 34, 0.7); crash(t, 0.12, 0.6); });
  // S8
  glitch(10.0, 10.14, 0.3); glitch(10.3, 10.38, 0.3); powerDown(10.5, 0.3);
  // S9
  bell(10.9, midi(77), 0.1, 2.5, 0, 0.8); bell(10.95, midi(72), 0.07, 2.5, -0.3, 0.8);
  revSwell(11.0, 12.0, 0.32);
  // S10 logo
  bigImpact(12.0, 1.0); shimmer(12.5, 1.0, 0.05, 88); whoosh(12.42, 0.45, 0.25, 600, 8000);
  // S11
  whoosh(14.3, 0.3, 0.5, 200, 7000); impact(14.5, 0.55, 150, 45, 0.6);
  for (let k = 0; k < 20; k++) key(15.2 + k * 0.025, 0.06);
  whoosh(16.25, 0.25, 0.55, 300, 6000, 0.8, -0.8);
  // S12
  whoosh(16.38, 0.4, 0.35, 150, 3000);
  for (let k = 0; k < 16; k++) key(16.9 + k / 30);
  for (let k = 0; k < 13; k++) key(17.52 + k / 40);
  pop(17.9, 900, 0.2); pop(18.02, 1000, 0.2); pop(18.15, 1300, 0.15);
  click(18.75); chime(18.77, [77, 81], 0.1);
  click(19.3, 0.2);
  for (let i = 0; i < 12; i++) tick(19.35 + i * 0.042, 0.06, 5000 + i * 200);
  click(20.25); whoosh(20.36, 0.26, 0.55, 300, 6000, 0.8, -0.8);
  // S13
  [[21.05, 72], [21.4, 76], [21.75, 79]].forEach(([t, n]) => { click(t); chime(t + 0.02, [n, n + 7], 0.1); });
  click(22.55); chime(22.57, [84], 0.1);
  click(23.35, 0.35); riser(23.35, 24.0, 0.3, 300, 8000); whoosh(23.5, 0.5, 0.4, 100, 3000);
  // S14
  impact(24.0, 0.5, 120, 40, 0.6);
  for (let i = 0; i < 6; i++) { const t0 = 24.2 + i * 0.25; for (let k = 0; k < 8; k++) blip(t0 + k * 0.03, 2000 + R() * 2000, 0.03, 0.015, 'square', (R() - 0.5)); blip(t0 + 0.42, midi(84 + (i % 3) * 2), 0.07, 0.12); }
  for (let i = 0; i < 6; i++) whoosh(24.3 + i * 0.08, 0.2, 0.08, 800, 5000);
  chime(25.8, [72, 76, 79, 84], 0.14, 0.05);
  whoosh(25.85, 0.28, 0.45, 300, 8000);
  // S15
  whoosh(25.98, 0.32, 0.4, 200, 4000, 0, 0);
  for (let i = 0; i < 4; i++) whoosh(26.62 + i * 0.12, 0.25, 0.14, 600, 5000, 0.8, 0);
  for (let i = 0; i < 18; i++) tick(26.8 + i * 0.055, 0.06, 6000);
  chime(27.85, [79, 84], 0.12);
  click(28.45, 0.3); whoosh(28.55, 0.45, 0.12, 300, 1500, -0.2, 0.2); impact(29.05, 0.25, 220, 80, 0.15); click(29.05, 0.2, 1200);
  blip(29.08, 1760, 0.08); blip(29.15, 2093, 0.08);
  ping(29.55, 988, 0.13); buzz(29.55, 0.04, 0.08, 330);
  click(30.3, 0.3); chime(30.33, [72, 76, 79], 0.12, 0.05);
  whoosh(30.45, 0.3, 0.2, 400, 5000, 0, 0.9); pop(30.6, 1400, 0.15);
  whoosh(30.84, 0.28, 0.5, 200, 7000);
  // S16
  whoosh(31.0, 0.35, 0.35, 150, 3000);
  riser(31.25, 32.9, 0.08, 400, 3000);
  [31.25, 31.62, 31.92, 32.3, 32.85].forEach((t, i) => pop(t, 600 + i * 120, 0.22, -0.6 + i * 0.3));
  [32.5, 33.0, 33.5].forEach(t => impact(t, 0.55, 180, 50, 0.4));
  whoosh(33.82, 0.3, 0.5, 300, 7000, 0.8, -0.8);
  // S17
  bigImpact(34.0, 0.75);
  for (let k = 0; k < 30; k++) key(34.15 + k * 0.014, 0.05);
  whoosh(34.25, 0.45, 0.25, 200, 5000);
  whoosh(35.85, 0.26, 0.55, 300, 6000, 0.8, -0.8);
  // S18
  whoosh(35.98, 0.3, 0.3);
  for (let k = 0; k < 16; k++) key(36.3 + k / 40);
  click(36.78, 0.3);
  for (let i = 0; i < 6; i++) { whoosh(36.88 + i * 0.09, 0.18, 0.12, 700, 6000, -0.6 + i * 0.24, 0); pop(36.95 + i * 0.09, 700 + i * 60, 0.1); }
  chime(37.7, [76, 79, 84], 0.11, 0.05);
  for (let i = 0; i < 6; i++) blip(37.75 + i * 0.08, 2637, 0.04, 0.04);
  click(39.6, 0.3); whoosh(39.72, 0.4, 0.35, 150, 3000);
  // S19
  whoosh(39.98, 0.35, 0.3, 200, 4000);
  click(40.95); chime(40.97, [79], 0.1);
  click(41.75, 0.35);
  for (let i = 0; i < 8; i++) tick(41.8 + i * 0.06, 0.05, 6000);
  chime(42.3, [72, 76, 79, 84, 88], 0.17, 0.06); impact(42.3, 0.35, 200, 60, 0.4); shimmer(42.35, 0.8, 0.035, 88);
  whoosh(42.72, 0.35, 0.22, 200, 3000);
  whoosh(43.02, 0.45, 0.3, 400, 7000, 0.7, -0.4); pop(43.5, 1200, 0.25); bell(43.52, midi(88), 0.1, 0.8);
  whoosh(43.86, 0.26, 0.55, 300, 6000, 0.8, -0.8);
  // S20
  whoosh(43.98, 0.3, 0.3);
  [44.35, 44.6, 44.85, 45.1].forEach((t, i) => pop(t, 700 + i * 140, 0.25, -0.4 + i * 0.25));
  pop(45.2, 1200, 0.25); chime(45.22, [84, 88, 91], 0.1, 0.04);
  whoosh(45.86, 0.26, 0.55, 300, 6000, 0.8, -0.8);
  // S21
  whoosh(45.98, 0.3, 0.3);
  for (let i = 0; i < 5; i++) { click(46.45 + i * 0.22, 0.18, 1800); blip(46.46 + i * 0.22, midi(79 + i * 2), 0.07, 0.1); }
  // S22 montage
  bigImpact(48.0, 0.9);
  for (let i = 1; i < 8; i++) { whoosh(48.0 + i * 0.375 - 0.1, 0.14, 0.22, 500, 7000, (i % 2 ? -0.7 : 0.7), 0); }
  impact(49.0, 0.8, 170, 40, 0.6); impact(50.0, 0.8, 170, 40, 0.6); crash(49.0, 0.12, 0.8); crash(50.0, 0.12, 0.8);
  riser(50.4, 51.0, 0.3, 400, 9000);
  // S23 end card
  bigImpact(51.0, 1.0); shimmer(51.1, 1.4, 0.05, 88);
  for (let i = 0; i < 4; i++) whoosh(51.6 + i * 0.07, 0.3, 0.1, 400, 4000);
  [52.2, 52.32, 52.44].forEach((t, i) => pop(t, 800 + i * 160, 0.2, -0.4 + i * 0.4));
  [52.8, 52.92].forEach((t, i) => { pop(t, 600 + i * 200, 0.25); });
  bell(53.4, midi(84), 0.06, 2.5, 0, 0.9);
  // caption entrances: soft UI tick
  CAPS.forEach(c => blip(c[0], 2793, 0.035, 0.05, 'sine', 0));

  const buf = await ctx.startRendering();
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  let peak = 0; for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(Rr[i]));
  const k = peak > 0 ? 0.89 / peak : 1; // normalise to about -1 dBFS
  for (let i = 0; i < L.length; i++) { L[i] *= k; Rr[i] *= k; }
  return { sampleRate: SR, left: L, right: Rr, peak };
};
