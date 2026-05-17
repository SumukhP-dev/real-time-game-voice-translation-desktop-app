# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec for bundled FastAPI ML backend (used by Electron extraResources)

import os

from PyInstaller.utils.hooks import collect_data_files

block_cipher = None
backend_dir = os.path.dirname(os.path.abspath(SPEC))

# Whisper loads mel_filters.npz and tiktoken files from whisper/assets at runtime.
whisper_datas = collect_data_files('whisper')

hiddenimports = [
    'uvicorn',
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    'uvicorn.lifespan.off',
    'uvicorn.__main__',
    'fastapi',
    'starlette',
    'starlette.routing',
    'pydantic',
    'pydantic.deprecated',
    'pydantic.deprecated.decorator',
    'multipart',
    'numpy',
    'scipy',
    'scipy.special',
    'scipy.special._cdflib',
    'soundfile',
    'sounddevice',
    'soundcard',
    'whisper',
    'whisper.timing',
    'whisper.decoding',
    'whisper.audio',
    'whisper.model',
    'whisper.normalizers',
    'torch',
    'torchaudio',
    'transformers',
    'sentencepiece',
    'deep_translator',
    'googletrans',
    'audio_capture',
    'whisper_service',
    'translation_service',
    'speaker_identification',
    'adaptive_learning',
    'app_paths',
]

a = Analysis(
    ['main.py'],
    pathex=[backend_dir],
    binaries=[],
    datas=whisper_datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['matplotlib', 'tkinter', 'pytest'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# Directory bundle starts much faster than one-file (no 30–90s extract on each launch).
exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ml-service',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='ml-service',
)
