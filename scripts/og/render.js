// Renders public/og.png, icon.png and apple-icon.png. Usage: node scripts/og/render.js scripts/og public
const { chromium } = require('playwright');
const dir = process.argv[2], pub = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + dir + '/og.html', { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  console.log('font', await p.evaluate(() => document.fonts.check('800 20px "Plus Jakarta Sans"')));
  await p.screenshot({ path: pub + '/og.png' });
  for (const [n, sz] of [['icon.png', 512], ['apple-icon.png', 180]]) {
    const q = await b.newPage({ viewport: { width: sz, height: sz } });
    await q.setContent(`<style>*{margin:0}body{background:#161c37}</style><img src="data:image/svg+xml;base64,${require('fs').readFileSync(pub + '/icon.svg').toString('base64')}" width=${sz} height=${sz}>`);
    await q.screenshot({ path: pub + '/' + n });
  }
  await b.close();
})();
