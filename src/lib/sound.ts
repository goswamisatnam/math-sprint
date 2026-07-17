"use client";

let audioCtx: AudioContext | null = null;
let muted = false;

const MUTE_STORAGE_KEY = "mathSprintMuted";

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function initSoundPreference() {
  if (typeof window === "undefined") return;
  muted = window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
  }
}

interface Tone {
  freq: number;
  startAt: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function playTones(tones: Tone[]) {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  for (const tone of tones) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = tone.type ?? "sine";
    osc.frequency.value = tone.freq;

    const peak = tone.gain ?? 0.15;
    const start = now + tone.startAt;
    const end = start + tone.duration;

    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

export function playCorrect() {
  playTones([
    { freq: 523.25, startAt: 0, duration: 0.12, type: "triangle" },
    { freq: 783.99, startAt: 0.09, duration: 0.16, type: "triangle" },
  ]);
}

export function playWrong() {
  playTones([{ freq: 180, startAt: 0, duration: 0.22, type: "sawtooth", gain: 0.12 }]);
}

export function playSubmit() {
  playTones([{ freq: 660, startAt: 0, duration: 0.06, type: "square", gain: 0.06 }]);
}

export function playTick() {
  playTones([{ freq: 880, startAt: 0, duration: 0.04, type: "square", gain: 0.05 }]);
}

export function playUrgentTick() {
  playTones([{ freq: 1100, startAt: 0, duration: 0.08, type: "square", gain: 0.09 }]);
}

export function playTimeout() {
  playTones([
    { freq: 220, startAt: 0, duration: 0.18, type: "sawtooth", gain: 0.1 },
    { freq: 165, startAt: 0.14, duration: 0.22, type: "sawtooth", gain: 0.1 },
  ]);
}

export function playFanfare() {
  playTones([
    { freq: 523.25, startAt: 0, duration: 0.14, type: "triangle" },
    { freq: 659.25, startAt: 0.12, duration: 0.14, type: "triangle" },
    { freq: 783.99, startAt: 0.24, duration: 0.14, type: "triangle" },
    { freq: 1046.5, startAt: 0.36, duration: 0.3, type: "triangle" },
  ]);
}

export function playEncouraging() {
  playTones([
    { freq: 392, startAt: 0, duration: 0.14, type: "triangle", gain: 0.1 },
    { freq: 440, startAt: 0.13, duration: 0.2, type: "triangle", gain: 0.1 },
  ]);
}
