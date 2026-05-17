const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const buildDir = path.join(__dirname, '..', 'build');
const electronDir = path.join(__dirname, '..');

const pairs = [
  [path.join(root, 'app_icon.ico'), path.join(buildDir, 'icon.ico')],
  [path.join(root, 'app_icon.png'), path.join(buildDir, 'icon.png')],
  [path.join(root, 'app_icon.png'), path.join(electronDir, 'app_icon.png')],
];

fs.mkdirSync(buildDir, { recursive: true });

for (const [src, dest] of pairs) {
  if (!fs.existsSync(src)) {
    console.warn(`[sync-app-icons] Missing ${src} — run tools/create_icon.py first`);
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log(`[sync-app-icons] ${path.basename(dest)}`);
}
