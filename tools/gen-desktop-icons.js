#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function ensureDir(p) { await fs.promises.mkdir(p, { recursive: true }); }

async function main() {
  const srcs = [path.join('resources','icon.svg'), path.join('icons','icon.svg')];
  const src = srcs.find(p => fs.existsSync(p));
  if (!src) { console.error('No SVG found at resources/icon.svg or icons/icon.svg'); process.exit(1); }
  const outDir = path.join('build');
  await ensureDir(outDir);
  const sizes = [256, 512, 1024];
  for (const s of sizes) {
    const out = path.join(outDir, `icon-${s}.png`);
    await sharp(src, { density: 512 }).resize(s, s).png({ compressionLevel: 9 }).toFile(out);
    console.log('Wrote', out);
  }
  // Main icon expected by electron-builder
  await fs.promises.copyFile(path.join(outDir, 'icon-1024.png'), path.join(outDir, 'icon.png')).catch(()=>{});
  console.log('Prepared build/icon.png');
}

main().catch(e => { console.error(e); process.exit(1); });

