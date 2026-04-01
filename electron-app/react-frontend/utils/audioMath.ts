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
