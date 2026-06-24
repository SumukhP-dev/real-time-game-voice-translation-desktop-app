#!/usr/bin/env python3

"""Generate loud, clear Spanish demo callouts (edge-tts + ffmpeg normalize)."""



from __future__ import annotations



import argparse

import asyncio

import subprocess

import sys

import tempfile

from pathlib import Path



try:

    import edge_tts

except ImportError:

    print("Install edge-tts first:  pip install edge-tts", file=sys.stderr)

    raise SystemExit(1)



try:

    import imageio_ffmpeg

except ImportError:

    print("Install imageio-ffmpeg:  pip install imageio-ffmpeg", file=sys.stderr)

    raise SystemExit(1)



FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()



# filename -> Spanish text (short, punchy ranked callouts)

CALLOUTS: dict[str, str] = {

    "01_rush_b.mp3": "¡Rush B!",

    "02_planting.mp3": "¡Plantan!",

    "03_rotate.mp3": "¡Rotar, rotar!",

    "04_last_site.mp3": "¡Último en sitio!",

}



# Energetic male MX voice; +12% rate for in-game urgency

DEFAULT_VOICE = "es-MX-JorgeNeural"

DEFAULT_RATE = "+12%"





def _ffmpeg_normalize(src: Path, dest: Path) -> None:

    """Mono 44.1kHz, loudness-normalized, slightly compressed for loopback capture."""

    filter_chain = (

        "aformat=sample_rates=44100:channel_layouts=mono,"

        "highpass=f=80,"

        "acompressor=threshold=-18dB:ratio=3:attack=5:release=80,"

        "loudnorm=I=-14:TP=-1.5:LRA=7,"

        "volume=3dB"

    )

    cmd = [

        FFMPEG,

        "-y",

        "-i",

        str(src),

        "-af",

        filter_chain,

        "-codec:a",

        "libmp3lame",

        "-q:a",

        "2",

        str(dest),

    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:

        raise RuntimeError(result.stderr or result.stdout)





async def generate_one(

    text: str,

    voice: str,

    rate: str,

    dest: Path,

) -> None:

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:

        raw_path = Path(tmp.name)

    try:

        communicate = edge_tts.Communicate(text, voice, rate=rate)

        await communicate.save(str(raw_path))

        _ffmpeg_normalize(raw_path, dest)

    finally:

        raw_path.unlink(missing_ok=True)





async def generate_all(out_dir: Path, voice: str, rate: str) -> None:

    out_dir.mkdir(parents=True, exist_ok=True)

    for filename, text in CALLOUTS.items():

        path = out_dir / filename

        await generate_one(text, voice, rate, path)

        print(f"Wrote {path}  ({text})")





def main() -> None:

    parser = argparse.ArgumentParser(description=__doc__)

    parser.add_argument(

        "-o",

        "--output",

        type=Path,

        default=Path("docs/pitch/assets/demo_audio"),

        help="Output folder (default: docs/pitch/assets/demo_audio)",

    )

    parser.add_argument(

        "--voice",

        default=DEFAULT_VOICE,

        help=f"edge-tts voice (default: {DEFAULT_VOICE})",

    )

    parser.add_argument(

        "--rate",

        default=DEFAULT_RATE,

        help="edge-tts rate (default: +12%%)",

    )

    parser.add_argument(

        "--combine",

        action="store_true",

        default=True,

        help="Also build demo_callouts_combined.mp3 (default: on)",

    )

    parser.add_argument(

        "--no-combine",

        action="store_false",

        dest="combine",

        help="Skip combined demo file",

    )

    args = parser.parse_args()

    asyncio.run(generate_all(args.output, args.voice, args.rate))



    if args.combine:

        combine_script = Path(__file__).resolve().parent / "combine_demo_callouts.py"

        result = subprocess.run(

            [sys.executable, str(combine_script), "-i", str(args.output)],

            check=False,

        )

        if result.returncode != 0:

            raise SystemExit("combine_demo_callouts.py failed")





if __name__ == "__main__":

    main()

