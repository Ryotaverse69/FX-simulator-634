#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

async function generate() {
  const srcSvgCandidates = [
    path.join('resources', 'icon.svg'),
    path.join('icons', 'icon.svg')
  ];
  let srcSvg = null;
  for (const c of srcSvgCandidates) {
    if (fs.existsSync(c)) { srcSvg = c; break; }
  }
  if (!srcSvg) {
    console.error('No SVG source found (resources/icon.svg or icons/icon.svg)');
    process.exit(1);
  }

  const targets = [
    { out: path.join('icons', 'icon-192.png'), size: 192 },
    { out: path.join('icons', 'icon-512.png'), size: 512 },
    { out: path.join('icons', 'apple-touch-icon.png'), size: 180 }
  ];

  await ensureDir('icons');
  await ensureDir(path.join('www', 'icons'));

  for (const t of targets) {
    await sharp(srcSvg, { density: 384 })
      .resize(t.size, t.size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(t.out);
    // copy to www/icons for Capacitor iOS webDir
    await fs.promises.copyFile(t.out, path.join('www', 'icons', path.basename(t.out)));
    console.log('Generated', t.out);
  }
}

generate().catch((e) => { console.error(e); process.exit(1); });

