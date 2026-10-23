# Kelana — video promo

**Hasil:** `out/kelana_promo.mp4` · 1920×1080 · 60 fps · 56 dtk · H.264 High + audio Opus stereo
Stem audio terpisah: `out/kelana_audio.wav` (48 kHz/16-bit). Storyboard: `STORYBOARD.md`.

## Render ulang
```bash
node render_frames.js 7   # ambil 3360 frame (headless Chrome) -> out/frames  (~4 menit)
node encode.js            # render audio + encode H.264/Opus -> out/kelana_promo.mp4  (~3 menit)
node verify.js            # decode ulang di Chromium untuk cek durasi, resolusi, dan audio
node stills.js 12.5 28    # preview frame tertentu -> out/stills
```

## Ganti aset
- **Logo asli:** taruh `assets/logo.png` (atau `.svg`), otomatis dipakai menggantikan logo hasil rekreasi.
- **Foto asli:** taruh `assets/photos/<nama>.jpg`. Nama yang bisa dipakai: `padar, pinkbeach, komodo, manta, bromo, rajaampat, borobudur, terraces, toba, jungle`.
- Teks, timing, dan caption ada di `web/js/scenes*.js` (array `CAPS`). Sound cue ada di `web/js/audio.js`.
