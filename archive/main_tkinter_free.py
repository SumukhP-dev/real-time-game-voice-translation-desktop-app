"""
Main application for CS:GO 2 Live Voice Translation Mod (FREE VERSION)
Uses Windows WASAPI loopback - NO third-party software required!
"""
import sys
import threading
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from speech_recognition import SpeechRecognizer
from translation import Translator
from tts import TextToSpeech
from overlay_tkinter import OverlayManager
from config import config

# Fix Unicode encoding issues for Windows terminals
def safe_print(*args, **kwargs):
    """Print with safe encoding for Windows terminals"""
    try:
        print(*args, **kwargs)
    except UnicodeEncodeError:
        # Replace Unicode characters with ASCII equivalents
        safe_args = []
        for arg in args:
            if isinstance(arg, str):
                arg = arg.replace('✓', '[OK]').replace('❌', '[ERROR]').replace('⚠', '[WARN]').replace('ℹ', '[INFO]').replace('📢', '[AUDIO]')
            safe_args.append(arg)
        print(*safe_args, **kwargs)

try:
    from audio_capture_wasapi_free import AudioCapture
    safe_print("Using FREE WASAPI loopback capture (no third-party software required)", flush=True)
    FREE_MODE = True
except ImportError:
    try:
        from audio_capture_multi import AudioCapture
        safe_print("Using multi-method audio capture (fallback)", flush=True)
        FREE_MODE = False
    except ImportError:
        try:
            from audio_capture_sounddevice import AudioCapture
            safe_print("Using sounddevice for audio capture", flush=True)
            FREE_MODE = False
        except ImportError:
            from audio_capture import AudioCapture
            safe_print("Using PyAudio for audio capture", flush=True)
            FREE_MODE = False

