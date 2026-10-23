// Minimal ISO-BMFF (MP4) muxer: one H.264 video track + one Opus audio track, moov at front (fast start).
function u8(n) { return Buffer.from([n & 255]); }
function u16(n) { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; }
function i16(n) { const b = Buffer.alloc(2); b.writeInt16BE(n); return b; }
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; }
function str(s) { return Buffer.from(s, 'ascii'); }
function box(type, ...parts) { const body = Buffer.concat(parts.flat()); return Buffer.concat([u32(body.length + 8), str(type), body]); }
function full(type, v, flags, ...parts) { return box(type, u8(v), u8(flags >> 16), u8(flags >> 8), u8(flags), ...parts); }
const MATRIX = Buffer.concat([u32(0x00010000), u32(0), u32(0), u32(0), u32(0x00010000), u32(0), u32(0), u32(0), u32(0x40000000)]);

function stts(durs) {
  const runs = [];
  for (const d of durs) { const l = runs[runs.length - 1]; if (l && l[1] === d) l[0]++; else runs.push([1, d]); }
  return full('stts', 0, 0, u32(runs.length), ...runs.map(([c, d]) => Buffer.concat([u32(c), u32(d)])));
}
function stbl(entry, samples, offsets, sync) {
  const parts = [full('stsd', 0, 0, u32(1), entry), stts(samples.map(s => s.dur))];
  if (sync) parts.push(full('stss', 0, 0, u32(sync.length), ...sync.map(i => u32(i + 1))));
  parts.push(full('stsc', 0, 0, u32(1), u32(1), u32(1), u32(1)));
  parts.push(full('stsz', 0, 0, u32(0), u32(samples.length), ...samples.map(s => u32(s.data.length))));
  parts.push(full('stco', 0, 0, u32(offsets.length), ...offsets.map(o => u32(o))));
  return box('stbl', ...parts);
}
function trak(id, kind, timescale, duration, movieDur, entry, samples, offsets, sync, w, h) {
  const tkhd = full('tkhd', 0, 3, u32(0), u32(0), u32(id), u32(0), u32(movieDur), u32(0), u32(0), u16(0), u16(0), u16(kind === 'soun' ? 0x0100 : 0), u16(0), MATRIX, u32((w || 0) << 16), u32((h || 0) << 16));
  const mdhd = full('mdhd', 0, 0, u32(0), u32(0), u32(timescale), u32(duration), u16(0x55c4), u16(0));
  const hdlr = full('hdlr', 0, 0, u32(0), str(kind === 'vide' ? 'vide' : 'soun'), u32(0), u32(0), u32(0), str(kind === 'vide' ? 'KelanaVideo\0' : 'KelanaAudio\0'));
  const mh = kind === 'vide' ? full('vmhd', 0, 1, u16(0), u16(0), u16(0), u16(0)) : full('smhd', 0, 0, u16(0), u16(0));
  const dinf = box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1)));
  return box('trak', tkhd, box('mdia', mdhd, hdlr, box('minf', mh, dinf, stbl(entry, samples, offsets, sync))));
}
function avc1Entry(w, h, avcC) {
  return box('avc1', Buffer.alloc(6), u16(1), u16(0), u16(0), u32(0), u32(0), u32(0), u16(w), u16(h), u32(0x00480000), u32(0x00480000), u32(0), u16(1),
    Buffer.alloc(32), u16(0x0018), i16(-1), box('avcC', avcC), box('btrt', u32(0), u32(0), u32(0)));
}
function opusEntry(channels, sampleRate, preSkip) {
  const dOps = box('dOps', u8(0), u8(channels), u16(preSkip), u32(sampleRate), i16(0), u8(0));
  return box('Opus', Buffer.alloc(6), u16(1), u32(0), u32(0), u16(channels), u16(16), u16(0), u16(0), u32(sampleRate * 65536), dOps);
}

/* video: {w,h,fps,avcC:Buffer,samples:[{data,key}]}  audio: {sampleRate,channels,preSkip,samples:[{data,dur}]} */
function writeMP4(video, audio) {
  const VTS = video.fps * 1000, vdur = 1000;
  const vs = video.samples.map(s => ({ ...s, dur: vdur, t: 0 }));
  vs.forEach((s, i) => s.t = i / video.fps);
  let at = 0;
  const as = audio ? audio.samples.map(s => { const o = { ...s, t: at / audio.sampleRate }; at += s.dur; return o; }) : [];
  // interleave by time
  const order = [...vs.map((s, i) => ({ k: 'v', i, t: s.t })), ...as.map((s, i) => ({ k: 'a', i, t: s.t }))].sort((a, b) => a.t - b.t || (a.k === 'v' ? -1 : 1));
  const vDurTS = vs.length * vdur, aDurTS = at;
  const movieDur = Math.round(Math.max(vs.length / video.fps, aDurTS / (audio ? audio.sampleRate : 1)) * 1000);
  const sync = vs.map((s, i) => (s.key ? i : -1)).filter(i => i >= 0);
  const build = (vOff, aOff) => {
    const mvhd = full('mvhd', 0, 0, u32(0), u32(0), u32(1000), u32(movieDur), u32(0x00010000), u16(0x0100), u16(0), u32(0), u32(0), MATRIX, Buffer.alloc(24), u32(audio ? 3 : 2));
    const tv = trak(1, 'vide', VTS, vDurTS, Math.round(vs.length / video.fps * 1000), avc1Entry(video.w, video.h, video.avcC), vs, vOff, sync, video.w, video.h);
    const parts = [mvhd, tv];
    if (audio) parts.push(trak(2, 'soun', audio.sampleRate, aDurTS, Math.round(aDurTS / audio.sampleRate * 1000), opusEntry(audio.channels, audio.sampleRate, audio.preSkip), as, aOff, null));
    return box('moov', ...parts);
  };
  const ftyp = box('ftyp', str('isom'), u32(0x200), str('isom'), str('iso2'), str('avc1'), str('mp41'), str('Opus'));
  const zero = (n) => new Array(n).fill(0);
  const moovSize = build(zero(vs.length), zero(as.length)).length;
  let mdatSize = 8; for (const o of order) mdatSize += (o.k === 'v' ? vs[o.i] : as[o.i]).data.length;
  let off = ftyp.length + moovSize + 8;
  const vOff = zero(vs.length), aOff = zero(as.length);
  for (const o of order) { const s = o.k === 'v' ? vs[o.i] : as[o.i]; (o.k === 'v' ? vOff : aOff)[o.i] = off; off += s.data.length; }
  const moov = build(vOff, aOff);
  const chunks = [ftyp, moov, u32(mdatSize), str('mdat')];
  for (const o of order) chunks.push((o.k === 'v' ? vs[o.i] : as[o.i]).data);
  return Buffer.concat(chunks);
}
module.exports = { writeMP4 };
