# Building for itch.io Distribution

## Overview

For itch.io releases, license key checking is disabled. itch.io provides built-in download protection, so additional license validation is not necessary and adds unnecessary friction for users.

## Build Process

### Step 1: Build Without License Checking

Run the build script with the `--no-license` flag:

```bash
python build.py --no-license
```

This creates an executable that:
- Does not require license activation
- Does not show license dialog on startup
- Does not display license button in UI
- Runs immediately after launch

### Step 2: Test the Build

1. Navigate to `dist/CSGO2_Translation_Package/`
2. Run `CSGO2_Live_Voice_Translation.exe`
3. Verify:
   - Application launches without license dialog
   - No license button in the UI
   - All features work normally
   - About dialog doesn't show license info

### Step 3: Create Installer (Optional)

If providing an installer:

1. Open `installer.iss` in Inno Setup
2. Compile the installer
3. The installer will be in `dist/` folder

### Step 4: Package for Distribution

Create a ZIP file containing:
- The executable (or installer)
- README.txt
- Documentation folder (optional)

## itch.io Upload

1. **Create Product Page**
   - Use the description from `docs/ITCH_IO_DESCRIPTION.md`
   - Set launch price to $7.99 (with note that regular price is $12.00)
   - Add tags: CS:GO, CS2, translation, voice, mod, utility

2. **Upload Files**
   - Upload the installer or portable ZIP
   - Enable "Require purchase to download"
   - Set up automatic delivery

3. **Configure**
   - Add screenshots
   - Write product description
   - Set up payment processing

## Differences from Licensed Build

| Feature | itch.io Build | Licensed Build |
|---------|--------------|----------------|
| License check on startup | ❌ No | ✅ Yes |
| License activation dialog | ❌ No | ✅ Yes |
| License button in UI | ❌ No | ✅ Yes |
| Hardware binding | ❌ No | ✅ Yes |
| Download protection | itch.io handles | License system |

## Notes

- Keep separate builds for itch.io and other platforms
- Label builds clearly (e.g., `CSGO2_Translation_itchio_v1.0.0.exe`)
- Test thoroughly before uploading
- itch.io's download protection is sufficient for $7.99-$12 software

## Reverting to Licensed Build

To create a build with license checking:

```bash
python build.py
```

Or explicitly:

```bash
python build.py --license
```

This is the default behavior.

