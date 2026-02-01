@echo off
echo Installing missing packages to .venv311...
echo.

call .venv311\Scripts\activate.bat

echo Installing core packages...
python -m pip install numpy scipy python-dotenv Pillow --quiet

echo Installing audio packages...
python -m pip install pyaudio sounddevice --quiet

echo Installing speech recognition...
python -m pip install openai-whisper --quiet

echo Installing translation packages...
python -m pip install deep-translator googletrans==4.0.0rc1 sentencepiece --quiet

echo Installing PyTorch (this may take a while)...
python -m pip install torch torchaudio --quiet

echo Installing transformers...
python -m pip install transformers --quiet

echo Installing EasyNMT...
python -m pip install easynmt --quiet

echo Installing TTS packages...
python -m pip install pyttsx3 gtts pydub pygame --quiet

echo Installing GUI...
python -m pip install PyQt6 --quiet

echo Installing utilities...
python -m pip install pyinstaller cryptography psutil --quiet

echo Installing integrations...
python -m pip install pypresence discord.py obs-websocket-py keyboard --quiet

echo.
echo Verifying installation...
python -c "import numpy; print('numpy: OK')" 2>nul || echo "numpy: MISSING"
python -c "import torch; print('torch: OK')" 2>nul || echo "torch: MISSING"
python -c "import whisper; print('whisper: OK')" 2>nul || echo "whisper: MISSING"
python -c "import PyQt6; print('PyQt6: OK')" 2>nul || echo "PyQt6: MISSING"
python -c "import pyttsx3; print('pyttsx3: OK')" 2>nul || echo "pyttsx3: MISSING"
python -c "import gtts; print('gtts: OK')" 2>nul || echo "gtts: MISSING"
python -c "import sounddevice; print('sounddevice: OK')" 2>nul || echo "sounddevice: MISSING"
python -c "import psutil; print('psutil: OK')" 2>nul || echo "psutil: MISSING"

echo.
echo Installation complete!
pause
