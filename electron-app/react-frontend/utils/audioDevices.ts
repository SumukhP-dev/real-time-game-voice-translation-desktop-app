/** Prefer loopback output devices for game/system audio capture on Windows. */
export interface CaptureDevice {
  name: string;
  is_loopback?: boolean;
}

export function findPreferredCaptureDevice<T extends CaptureDevice>(
  devices: T[]
): T | undefined {
  if (!devices.length) return undefined;

  const loopback = devices.find((d) => d.is_loopback === true);
  if (loopback) return loopback;

  const stereoMix = devices.find((d) =>
    d.name.toLowerCase().includes("stereo mix")
  );
  if (stereoMix) return stereoMix;

  return devices[0];
}
