/** Prefer loopback output devices for game/system audio capture. */

export interface CaptureDevice {

  name: string;

  channels: number;

  is_loopback?: boolean;

}



export type CaptureSource = "loopback" | "microphone";



function isLoopbackStyleDevice(device: CaptureDevice): boolean {

  const name = device.name.toLowerCase();

  return (

    device.is_loopback === true ||

    name.includes("loopback") ||

    name.includes("stereo mix")

  );

}



function isLikelyMicrophoneInput(device: CaptureDevice): boolean {

  const name = device.name.toLowerCase();

  return (

    name.includes("microphone array") ||

    name.includes("microphone (") ||

    (name.includes("microphone") && !name.includes("loopback"))

  );

}



/** Score game-audio (loopback) devices; higher is better. */

export function scoreGameAudioDevice(device: CaptureDevice): number {

  const name = device.name.toLowerCase();

  let score = 0;



  if (device.is_loopback === true) score += 100;

  if (name.includes("loopback")) score += 100;

  if (name.includes("stereo mix")) score += 90;

  if (device.channels >= 2) score += 25;

  if (name.includes("headphone") || name.includes("speaker")) score += 20;

  if (name.includes("headset") && !isLoopbackStyleDevice(device)) score -= 15;

  if (device.channels <= 1 && !isLoopbackStyleDevice(device)) score -= 40;

  if (isLikelyMicrophoneInput(device)) score -= 80;



  return score;

}



/** Devices shown for headphone/speaker (game audio) vs microphone capture. */

export function filterDevicesByCaptureSource<T extends CaptureDevice>(

  devices: T[],

  source: CaptureSource

): T[] {

  if (!devices.length) return devices;



  if (source === "loopback") {

    const loopbackDevices = devices.filter(isLoopbackStyleDevice);

    if (loopbackDevices.length > 0) return loopbackDevices;



    const outputLike = devices.filter(

      (d) =>

        !isLikelyMicrophoneInput(d) &&

        (d.channels >= 2 ||

          d.name.toLowerCase().includes("headphone") ||

          d.name.toLowerCase().includes("speaker"))

    );

    if (outputLike.length > 0) return outputLike;



    return [...devices].sort(

      (a, b) => scoreGameAudioDevice(b) - scoreGameAudioDevice(a)

    );

  }



  const microphones = devices.filter(

    (d) => !isLoopbackStyleDevice(d) || isLikelyMicrophoneInput(d)

  );

  return microphones.length > 0 ? microphones : devices;

}



export function findPreferredCaptureDevice<T extends CaptureDevice>(

  devices: T[]

): T | undefined {

  const candidates = filterDevicesByCaptureSource(devices, "loopback");

  if (!candidates.length) return undefined;



  return [...candidates].sort(

    (a, b) => scoreGameAudioDevice(b) - scoreGameAudioDevice(a)

  )[0];

}



export function findPreferredMicrophoneDevice<T extends CaptureDevice>(

  devices: T[]

): T | undefined {

  const filtered = filterDevicesByCaptureSource(devices, "microphone");

  return filtered[0];

}



export function isGameAudioDeviceSuitable(device: CaptureDevice): boolean {

  return scoreGameAudioDevice(device) >= 20;

}



export interface PlaybackDeviceLike {

  name: string;

}



/** Score playback devices; prefer virtual audio cables for game mic routing. */

export function scoreVirtualCableDevice(device: PlaybackDeviceLike): number {

  const name = device.name.toLowerCase();

  let score = 0;

  if (name.includes("cable input")) score += 100;

  if (name.includes("vb-audio") || name.includes("virtual cable")) score += 90;

  if (name.includes("voicemeeter")) score += 80;

  if (name.includes("virtual")) score += 40;

  if (name.includes("cable")) score += 30;

  return score;

}



export function findPreferredVirtualCableDevice<T extends PlaybackDeviceLike>(

  devices: T[]

): T | undefined {

  if (!devices.length) return undefined;

  return [...devices].sort(

    (a, b) => scoreVirtualCableDevice(b) - scoreVirtualCableDevice(a)

  )[0];

}



/** True when a VB-Audio / virtual cable playback device is present (CABLE Input). */

export function hasVirtualCablePlaybackDevice(

  devices: PlaybackDeviceLike[]

): boolean {

  return devices.some((d) => scoreVirtualCableDevice(d) >= 90);

}


