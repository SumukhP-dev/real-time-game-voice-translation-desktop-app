/**
 * VB-Audio Virtual Cable — download and user-triggered install (Windows).
 *
 * License: VB-CABLE is donationware; redistribution AS-IS is permitted with
 * attribution (see third_party/vb-audio/README.md). Do not chain silent install
 * into the app's NSIS installer without VB-Audio author agreement.
 */
const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');

const VB_CABLE_PAGE_URL = 'https://vb-audio.com/Cable/';
const VB_CABLE_ZIP_URL =
  'https://download.vb-audio.com/Download_CABLE/VBCABLE_Driver_Pack45.zip';
const SETUP_EXE_NAME = 'VBCABLE_Setup_x64.exe';
const SILENT_INSTALL_ARGS = ['-i', '-h', '-H', '-n'];

function log(line) {
  try {
    const logPath = path.join(app.getPath('userData'), 'vb-audio-install.log');
    fs.appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`, 'utf8');
  } catch {
    // ignore
  }
}

function getDevInstallerDir() {
  return path.join(__dirname, '..', 'third_party', 'vb-audio', 'installer');
}

function getUserInstallerDir() {
  return path.join(app.getPath('userData'), 'vb-audio', 'installer');
}

function getBundledInstallerDir() {
  return path.join(process.resourcesPath, 'vb-audio', 'installer');
}

function findSetupExeInDir(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  const direct = path.join(dir, SETUP_EXE_NAME);
  if (fs.existsSync(direct)) return direct;
  try {
    for (const name of fs.readdirSync(dir)) {
      if (name.toLowerCase() === SETUP_EXE_NAME.toLowerCase()) {
        return path.join(dir, name);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function getBundledSetupExePath() {
  return findSetupExeInDir(getBundledInstallerDir());
}

function getLocalSetupExePath() {
  return (
    getBundledSetupExePath() ||
    findSetupExeInDir(getDevInstallerDir()) ||
    findSetupExeInDir(getUserInstallerDir())
  );
}

function isVBCableInstalledRegistry() {
  if (process.platform !== 'win32') return false;
  const script = `
$keys = @(
  'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
)
foreach ($k in $keys) {
  Get-ChildItem $k -ErrorAction SilentlyContinue | ForEach-Object {
    $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
    if ($p.DisplayName -match 'VB-Audio|VB Cable|VBCable|Virtual Cable') { exit 0 }
  }
}
exit 1
`.trim();
  return new Promise((resolve) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { windowsHide: true }
    );
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const request = https.get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        file.close();
        fs.unlink(destPath, () => undefined);
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => undefined);
        reject(new Error(`Download failed: HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    });
    request.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => undefined);
      reject(err);
    });
  });
}

function extractZip(zipPath, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const zipEsc = zipPath.replace(/'/g, "''");
  const destEsc = destDir.replace(/'/g, "''");
  const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory('${zipEsc}', '${destEsc}')
`.trim();
  return new Promise((resolve, reject) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { windowsHide: true }
    );
    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `Extract failed (code ${code})`));
    });
    child.on('error', reject);
  });
}

async function ensureInstallerDownloaded() {
  const existing = getLocalSetupExePath();
  if (existing) {
    return {
      setupPath: existing,
      downloaded: false,
      bundled: !!getBundledSetupExePath() && existing === getBundledSetupExePath(),
    };
  }

  const userDir = getUserInstallerDir();
  const zipPath = path.join(path.dirname(userDir), 'VBCABLE_Driver_Pack45.zip');
  fs.mkdirSync(path.dirname(zipPath), { recursive: true });

  log(`Downloading ${VB_CABLE_ZIP_URL}`);
  await downloadFile(VB_CABLE_ZIP_URL, zipPath);
  await extractZip(zipPath, userDir);

  const setupPath = findSetupExeInDir(userDir);
  if (!setupPath) {
    throw new Error(`${SETUP_EXE_NAME} not found after extract`);
  }
  log(`Downloaded installer to ${setupPath}`);
  return { setupPath, downloaded: true, bundled: false };
}

function runElevatedInstaller(setupPath) {
  const argList = SILENT_INSTALL_ARGS.join(' ');
  const setupEsc = setupPath.replace(/'/g, "''");
  const script = `
$p = Start-Process -FilePath '${setupEsc}' -ArgumentList '${argList}' -Verb RunAs -PassThru -Wait
exit $p.ExitCode
`.trim();
  return new Promise((resolve, reject) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { windowsHide: true }
    );
    child.on('close', (code) => {
      if (code === 0) resolve({ exitCode: 0 });
      else if (code === 1223) {
        reject(new Error('Installation cancelled (UAC denied).'));
      } else {
        reject(new Error(`Installer exited with code ${code ?? 'unknown'}`));
      }
    });
    child.on('error', reject);
  });
}

async function getVbAudioCableStatus() {
  if (process.platform !== 'win32') {
    return {
      supported: false,
      installed: false,
      installerAvailable: false,
      setupPath: null,
    };
  }
  const registryInstalled = await isVBCableInstalledRegistry();
  const bundledPath = getBundledSetupExePath();
  const setupPath = getLocalSetupExePath();
  return {
    supported: true,
    installed: registryInstalled,
    installerAvailable: !!setupPath,
    bundledOffline: !!bundledPath,
    setupPath,
    downloadPageUrl: VB_CABLE_PAGE_URL,
  };
}

async function installVbAudioCable() {
  if (process.platform !== 'win32') {
    throw new Error('VB-Audio Virtual Cable install is only supported on Windows.');
  }
  const { setupPath } = await ensureInstallerDownloaded();
  log(`Launching installer: ${setupPath}`);
  await runElevatedInstaller(setupPath);
  const installed = await isVBCableInstalledRegistry();
  return {
    success: installed,
    needsReboot: !installed,
    message: installed
      ? 'VB-Audio Virtual Cable installed successfully.'
      : 'Installer finished. If CABLE devices are missing, reboot Windows and click Refresh.',
  };
}

module.exports = {
  VB_CABLE_PAGE_URL,
  getVbAudioCableStatus,
  ensureInstallerDownloaded,
  installVbAudioCable,
  getLocalSetupExePath,
  isVBCableInstalledRegistry,
};
