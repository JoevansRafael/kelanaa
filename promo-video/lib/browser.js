const fs = require('fs');
const path = require('path');
const { chromium } = require('/root/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright-core');

const ROOT = path.resolve(__dirname, '..');
const CHROME = process.env.CHROME || '/inner_container/opt/playwright/chromium_headless_shell-1232/chrome-headless-shell-linux64/chrome-headless-shell';
const tmp = path.join(ROOT, '.chrome-tmp');
fs.mkdirSync(tmp, { recursive: true });
process.env.TMPDIR = tmp;
process.env.HOME = process.env.HOME && fs.existsSync(process.env.HOME) ? process.env.HOME : tmp;

function overrides() {
  // processed assets produced by prep_assets.js
  const dir = path.join(ROOT, 'web', 'photos');
  const photos = {};
  let logo = null;
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^([a-z]+)\.(jpe?g|webp)$/i);
    if (m) photos[m[1].toLowerCase()] = 'photos/' + f;
  }
  if (fs.existsSync(path.join(dir, 'logo.png'))) logo = 'photos/logo.png';
  return { photos, logo };
}

async function launch() {
  return chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-crash-reporter', '--allow-file-access-from-files', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--autoplay-policy=no-user-gesture-required'],
  });
}

async function openStage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const ov = overrides();
  await page.addInitScript(`window.PHOTO_OVERRIDES=${JSON.stringify(ov.photos)};window.LOGO_OVERRIDE=${JSON.stringify(ov.logo)};`);
  page.on('pageerror', e => console.error('[page error]', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()); });
  await page.goto('file://' + path.join(ROOT, 'web', 'index.html'));
  await page.evaluate(() => window.KELANA.ready);
  const cdp = await page.context().newCDPSession(page);
  return { page, cdp };
}

async function capture({ page, cdp }, t, format = 'jpeg', quality = 93) {
  await page.evaluate(tt => new Promise(r => { window.KELANA.seek(tt); requestAnimationFrame(() => requestAnimationFrame(() => r())); }), t);
  const r = await cdp.send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? quality : undefined, optimizeForSpeed: true, captureBeyondViewport: false });
  return Buffer.from(r.data, 'base64');
}

module.exports = { ROOT, launch, openStage, capture };
