#!/usr/bin/env bash
# Build SquadSpeak for macOS (DMG). Run on macOS 12+ only.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Building SquadSpeak for macOS..."
python3 build_electron.py --platform mac
echo "Artifacts: electron-app/dist/ and ./dist/"
