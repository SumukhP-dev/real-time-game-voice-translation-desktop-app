#!/usr/bin/env python3
"""Combine numbered demo callout MP3s into one file with silence between clips."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

try:
    import imageio_ffmpeg
except ImportError:
    print("Install: pip install imageio-ffmpeg", file=sys.stderr)
    raise SystemExit(1)

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

DEFAULT_INPUTS = [
    "01_rush_b.mp3",
    "02_planting.mp3",
    "03_rotate.mp3",
    "04_last_site.mp3",
]


def combine(
    inputs: list[Path],
    output: Path,
    gap_s: float,
    tail_pad_s: float,
) -> None:
    if len(inputs) < 2:
        raise SystemExit("Need at least two input files")

    for path in inputs:
        if not path.is_file():
            raise SystemExit(f"File not found: {path}")

    # Normalize format, pad each clip tail (MP3 decode often trims endings), then
    # insert explicit silence between clips so nothing gets clipped at boundaries.
    filters: list[str] = []
    concat_labels: list[str] = []
    for i in range(len(inputs)):
        clip = f"p{i}"
        filters.append(
            f"[{i}:a]aformat=sample_rates=44100:channel_layouts=mono,"
            f"apad=pad_dur={tail_pad_s}[{clip}]"
        )
        concat_labels.append(f"[{clip}]")
        if i < len(inputs) - 1:
            silence = f"s{i}"
            filters.append(
                f"anullsrc=r=44100:cl=mono,atrim=0:{gap_s},asetpts=PTS-STARTPTS[{silence}]"
            )
            concat_labels.append(f"[{silence}]")

    n = len(concat_labels)
    filter_complex = (
        ";".join(filters)
        + f";{''.join(concat_labels)}concat=n={n}:v=0:a=1,"
        "highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,"
        "loudnorm=I=-14:TP=-1.5:LRA=7,volume=2dB,apad=pad_dur=0.1[out]"
    )

    cmd = [FFMPEG, "-y"]
    for path in inputs:
        cmd.extend(["-i", str(path)])
    cmd.extend(
        [
            "-filter_complex",
            filter_complex,
            "-map",
            "[out]",
            "-codec:a",
            "libmp3lame",
            "-q:a",
            "2",
            str(output),
        ]
    )

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr or result.stdout)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-i",
        "--input-dir",
        type=Path,
        default=Path("docs/pitch/assets/demo_audio"),
        help="Folder containing numbered callout MP3s",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("docs/pitch/assets/demo_audio/demo_callouts_combined.mp3"),
        help="Combined output MP3",
    )
    parser.add_argument(
        "--gap",
        type=float,
        default=2.0,
        help="Seconds of silence between clips (default: 2.0)",
    )
    parser.add_argument(
        "--tail-pad",
        type=float,
        default=0.5,
        help="Extra silence after each clip so endings are not clipped (default: 0.5)",
    )
    args = parser.parse_args()

    inputs = [args.input_dir / name for name in DEFAULT_INPUTS]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    combine(inputs, args.output, args.gap, args.tail_pad)
    print(
        f"Wrote {args.output} ({len(inputs)} clips, {args.gap}s gap, "
        f"{args.tail_pad}s tail pad)"
    )


if __name__ == "__main__":
    main()
