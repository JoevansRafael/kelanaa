# Kelana — video promo

**Hasil:** `out/kelana_promo.mp4` · 1920×1080 · 60 fps · 56 dtk · H.264 High + audio Opus stereo
Stem audio terpisah: `out/kelana_audio.wav` (48 kHz/16-bit). Storyboard: `STORYBOARD.md`.

Video ini memakai **logo asli Kelana**, **foto asli** di `assets/photos/`, dan font **Montserrat**.

## Render ulang
```bash
node prep_assets.js       # siapkan foto + logo -> web/photos (wajib dijalankan sekali)
node render_frames.js 7   # ambil 3360 frame (headless Chrome) -> out/frames  (~7 menit)
VBITRATE=12000000 node encode.js   # audio + encode H.264/Opus -> out/kelana_promo.mp4  (~5 menit)
node verify.js            # decode ulang untuk cek durasi, resolusi, dan audio
node stills.js 12.5 28    # preview frame tertentu -> out/stills
```
`VBITRATE` menentukan bitrate video. 12 Mbps menghasilkan file ~80 MB (di bawah batas 100 MB GitHub).
Tanpa variabel itu, bitrate-nya 30 Mbps (~190 MB, kualitas lebih tinggi).

## Ganti aset
Taruh file di `assets/photos/`, lalu jalankan `node prep_assets.js`.
- **Logo:** `logo kelana.png`. Latar putihnya otomatis dihapus, dan dibuat versi putih untuk efek kilau.
- **Foto:** nama file dipetakan ke adegan lewat tabel `MAP` di `prep_assets.js`.
  Key yang dipakai: `padar, pinkbeach, komodo, manta, labuanbajo, bromo, rajaampat, borobudur, terraces, toba, batur, jogja, balibeach`.
- **Font:** `web/fonts/*.ttf`, didaftarkan di `web/style.css`.

Teks, timing, dan caption ada di `web/js/scenes*.js` (array `CAPS`). Sound cue ada di `web/js/audio.js`.
