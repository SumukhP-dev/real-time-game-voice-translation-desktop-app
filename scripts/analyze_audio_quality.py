"""
Audio Quality Analysis Tool
Analyzes captured audio files to help identify transcription quality issues
"""
import os
import sys
import numpy as np
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from scipy.io import wavfile
    import scipy.signal as signal
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    print("Warning: scipy not installed. Install with: pip install scipy")
    print("Limited analysis will be available.")

try:
    import soundfile as sf
    HAS_SOUNDFILE = True
except ImportError:
    HAS_SOUNDFILE = False

def analyze_audio_file(filepath):
    """Analyze a single audio file and return metrics"""
    if not os.path.exists(filepath):
        return None
    
    try:
        # Try to read with scipy first
        if HAS_SCIPY:
            sample_rate, audio_data = wavfile.read(filepath)
            # Convert to float32 if needed
            if audio_data.dtype == np.int16:
                audio_data = audio_data.astype(np.float32) / 32768.0
            elif audio_data.dtype == np.int32:
                audio_data = audio_data.astype(np.float32) / 2147483648.0
        elif HAS_SOUNDFILE:
            audio_data, sample_rate = sf.read(filepath)
        else:
            return None
        
        # Ensure mono
        if len(audio_data.shape) > 1:
            audio_data = np.mean(audio_data, axis=1)
        
        # Calculate metrics
        duration = len(audio_data) / sample_rate
        rms_level = np.sqrt(np.mean(audio_data**2))
        peak_level = np.max(np.abs(audio_data))
        dynamic_range = peak_level / (rms_level + 1e-10)  # Avoid division by zero
        
        # Calculate signal-to-noise ratio estimate (simplified)
        # Use variance as a proxy for signal strength
        signal_power = np.var(audio_data)
        noise_floor = np.percentile(np.abs(audio_data), 10)  # Bottom 10% as noise estimate
        snr_estimate = 20 * np.log10(signal_power / (noise_floor**2 + 1e-10))
        
        # Frequency analysis
        if HAS_SCIPY and len(audio_data) > 1024:
            # Calculate power spectral density
            frequencies, psd = signal.welch(audio_data, sample_rate, nperseg=min(2048, len(audio_data)//4))
            
            # Find dominant frequency range (speech is typically 85-3400 Hz)
            speech_range = (frequencies >= 85) & (frequencies <= 3400)
            speech_power = np.sum(psd[speech_range])
            total_power = np.sum(psd)
            speech_ratio = speech_power / (total_power + 1e-10)
            
            # Find peak frequency
            peak_freq_idx = np.argmax(psd)
            peak_frequency = frequencies[peak_freq_idx]
        else:
            speech_ratio = None
            peak_frequency = None
        
        # Detect clipping
        clipping_ratio = np.sum(np.abs(audio_data) >= 0.99) / len(audio_data)
        
        # Calculate zero-crossing rate (indicator of speech vs noise)
        zero_crossings = np.sum(np.diff(np.sign(audio_data)) != 0)
        zcr = zero_crossings / len(audio_data)
        
        return {
            'filepath': filepath,
            'filename': os.path.basename(filepath),
            'duration': duration,
            'sample_rate': sample_rate,
            'rms_level': rms_level,
            'peak_level': peak_level,
            'dynamic_range': dynamic_range,
            'snr_estimate': snr_estimate,
            'speech_ratio': speech_ratio,
            'peak_frequency': peak_frequency,
            'clipping_ratio': clipping_ratio,
            'zero_crossing_rate': zcr,
            'file_size': os.path.getsize(filepath)
        }
    except Exception as e:
        print(f"Error analyzing {filepath}: {e}")
        return None

def format_metric(value, unit="", decimals=3):
    """Format a metric value for display"""
    if value is None:
        return "N/A"
    if isinstance(value, float):
        return f"{value:.{decimals}f}{unit}"
    return f"{value}{unit}"

def print_analysis(results):
    """Print analysis results in a formatted table"""
    if not results:
        print("No audio files found or analyzed.")
        return
    
    print("\n" + "="*120)
    print("AUDIO QUALITY ANALYSIS")
    print("="*120)
    print(f"\nAnalyzed {len(results)} audio file(s)\n")
    
    # Print summary statistics
    durations = [r['duration'] for r in results if r]
    rms_levels = [r['rms_level'] for r in results if r]
    snr_estimates = [r['snr_estimate'] for r in results if r['snr_estimate'] is not None and not np.isnan(r['snr_estimate'])]
    speech_ratios = [r['speech_ratio'] for r in results if r['speech_ratio'] is not None]
    
    print("SUMMARY STATISTICS:")
    print(f"  Duration:      {np.mean(durations):.2f}s average (range: {np.min(durations):.2f}s - {np.max(durations):.2f}s)")
    print(f"  RMS Level:     {np.mean(rms_levels):.6f} average (range: {np.min(rms_levels):.6f} - {np.max(rms_levels):.6f})")
    if snr_estimates:
        print(f"  SNR Estimate:  {np.mean(snr_estimates):.2f} dB average (range: {np.min(snr_estimates):.2f} - {np.max(snr_estimates):.2f} dB)")
    if speech_ratios:
        print(f"  Speech Ratio:  {np.mean(speech_ratios):.3f} average (range: {np.min(speech_ratios):.3f} - {np.max(speech_ratios):.3f})")
    print()
    
    # Print detailed table
    print("DETAILED ANALYSIS:")
    print("-" * 120)
    print(f"{'Filename':<35} {'Duration':<10} {'RMS':<10} {'Peak':<10} {'SNR(dB)':<10} {'Speech%':<10} {'Clipping':<10}")
    print("-" * 120)
    
    for result in results:
        if result:
            filename = result['filename'][:34]  # Truncate if too long
            duration = format_metric(result['duration'], 's', 2)
            rms = format_metric(result['rms_level'], '', 6)
            peak = format_metric(result['peak_level'], '', 6)
            snr = format_metric(result['snr_estimate'], 'dB', 1) if result['snr_estimate'] is not None else "N/A"
            speech = format_metric(result['speech_ratio'] * 100 if result['speech_ratio'] is not None else None, '%', 1)
            clipping = format_metric(result['clipping_ratio'] * 100, '%', 2)
            
            print(f"{filename:<35} {duration:<10} {rms:<10} {peak:<10} {snr:<10} {speech:<10} {clipping:<10}")
    
    print("-" * 120)
    print()
    
    # Quality assessment
    print("QUALITY ASSESSMENT:")
    print()
    
    # Find files with potential issues
    low_rms_files = [r for r in results if r and r['rms_level'] < 0.01]
    high_clipping_files = [r for r in results if r and r['clipping_ratio'] > 0.01]
    low_speech_files = [r for r in results if r and r['speech_ratio'] is not None and r['speech_ratio'] < 0.3]
    
    if low_rms_files:
        print(f"⚠️  {len(low_rms_files)} file(s) with LOW RMS LEVEL (< 0.01) - may be too quiet:")
        for r in low_rms_files[:5]:  # Show first 5
            print(f"   - {r['filename']} (RMS: {r['rms_level']:.6f})")
        if len(low_rms_files) > 5:
            print(f"   ... and {len(low_rms_files) - 5} more")
        print()
    
    if high_clipping_files:
        print(f"⚠️  {len(high_clipping_files)} file(s) with CLIPPING (> 1%) - audio may be distorted:")
        for r in high_clipping_files[:5]:
            print(f"   - {r['filename']} (Clipping: {r['clipping_ratio']*100:.2f}%)")
        if len(high_clipping_files) > 5:
            print(f"   ... and {len(high_clipping_files) - 5} more")
        print()
    
    if low_speech_files:
        print(f"⚠️  {len(low_speech_files)} file(s) with LOW SPEECH CONTENT (< 30%) - may be mostly noise:")
        for r in low_speech_files[:5]:
            print(f"   - {r['filename']} (Speech: {r['speech_ratio']*100:.1f}%)")
        if len(low_speech_files) > 5:
            print(f"   ... and {len(low_speech_files) - 5} more")
        print()
    
    # Recommendations
    print("RECOMMENDATIONS:")
    print()
    avg_rms = np.mean(rms_levels)
    if avg_rms < 0.005:
        print("  • Audio levels are very low. Consider:")
        print("    - Increasing system volume")
        print("    - Adjusting audio capture device gain")
        print("    - Lowering min_audio_threshold in recognizer.py")
    elif avg_rms > 0.5:
        print("  • Audio levels are very high. Consider:")
        print("    - Lowering system volume")
        print("    - Adjusting audio capture device gain")
        print("    - Adding normalization in preprocessing")
    
    if speech_ratios and np.mean(speech_ratios) < 0.4:
        print("  • Low speech content detected. Consider:")
        print("    - Using a better audio source (less background noise)")
        print("    - Adjusting frequency filtering")
        print("    - Using noise reduction")
    
    print()

def main():
    """Main function"""
    # Find audio directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    audio_dir = project_root / "audio"
    
    if not audio_dir.exists():
        print(f"Audio directory not found: {audio_dir}")
        print("Please run the app with save_audio enabled to capture audio files.")
        return
    
    # Get all WAV files
    audio_files = sorted(audio_dir.glob("captured_audio_*.wav"))
    
    if not audio_files:
        print(f"No audio files found in {audio_dir}")
        return
    
    print(f"Found {len(audio_files)} audio file(s) in {audio_dir}")
    print("Analyzing...")
    
    # Analyze all files
    results = []
    for i, audio_file in enumerate(audio_files, 1):
        print(f"  [{i}/{len(audio_files)}] Analyzing {audio_file.name}...", end='\r')
        result = analyze_audio_file(str(audio_file))
        if result:
            results.append(result)
    print()  # New line after progress
    
    # Print results
    print_analysis(results)
    
    # Ask if user wants to see specific file details
    if results:
        print("\nTo analyze a specific file in detail, you can:")
        print("  1. Open it in an audio editor (Audacity, etc.)")
        print("  2. Play it to verify the content")
        print("  3. Check the most recent files for current audio quality")
        print(f"\nMost recent file: {results[-1]['filename']}")
        print(f"  Location: {results[-1]['filepath']}")

if __name__ == "__main__":
    main()

