/** Embed custom .ico on Windows without winCodeSign (signAndEditExecutable stays false). */
async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const path = require('path');
  const fs = require('fs');
  const rcedit = require('rcedit');

  const exeName = `${context.packager.appInfo.productFilename}.exe`;
  const exePath = path.join(context.appOutDir, exeName);
  const iconPath = path.join(context.packager.projectDir, 'build', 'icon.ico');

  if (!fs.existsSync(iconPath)) {
    throw new Error(`Windows icon not found: ${iconPath}`);
  }
  if (!fs.existsSync(exePath)) {
    throw new Error(`Packaged executable not found: ${exePath}`);
  }

  await rcedit(exePath, { icon: iconPath });
  console.log(`[afterPack] Embedded icon into ${exeName}`);
}

module.exports = afterPack;
module.exports.default = afterPack;