class TranslationApp:
    """Main application window using Tkinter (FREE VERSION)"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("CS:GO 2 Live Voice Translation Mod (FREE VERSION)")
        self.root.geometry("600x700")
        
        # Translation worker
        self.worker = None
        self.is_running = False
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup user interface"""
        # Status frame
        status_frame = ttk.Frame(self.root, padding="10")
        status_frame.pack(fill=tk.X)
        
        status_text = "Status: Stopped"
        if FREE_MODE:
            status_text += " (FREE MODE - WASAPI Loopback)"
        self.status_label = ttk.Label(status_frame, text=status_text, font=("Arial", 12, "bold"))
        self.status_label.pack(side=tk.LEFT)
        
        # Info banner for free version
        if FREE_MODE:
            info_frame = ttk.Frame(self.root, padding="5")
            info_frame.pack(fill=tk.X)
            info_label = ttk.Label(
                info_frame,
                text="✓ FREE VERSION: Using Windows WASAPI Loopback (No third-party software needed!)",
                foreground="green",
                font=("Arial", 9, "bold")
            )
            info_label.pack()
        
        # Control buttons
        button_frame = ttk.Frame(self.root, padding="10")
        button_frame.pack(fill=tk.X)
        
        self.start_button = ttk.Button(button_frame, text="Start Translation", command=self.start_translation)
        self.start_button.pack(side=tk.LEFT, padx=5)
        
        self.stop_button = ttk.Button(button_frame, text="Stop Translation", command=self.stop_translation, state=tk.DISABLED)
        self.stop_button.pack(side=tk.LEFT, padx=5)
        
        # Audio settings
        audio_frame = ttk.LabelFrame(self.root, text="Audio Settings", padding="10")
        audio_frame.pack(fill=tk.X, padx=10, pady=5)
        
        if FREE_MODE:
            info_text = ttk.Label(
                audio_frame,
                text="Using Windows WASAPI Loopback - captures system audio directly (FREE!)",
                foreground="blue",
                font=("Arial", 8)
            )
            info_text.pack(anchor=tk.W, pady=5)
        
        audio_device_frame = ttk.Frame(audio_frame)
        audio_device_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(audio_device_frame, text="Audio Device:").pack(anchor=tk.W)
        device_select_frame = ttk.Frame(audio_device_frame)
        device_select_frame.pack(fill=tk.X, pady=2)
        
        self.audio_device_combo = ttk.Combobox(device_select_frame, state="readonly", width=45)
        self.audio_device_combo.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        
        refresh_btn = ttk.Button(device_select_frame, text="Refresh Devices", command=self.refresh_audio_devices)
        refresh_btn.pack(side=tk.LEFT, padx=2)
        
        # Initialize log_text early to avoid errors
        self.log_text = None
        self._audio_log_count = 0
        
        # Refresh devices after UI is fully set up
        self.root.after(100, self.refresh_audio_devices)
        
        # Translation settings
        translation_frame = ttk.LabelFrame(self.root, text="Translation Settings", padding="10")
        translation_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(translation_frame, text="Target Language:").pack(anchor=tk.W)
        self.target_language_combo = ttk.Combobox(translation_frame, values=["en", "es", "fr", "de", "ru", "zh", "ja", "ko"], state="readonly")
        self.target_language_combo.set(config.get("translation", "target_language", default="en"))
        self.target_language_combo.pack(fill=tk.X, pady=5)
        self.target_language_combo.bind("<<ComboboxSelected>>", self.on_target_language_changed)
        
        # Display settings
        display_frame = ttk.LabelFrame(self.root, text="Display Settings", padding="10")
        display_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.overlay_enabled = tk.BooleanVar(value=config.get("overlay", "enabled", default=True))
        ttk.Checkbutton(display_frame, text="Enable Text Overlay", variable=self.overlay_enabled, command=self.on_overlay_enabled_changed).pack(anchor=tk.W)
        
        self.tts_enabled = tk.BooleanVar(value=config.get("tts", "enabled", default=True))
        ttk.Checkbutton(display_frame, text="Enable Audio Playback", variable=self.tts_enabled, command=self.on_tts_enabled_changed).pack(anchor=tk.W)
        
        # Log area
        log_frame = ttk.LabelFrame(self.root, text="Translation Log", padding="10")
        log_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=10, wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        self.log_text.insert(tk.END, "No translations yet...\n")
        if FREE_MODE:
            self.log_text.insert(tk.END, "[OK] FREE VERSION: Using Windows WASAPI Loopback\n")
            self.log_text.insert(tk.END, "  No third-party software (VB-Audio, etc.) required!\n")
            self.log_text.insert(tk.END, "  Captures system audio directly from Windows.\n\n")
        self.log_text.config(state=tk.DISABLED)
    
    def refresh_audio_devices(self):
        """Refresh list of audio devices"""
        try:
            temp_capture = AudioCapture()
            devices = temp_capture.list_audio_devices()
            device_names = [f"{d['name']} (Index: {d['index']})" for d in devices]
            self.audio_device_combo['values'] = device_names
            
            # Store device list for later use
            self.device_list = device_names
            
            # Auto-select Stereo Mix if available (this is what we need for system audio)
            stereo_mix_index = None
            for i, name in enumerate(device_names):
                name_lower = name.lower()
                if 'stereo mix' in name_lower or 'loopback' in name_lower or 'what u hear' in name_lower:
                    stereo_mix_index = i
                    break
            
            if stereo_mix_index is not None:
                self.audio_device_combo.current(stereo_mix_index)
                self.log_message(f"[OK] Auto-selected: {device_names[stereo_mix_index]}")
                self.log_message("  This will capture system audio (FREE - no third-party software!)")
            elif device_names:
                self.audio_device_combo.current(0)
                self.log_message(f"[WARN] Selected: {device_names[0]}")
                self.log_message("  Note: For system audio, enable 'Stereo Mix' in Windows Sound settings")
                self.log_message("  (Recording tab -> Right-click -> Show Disabled Devices -> Enable Stereo Mix)")
            
            temp_capture.cleanup()
        except Exception as e:
            import sys
            error_msg = f"[ERROR] Error listing audio devices: {e}"
            safe_print(error_msg, flush=True)
            import traceback
            traceback.print_exc()
            sys.stdout.flush()
            self.audio_device_combo['values'] = ["Default Output Device (WASAPI Loopback)"]
            self.device_list = ["Default Output Device (WASAPI Loopback)"]
            if hasattr(self, 'log_text') and self.log_text:
                self.log_message(f"[WARN] Error listing devices: {e}")
                self.log_message("  To capture system audio, enable 'Stereo Mix' in Windows Sound settings")
    
    def on_target_language_changed(self, event=None):
        """Handle target language change"""
        language = self.target_language_combo.get()
        config.set("translation", "target_language", value=language)
        config.save()
    
    def on_overlay_enabled_changed(self):
        """Handle overlay enabled change"""
        enabled = self.overlay_enabled.get()
        config.set("overlay", "enabled", value=enabled)
        config.save()
    
    def on_tts_enabled_changed(self):
        """Handle TTS enabled change"""
        enabled = self.tts_enabled.get()
        config.set("tts", "enabled", value=enabled)
        config.save()
    
    def log_message(self, message):
        """Add message to log (both GUI and terminal)"""
        # Handle None or invalid messages
        if message is None:
            message = "[None]"
        message = str(message)  # Convert to string
        
        # Log to terminal (always works, thread-safe)
        safe_print(f"[LOG] {message}", flush=True)
        
        # Log to GUI (thread-safe using root.after)
        if self.log_text and self.root:
            try:
                # Check if we're in the main thread and main loop is running
                import threading
                is_main_thread = threading.current_thread() is threading.main_thread()
                
                if is_main_thread:
                    # We're in main thread, can update directly
                    try:
                        self.log_text.config(state=tk.NORMAL)
                        self.log_text.insert(tk.END, message + "\n")
                        self.log_text.see(tk.END)
                        self.log_text.config(state=tk.DISABLED)
                    except Exception as e:
                        safe_print(f"[ERROR] Failed to update GUI log: {e}", flush=True)
                else:
                    # We're in a background thread, schedule on main thread
                    def update_gui():
                        try:
                            if self.log_text:
                                self.log_text.config(state=tk.NORMAL)
                                self.log_text.insert(tk.END, message + "\n")
                                self.log_text.see(tk.END)
                                self.log_text.config(state=tk.DISABLED)
                        except Exception as e:
                            safe_print(f"[ERROR] Failed to update GUI log: {e}", flush=True)
                    
                    # Use root.after to schedule on main thread (thread-safe)
                    try:
                        self.root.after(0, update_gui)
                    except RuntimeError:
                        # Main loop not running, skip GUI update (terminal log is enough)
                        pass
            except Exception as e:
                # If anything fails, at least we logged to terminal
                pass
    
    def start_translation(self):
        """Start translation service"""
        if self.is_running:
            return
        
        try:
            # Get selected audio device
            selection = self.audio_device_combo.get()
            device_index = None
            if selection and "Index:" in selection:
                try:
                    index_part = selection.split("Index:")[1].strip()
                    index_part = index_part.rstrip(")")
                    device_index = int(index_part.strip())
                except:
                    device_index = 0  # Default
            else:
                device_index = 0  # Default
            
            self.log_message(f"Starting translation service...")
            if FREE_MODE:
                self.log_message("[OK] Using FREE WASAPI loopback (no third-party software)")
            
            # Initialize components
            self.translator = Translator(callback=self.on_translation)
            self.overlay_manager = OverlayManager(root=self.root)
            
            # Disable TTS if using Stereo Mix to prevent feedback loop
            # Stereo Mix captures ALL system audio, including TTS playback
            selection_lower = selection.lower() if selection else ""
            use_stereo_mix = 'stereo mix' in selection_lower or 'loopback' in selection_lower
            if use_stereo_mix:
                # Temporarily disable TTS to prevent feedback when using Stereo Mix
                original_tts_enabled = config.get("tts", "enabled", default=True)
                if original_tts_enabled:
                    self.log_message("[INFO] TTS temporarily disabled to prevent audio feedback loop")
                    self.log_message("  (Stereo Mix would capture TTS playback and re-transcribe it)")
                    config.set("tts", "enabled", value=False)
                    self.tts_enabled.set(False)
            
            self.tts = TextToSpeech()
            self.speech_recognizer = SpeechRecognizer(callback=self.on_transcription)
            
            # Audio callback with logging
            def audio_callback_with_log(audio_data, sample_rate):
                try:
                    self._audio_log_count += 1
                    if self._audio_log_count % 50 == 0:  # Log every 50 chunks
                        audio_level = max(abs(audio_data)) if len(audio_data) > 0 else 0
                        self.log_message(f"[AUDIO] Audio captured: {len(audio_data)} samples @ {sample_rate}Hz (level: {audio_level:.4f})")
                    if self.speech_recognizer:
                        self.speech_recognizer.add_audio(audio_data, sample_rate)
                except Exception as e:
                    import sys
                    safe_print(f"[ERROR] Error in audio callback: {e}", flush=True)
                    import traceback
                    traceback.print_exc()
                    sys.stdout.flush()
            
            self.audio_capture = AudioCapture(callback=audio_callback_with_log, device_index=device_index)
            
            # Start components
            self.translator.start()
            self.tts.start()
            self.overlay_manager.start()
            self.speech_recognizer.start()
            self.audio_capture.start()
            
            self.is_running = True
            status_text = "Status: Running"
            if FREE_MODE:
                status_text += " (FREE MODE)"
            self.status_label.config(text=status_text, foreground="green")
            self.start_button.config(state=tk.DISABLED)
            self.stop_button.config(state=tk.NORMAL)
            
            self.log_message("Translation started successfully!")
            self.log_message("")
            self.log_message("[AUDIO] TESTING INSTRUCTIONS:")
            self.log_message("  1. Play a YouTube video with speech")
            self.log_message("  2. Or play any audio with speech on your computer")
            self.log_message("  3. You should see transcriptions appear below")
            self.log_message("  4. First transcription may take 5-10 seconds (Whisper processing)")
            self.log_message("")
            safe_print("[INFO] Translation service ready. Waiting for audio...", flush=True)
            
        except Exception as e:
            import sys
            error_msg = f"[ERROR] Error starting translation: {e}"
            safe_print(error_msg, flush=True)
            self.log_message(error_msg)
            import traceback
            traceback.print_exc()
            sys.stdout.flush()
            messagebox.showerror("Error", f"Failed to start translation:\n{e}")
    
    def stop_translation(self):
        """Stop translation service"""
        if not self.is_running:
            return
        
        try:
            self.is_running = False
            self.status_label.config(text="Status: Stopped", foreground="black")
            self.start_button.config(state=tk.NORMAL)
            self.stop_button.config(state=tk.DISABLED)
            
            if hasattr(self, 'audio_capture'):
                self.audio_capture.stop()
            if hasattr(self, 'speech_recognizer'):
                self.speech_recognizer.stop()
            if hasattr(self, 'translator'):
                self.translator.stop()
            if hasattr(self, 'tts'):
                self.tts.stop()
            if hasattr(self, 'overlay_manager'):
                self.overlay_manager.stop()
            
            self.log_message("Translation stopped.")
            
        except Exception as e:
            import sys
            error_msg = f"[ERROR] Error stopping translation: {e}"
            safe_print(error_msg, flush=True)
            self.log_message(error_msg)
            import traceback
            traceback.print_exc()
            sys.stdout.flush()
    
    def on_transcription(self, text, language, segments=None):
        """Handle transcription callback"""
        if text:
            text = text.strip()
            text_lower = text.lower().strip()
            
            # Filter out very short transcriptions (but allow longer ones)
            if len(text_lower) < 2:
                return  # Skip very short transcriptions
            
            # Initialize tracking if needed
            if not hasattr(self, '_last_transcription'):
                self._last_transcription = None
                self._last_transcription_time = 0
                self._transcription_count = {}
            
            import time
            current_time = time.time()
            
            # More aggressive deduplication: skip if same text within 15 seconds
            # Use normalized text (lowercase) for comparison to catch variations
            text_normalized = text_lower
            
            if self._last_transcription == text_normalized:
                time_since_last = current_time - self._last_transcription_time
                if time_since_last < 15.0:  # Increased to 15 seconds to prevent spam
                    # Count how many times we've skipped this
                    if text_normalized not in self._transcription_count:
                        self._transcription_count[text_normalized] = 0
                    self._transcription_count[text_normalized] += 1
                    
                    # Log every 5th skip to show it's working
                    if self._transcription_count[text_normalized] % 5 == 0:
                        self.log_message(f"[WARN] Skipped duplicate: '{text}' ({self._transcription_count[text_normalized]} times, within {time_since_last:.1f}s)")
                        safe_print(f"[WARN] Skipped duplicate transcription: '{text}' ({self._transcription_count[text_normalized]} times, within {time_since_last:.1f}s)", flush=True)
                    return  # Skip duplicate transcription
            
            # Reset count for new unique transcription
            if text_normalized in self._transcription_count:
                del self._transcription_count[text_normalized]
            
            # Store normalized text for comparison
            self._last_transcription = text_normalized
            self._last_transcription_time = current_time
            
            # Log transcription (log_message already prints to terminal)
            self.log_message(f"[{language}] {text}")
            # Also print detailed transcription info to terminal for clarity
            safe_print(f"[TRANSCRIPTION] [{language}] {text}", flush=True)
            
            # Check if translator exists and is ready
            if hasattr(self, 'translator') and self.translator:
                if self.translator.is_translating:
                    # Use translate_async to trigger callback
                    self.translator.translate_async(text, source_language=language)
                else:
                    safe_print(f"[WARN] Translator not started, cannot translate: '{text}'", flush=True)
            else:
                safe_print(f"[INFO] Translator not initialized yet, skipping translation for: '{text}'", flush=True)
    
    def on_translation(self, original_text, translated_text, source_language, target_language):
        """Handle translation callback (called from background thread - must be thread-safe)"""
        if translated_text:
            # Log translation (log_message already prints to terminal)
            # Show detailed info in log
            self.log_message(f"-> [{source_language}->{target_language}] {translated_text}")
            # Also print detailed translation info to terminal
            safe_print(f"[TRANSLATION] [{source_language}->{target_language}] '{original_text}' -> '{translated_text}'", flush=True)
            
            # Update overlay and TTS (thread-safe using root.after)
            def update_ui():
                try:
                    # Update overlay (safely check if enabled)
                    try:
                        overlay_enabled = False
                        if hasattr(self, 'overlay_enabled'):
                            try:
                                overlay_enabled = self.overlay_enabled.get()
                            except (RuntimeError, AttributeError):
                                # Main loop not running or widget destroyed
                                overlay_enabled = False
                        
                        if overlay_enabled and hasattr(self, 'overlay_manager') and self.overlay_manager:
                            self.overlay_manager.update_text(translated_text)
                    except Exception as e:
                        safe_print(f"[ERROR] Failed to update overlay: {e}", flush=True)
                    
                    # Play TTS (safely check if enabled)
                    try:
                        tts_enabled = False
                        if hasattr(self, 'tts_enabled'):
                            try:
                                tts_enabled = self.tts_enabled.get()
                            except (RuntimeError, AttributeError):
                                # Main loop not running or widget destroyed
                                tts_enabled = False
                        
                        if tts_enabled and hasattr(self, 'tts') and self.tts:
                            self.tts.speak(translated_text)
                    except Exception as e:
                        safe_print(f"[ERROR] Failed to play TTS: {e}", flush=True)
                except Exception as e:
                    safe_print(f"[ERROR] Failed to update UI: {e}", flush=True)
            
            # Schedule UI update on main thread (thread-safe)
            if self.root:
                try:
                    import threading
                    is_main_thread = threading.current_thread() is threading.main_thread()
                    
                    if is_main_thread:
                        # We're in main thread, try to update directly
                        try:
                            update_ui()
                        except (RuntimeError, AttributeError):
                            # Main loop not running, skip UI update
                            pass
                    else:
                        # We're in background thread, schedule on main thread
                        try:
                            self.root.after(0, update_ui)
                        except (RuntimeError, AttributeError):
                            # Main loop not running or root destroyed, skip UI update
                            pass
                except Exception:
                    # If anything fails, at least we logged to terminal
                    pass
        else:
            safe_print(f"[WARN] Translation callback received empty translated_text for: '{original_text}'", flush=True)

def main():
    """Main entry point"""
    import sys
    safe_print("=" * 60, flush=True)
    safe_print("CS:GO 2 Live Voice Translation Mod (FREE VERSION)", flush=True)
    safe_print("=" * 60, flush=True)
    safe_print("Starting application...", flush=True)
    
    try:
        safe_print("Initializing Tkinter window...", flush=True)
        root = tk.Tk()
        safe_print("Creating TranslationApp...", flush=True)
        app = TranslationApp(root)
        safe_print("[OK] Application initialized successfully", flush=True)
        safe_print("Starting main loop...", flush=True)
        safe_print("=" * 60, flush=True)
        root.mainloop()
        safe_print("\n" + "=" * 60, flush=True)
        safe_print("Application closed normally", flush=True)
        safe_print("=" * 60, flush=True)
    except KeyboardInterrupt:
        safe_print("\n[WARN] Application interrupted by user (Ctrl+C)", flush=True)
    except Exception as e:
        safe_print(f"\n[ERROR] CRITICAL ERROR: {e}", flush=True)
        safe_print("=" * 60, flush=True)
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        safe_print("=" * 60, flush=True)
        input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()

