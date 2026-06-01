# VB-Audio Virtual Cable (optional dependency)

SquadSpeak can route translated speech into games/Discord via a **virtual audio cable**.
We recommend [VB-Audio Virtual Cable](https://vb-audio.com/Cable/) (donationware).

## For developers

Download the official driver pack into this folder:

```powershell
.\scripts\download_vb_cable.ps1
```

That creates `installer/VBCABLE_Setup_x64.exe` for local dev and **Windows packaging**.

### Bundling in SquadSpeak builds

When `installer/VBCABLE_Setup_x64.exe` exists, `electron-builder.config.cjs` copies it to
`resources/vb-audio/installer/` in the built app so **Install Virtual Cable** works offline.

```powershell
.\scripts\download_vb_cable.ps1
cd electron-app
npm run dist:win
```

To fail the build if the installer is missing (CI):

```powershell
$env:STRICT_VB_AUDIO_BUNDLE = "1"
npm run dist:win
```

## For end users

In the app: **Translation to Team** → enable TTS → **Install Virtual Cable**.
The app downloads the official pack on demand (or uses a bundled copy if present) and runs
the VB-Audio setup when you confirm (UAC + driver trust prompt).

## License / redistribution

Per VB-Audio’s readme in the driver pack:

- Redistribution **AS-IS** is allowed with attribution to https://vb-cable.com
- **Do not** embed VB-CABLE inside another product’s installer without author agreement
- SquadSpeak uses a **separate, user-initiated** install step

For commercial redistribution or bundling inside your own NSIS installer, contact VB-Audio.
See **`docs/VB_AUDIO_LICENSING.md`** for contacts and an email template.
