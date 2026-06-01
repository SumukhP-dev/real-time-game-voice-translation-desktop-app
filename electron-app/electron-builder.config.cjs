/**
 * electron-builder config: merges package.json "build" and optionally bundles
 * VB-Audio Virtual Cable setup for offline install when present under third_party/.
 */
const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

const projectDir = __dirname;
const vbInstallerFrom = '../third_party/vb-audio/installer';
const vbSetupX64 = path.join(projectDir, vbInstallerFrom, 'VBCABLE_Setup_x64.exe');

/** @type {import('electron-builder').Configuration} */
const config = {
  ...pkg.build,
  files: [
    ...(pkg.build.files || []),
    'vb-audio-installer.js',
  ],
  extraResources: [...(pkg.build.extraResources || [])],
};

if (fs.existsSync(vbSetupX64)) {
  config.extraResources.push({
    from: vbInstallerFrom,
    to: 'vb-audio/installer',
    filter: ['VBCABLE_Setup_x64.exe'],
  });
  console.log(
    '[electron-builder] Bundling VB-Audio installer for offline install:',
    vbSetupX64
  );
} else {
  console.warn(
    '[electron-builder] VB-Audio setup not bundled (offline install will download on demand).\n' +
      '  Run from repo root: .\\scripts\\download_vb_cable.ps1'
  );
}

module.exports = config;
