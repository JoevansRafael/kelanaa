// Encode out/frames/*.jpg (H.264 via WebCodecs) + synthesized audio (Opus) -> out/kelana_promo.mp4
const fs = require('fs');
const path = require('path');
const { ROOT, launch, openStage } = require('./lib/browser');
const { writeMP4 } = require('./lib/mp4');

function wav(left, right, sr) {
  const n = left.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(left[i] * 32767))), 44 + i * 4); b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(right[i] * 32767))), 46 + i * 4); }
  return b;
}

(async () => {
  const browser = await launch();
  const outDir = path.join(ROOT, 'out');

  /* ---------- AUDIO ---------- */
  const st = await openStage(browser);
  await st.page.addScriptTag({ path: path.join(ROOT, 'web', 'js', 'audio.js') });
  console.log('rendering audio…');
  const t0 = Date.now();
  const audio = await st.page.evaluate(async () => {
    const a = await window.renderAudio();
    const SR = a.sampleRate, N = a.left.length;
    // 16-bit interleaved PCM for the WAV stem (base64)
    const pcm = new Int16Array(N * 2);
    for (let i = 0; i < N; i++) { pcm[2 * i] = Math.max(-32767, Math.min(32767, Math.round(a.left[i] * 32767))); pcm[2 * i + 1] = Math.max(-32767, Math.min(32767, Math.round(a.right[i] * 32767))); }
    const toB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
    // Opus encode
    const chunks = []; let desc = null;
    const enc = new AudioEncoder({
      output: (c, m) => { if (m && m.decoderConfig && m.decoderConfig.description) desc = new Uint8Array(m.decoderConfig.description instanceof ArrayBuffer ? m.decoderConfig.description : m.decoderConfig.description.buffer); const b = new Uint8Array(c.byteLength); c.copyTo(b); chunks.push({ d: toB64(b), dur: c.duration, ts: c.timestamp }); },
      error: e => { throw e; },
    });
    enc.configure({ codec: 'opus', sampleRate: SR, numberOfChannels: 2, bitrate: 256000 });
    const F = 4800;
    for (let i = 0; i < N; i += F) {
      const n = Math.min(F, N - i), data = new Float32Array(n * 2);
      data.set(a.left.subarray(i, i + n), 0); data.set(a.right.subarray(i, i + n), n);
      const ad = new AudioData({ format: 'f32-planar', sampleRate: SR, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round(i / SR * 1e6), data });
      enc.encode(ad); ad.close();
    }
    await enc.flush();
    return { SR, chunks, desc: desc ? Array.from(desc) : null, pcm: toB64(new Uint8Array(pcm.buffer)), peak: a.peak };
  });
  console.log(`audio rendered in ${((Date.now() - t0) / 1000).toFixed(1)}s, opus packets: ${audio.chunks.length}, raw peak ${audio.peak.toFixed(3)}`);
  const pcm = Buffer.from(audio.pcm, 'base64');
  const hdr = wav(new Float32Array(0), new Float32Array(0), audio.SR);
  hdr.writeUInt32LE(36 + pcm.length, 4); hdr.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(path.join(outDir, 'kelana_audio.wav'), Buffer.concat([hdr, pcm]));
  let preSkip = 312;
  if (audio.desc && audio.desc.length >= 12) preSkip = audio.desc[10] | (audio.desc[11] << 8);
  const aSamples = audio.chunks.map(c => ({ data: Buffer.from(c.d, 'base64'), dur: Math.round(c.dur * audio.SR / 1e6) || 960 }));
  await st.page.close();

  /* ---------- VIDEO ---------- */
  const frameDir = path.join(outDir, 'frames');
  const files = fs.readdirSync(frameDir).filter(f => f.endsWith('.jpg')).sort();
  console.log(`encoding ${files.length} frames…`);
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('[page error]', e.message));
  await page.goto('file://' + path.join(ROOT, 'web', 'blank.html'));
  await page.evaluate((VB) => {
    window.V = { chunks: [], desc: null, err: null };
    window.enc = new VideoEncoder({
      output: (c, m) => { if (m && m.decoderConfig && m.decoderConfig.description) { const d = m.decoderConfig.description; V.desc = Array.from(new Uint8Array(d instanceof ArrayBuffer ? d : d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength))); } const b = new Uint8Array(c.byteLength); c.copyTo(b); V.chunks.push({ key: c.type === 'key', ts: c.timestamp, b }); },
      error: e => { V.err = String(e); },
    });
    enc.configure({ codec: 'avc1.640033', width: 1920, height: 1080, bitrate: VB, bitrateMode: 'variable', framerate: 60, latencyMode: 'quality', avc: { format: 'avc' } });
    window.encodeFrame = async (b64, i) => {
      const blob = await (await fetch('data:image/jpeg;base64,' + b64)).blob();
      const bmp = await createImageBitmap(blob);
      const vf = new VideoFrame(bmp, { timestamp: Math.round(i * 1e6 / 60), duration: Math.round(1e6 / 60) });
      enc.encode(vf, { keyFrame: i % 120 === 0 }); vf.close(); bmp.close();
      while (enc.encodeQueueSize > 6) await new Promise(r => setTimeout(r, 2));
      if (V.err) throw new Error(V.err);
    };
    window.drain = () => {
      const toB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
      const out = V.chunks.map(c => ({ key: c.key, ts: c.ts, d: toB64(c.b) })); V.chunks = []; return out;
    };
  }, +(process.env.VBITRATE || 30e6));
  const vSamples = [];
  const pull = async () => { for (const c of await page.evaluate(() => drain())) vSamples.push({ key: c.key, ts: c.ts, data: Buffer.from(c.d, 'base64') }); };
  const tv = Date.now();
  for (let i = 0; i < files.length; i++) {
    const b64 = fs.readFileSync(path.join(frameDir, files[i])).toString('base64');
    await page.evaluate(([b, n]) => encodeFrame(b, n), [b64, i]);
    if (i % 60 === 59) await pull();
    if (i % 600 === 599) console.log(`  ${i + 1}/${files.length} · ${((Date.now() - tv) / 1000).toFixed(0)}s`);
  }
  await page.evaluate(() => enc.flush());
  await pull();
  const desc = await page.evaluate(() => V.desc);
  if (!desc) throw new Error('no avcC description from encoder');
  for (let i = 1; i < vSamples.length; i++) if (vSamples[i].ts <= vSamples[i - 1].ts) throw new Error('non-monotonic timestamps (B-frames?)');
  const avcC = Buffer.from(desc);
  console.log(`video encoded: ${vSamples.length} samples, keyframes ${vSamples.filter(s => s.key).length}, profile_idc ${avcC[1]}, level ${avcC[3]}`);

  const mp4 = writeMP4({ w: 1920, h: 1080, fps: 60, avcC, samples: vSamples }, { sampleRate: audio.SR, channels: 2, preSkip, samples: aSamples });
  const outFile = path.join(outDir, 'kelana_promo.mp4');
  fs.writeFileSync(outFile, mp4);
  console.log(`wrote ${outFile} (${(mp4.length / 1048576).toFixed(1)} MB), preSkip ${preSkip}`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
