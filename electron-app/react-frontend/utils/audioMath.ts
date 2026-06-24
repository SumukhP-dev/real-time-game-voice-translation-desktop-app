/**
 * Peak absolute sample — loop-based so we never spread huge arrays into Math.max
 * (can exceed JS engine argument limits and crash the renderer).
 */
export function peakAbs(samples: ArrayLike<number>): number {
  let p = 0;
  const n = samples.length;
  for (let i = 0; i < n; i++) {
    const v = Math.abs(samples[i] as number);
    if (v > p) p = v;
  }
  return p;
}

const CAPTURE_TARGET_PEAK = 0.35;
const CAPTURE_MAX_GAIN = 20;

/** Boost quiet loopback samples so transcription gets usable levels. */
export function boostQuietAudio(samples: Float32Array): Float32Array {
  if (samples.length === 0) return samples;
  const peak = peakAbs(samples);
  if (peak <= 0 || peak >= CAPTURE_TARGET_PEAK) return samples;

  const gain = Math.min(CAPTURE_MAX_GAIN, CAPTURE_TARGET_PEAK / peak);
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i] * gain;
    out[i] = v > 1 ? 1 : v < -1 ? -1 : v;
  }
  return out;
}

/** Remove leading/trailing silence so short callouts aren't padded with loopback gaps. */
export function trimSilenceEdges(
  samples: Float32Array,
  sampleRate: number,
  threshold = 0.006,
  padMs = 100
): Float32Array {
  if (samples.length === 0) return samples;

  const frame = Math.max(256, Math.floor(sampleRate * 0.02));
  const pad = Math.floor(sampleRate * (padMs / 1000));
  let start = 0;
  let end = samples.length;

  const frameRms = (from: number): number => {
    const slice = samples.subarray(from, Math.min(from + frame, samples.length));
    if (slice.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < slice.length; i++) sum += slice[i] * slice[i];
    return Math.sqrt(sum / slice.length);
  };

  for (let i = 0; i < samples.length; i += frame) {
    if (frameRms(i) >= threshold) {
      start = Math.max(0, i - pad);
      break;
    }
  }
  for (let i = samples.length - frame; i >= 0; i -= frame) {
    if (frameRms(i) >= threshold) {
      end = Math.min(samples.length, i + frame + pad);
      break;
    }
  }

  if (end <= start + frame) return samples;
  return samples.slice(start, end);
}

/** Minimum capture duration (seconds) before sending to Whisper. */
export function minTranscribeSeconds(peak: number, rms: number): number {
  // Slightly below 0.8s for faster demo; loopback still needs ~0.65s+ for Whisper.
  if (peak >= 0.15 || rms >= 0.06) return 0.65;
  if (peak >= 0.08 || rms >= 0.04) return 0.78;
  if (peak >= 0.04) return 0.9;
  return 1.05;
}

/** Keep the loudest ~1s window — loopback buffers often repeat the same callout. */
export function extractLoudestWindow(
  samples: Float32Array,
  sampleRate: number,
  windowSec = 1.0
): Float32Array {
  const win = Math.floor(sampleRate * windowSec);
  if (samples.length <= win) return samples;

  let bestStart = 0;
  let bestRms = -1;
  const step = Math.max(256, Math.floor(sampleRate * 0.04));
  for (let i = 0; i <= samples.length - win; i += step) {
    const slice = samples.subarray(i, i + win);
    let sum = 0;
    for (let j = 0; j < slice.length; j++) sum += slice[j] * slice[j];
    const rms = Math.sqrt(sum / slice.length);
    if (rms > bestRms) {
      bestRms = rms;
      bestStart = i;
    }
  }
  return samples.slice(bestStart, bestStart + win);
}
