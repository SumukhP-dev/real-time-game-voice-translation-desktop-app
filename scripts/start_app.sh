#!/usr/bin/env bash
# Start SquadSpeak (Electron + ML service) on macOS / Linux
set -euo pipefail
cd "$(dirname "$0")/.."
python3 start_electron.py
