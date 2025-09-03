// Simple build-time generator for PWA icons
// Generates solid-color PNG placeholders if icons are missing or 0 bytes
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.resolve(process.cwd(), 'public');
const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function needsGenerate(filePath) {
  try {
    const stat = await fs.promises.stat(filePath);
    return !stat.isFile() || stat.size === 0;
  } catch {
    return true;
  }
}

async function generate() {
  await ensureDir(outDir);
  const color = { r: 30, g: 64, b: 175, alpha: 1 }; // #1e40af

  for (const { name, size } of targets) {
    const filePath = path.join(outDir, name);
    if (!(await needsGenerate(filePath))) continue;

    const png = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: color,
      },
    })
      .png()
      .toBuffer();

    await fs.promises.writeFile(filePath, png);
    // eslint-disable-next-line no-console
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});


