/**
 * Embed build/icon.ico into a Windows .exe (used by afterPack and manual repair).
 * Usage: node scripts/embed-win-icon.js [path-to.exe]
 */
const path = require('path');
const fs = require('fs');
const rcedit = require('rcedit');

const projectDir = path.join(__dirname, '..');
const iconPath = path.join(projectDir, 'build', 'icon.ico');
const defaultExe = path.join(
  projectDir,
  'dist',
  'win-unpacked',
  'Real-Time Voice Translation Tool.exe'
);

const exePath = path.resolve(process.argv[2] || defaultExe);

async function main() {
  if (!fs.existsSync(iconPath)) {
    console.error(`Icon not found: ${iconPath}\nRun: npm run sync-icons`);
    process.exit(1);
  }
  if (!fs.existsSync(exePath)) {
    console.error(`Executable not found: ${exePath}`);
    process.exit(1);
  }

  const sizeBefore = fs.statSync(exePath).size;
  if (sizeBefore < 1_000_000) {
    console.error(`Refusing to patch suspiciously small exe (${sizeBefore} bytes): ${exePath}`);
    process.exit(1);
  }

  await rcedit(exePath, { icon: iconPath });

  const sizeAfter = fs.statSync(exePath).size;
  if (sizeAfter < sizeBefore * 0.9) {
    console.error(`Icon embed may have corrupted exe (${sizeBefore} -> ${sizeAfter} bytes)`);
    process.exit(1);
  }
  console.log(`Embedded icon into ${exePath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
