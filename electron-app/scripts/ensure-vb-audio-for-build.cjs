/**
 * Pre-build check: warns when VB-Audio installer is missing (optional offline bundle).
 * Exit 0 always unless STRICT_VB_AUDIO_BUNDLE=1.
 */
const path = require('path');
const fs = require('fs');

const setup = path.join(
  __dirname,
  '..',
  '..',
  'third_party',
  'vb-audio',
  'installer',
  'VBCABLE_Setup_x64.exe'
);

if (fs.existsSync(setup)) {
  console.log('[ensure-vb-audio] Offline VB-Audio installer found:', setup);
  process.exit(0);
}

const msg =
  '[ensure-vb-audio] VBCABLE_Setup_x64.exe not found.\n' +
  '  Offline virtual-cable install will require a download at runtime.\n' +
  '  To bundle: .\\scripts\\download_vb_cable.ps1 (from repo root)';

if (process.env.STRICT_VB_AUDIO_BUNDLE === '1') {
  console.error(msg);
  process.exit(1);
}

console.warn(msg);
process.exit(0);
