#!/usr/bin/env python3
"""Split one ElevenLabs MP3 (all callouts in one file) into separate demo clips."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

try:
    import imageio_ffmpeg
except ImportError:
    print("Install: pip install imageio-ffmpeg", file=sys.stderr)
    raise SystemExit(1)

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# Order must match the lines you pasted into ElevenLabs (top to bottom).
OUTPUT_NAMES = [
    "01_rush_b.mp3",
    "03_planting.mp3",
    "04_rotate.mp3",
    "05_last_site.mp3",
]


def _run(cmd: list[str]) -> str:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stderr + result.stdout


def detect_speech_regions(
    src: Path,
    noise_db: float = -20.0,
    min_silence_s: float = 0.08,
) -> list[tuple[float, float]]:
    log = _run(
        [
            FFMPEG,
            "-i",
            str(src),
            "-af",
            f"silencedetect=noise={noise_db}dB:d={min_silence_s}",
            "-f",
            "null",
            "-",
        ]
    )
    silence_starts: list[float] = []
    silence_ends: list[float] = []
    for line in log.splitlines():
        if m := re.search(r"silence_start:\s*([\d.]+)", line):
            silence_starts.append(float(m.group(1)))
        if m := re.search(r"silence_end:\s*([\d.]+)", line):
            silence_ends.append(float(m.group(1)))

    duration_match = re.search(r"Duration:\s*(\d+):(\d+):([\d.]+)", log)
    if not duration_match:
        raise RuntimeError("Could not read input duration")
    h, m, s = duration_match.groups()
    duration = int(h) * 3600 + int(m) * 60 + float(s)

    # Build speech spans between silences (skip leading/trailing silence).
    regions: list[tuple[float, float]] = []
    pos = 0.0
    for end in silence_ends:
        if end > pos + 0.15:
            regions.append((pos, end))
        pos = end
    if duration > pos + 0.15:
        regions.append((pos, duration))

    # Drop tiny leading silence-only chunk.
    if regions and regions[0][0] < 0.05 and regions[0][1] - regions[0][0] < 0.2:
        regions = regions[1:]

    return regions


def export_clip(src: Path, start: float, end: float, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    pad = 0.05
    start = max(0.0, start - pad)
    duration = (end - start) + pad
    _run(
        [
            FFMPEG,
            "-y",
            "-ss",
            f"{start:.3f}",
            "-i",
            str(src),
            "-t",
            f"{duration:.3f}",
            "-codec:a",
            "libmp3lame",
            "-q:a",
            "2",
            str(dest),
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Combined ElevenLabs MP3")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("docs/pitch/assets/demo_audio"),
        help="Output folder",
    )
    parser.add_argument(
        "--noise-db",
        type=float,
        default=-20.0,
        help="silencedetect threshold (default: -20)",
    )
    args = parser.parse_args()

    if not args.input.is_file():
        raise SystemExit(f"File not found: {args.input}")

    regions = detect_speech_regions(args.input, noise_db=args.noise_db)
    print(f"Found {len(regions)} speech region(s) in {args.input.name}:")
    for i, (a, b) in enumerate(regions, 1):
        print(f"  {i}: {a:.2f}s – {b:.2f}s ({b - a:.2f}s)")

    if len(regions) != len(OUTPUT_NAMES):
        print(
            f"\nWarning: expected {len(OUTPUT_NAMES)} phrases, found {len(regions)}.",
            file=sys.stderr,
        )
        print(
            "If splits look wrong, re-generate one line per file in ElevenLabs, "
            "or tweak --noise-db (try -18 or -22).",
            file=sys.stderr,
        )

    for (start, end), name in zip(regions, OUTPUT_NAMES):
        dest = args.output / name
        export_clip(args.input, start, end, dest)
        print(f"Wrote {dest}")


if __name__ == "__main__":
    main()
