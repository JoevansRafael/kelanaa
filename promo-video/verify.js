// Verifies the MP4 by decoding it in Chromium: metadata, audio presence, and sample frames.
const fs = require('fs');
const path = require('path');
const { ROOT, launch } = require('./lib/browser');
(async () => {
  const file = path.join(ROOT, 'out', process.argv[2] || 'kelana_promo.mp4');
  const b = await launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(ROOT, 'web', 'blank.html'));
  const info = await p.evaluate(async (src) => {
    const v = document.createElement('video');
    v.src = src; v.muted = true; v.style.cssText = 'position:fixed;left:0;top:0;width:1920px;height:1080px';
    document.body.style.margin = 0; document.body.appendChild(v);
    await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error('video error ' + (v.error && v.error.code))); });
    const r = { duration: v.duration, w: v.videoWidth, h: v.videoHeight, canH264: v.canPlayType('video/mp4; codecs="avc1.640033, opus"') };
    // play a bit to confirm audio decode
    try { await v.play(); await new Promise(r => setTimeout(r, 1500)); v.pause(); } catch (e) { r.playErr = String(e); }
    r.audioBytes = v.webkitAudioDecodedByteCount; r.videoBytes = v.webkitVideoDecodedByteCount;
    r.frames = v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().totalVideoFrames : null;
    window.__v = v; return r;
  }, 'file://' + file);
  console.log(info);
  const times = [1.4, 3.2, 7.4, 11.2, 15.0, 19.2, 24.0, 34.0, 48.0, 57.5];
  for (const t of times) {
    await p.evaluate(t => new Promise(r => { __v.onseeked = r; __v.currentTime = t; }), t);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(ROOT, 'out', 'stills', `verify_${t.toFixed(1)}.jpg`), type: 'jpeg', quality: 70 });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
