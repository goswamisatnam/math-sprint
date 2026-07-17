"use client";

import { useState } from "react";
import { initSoundPreference, isMuted, setMuted } from "@/lib/sound";

function readInitialMuted(): boolean {
  if (typeof window === "undefined") return false;
  initSoundPreference();
  return isMuted();
}

export default function SoundToggle() {
  const [muted, setMutedState] = useState(readInitialMuted);

  function toggle() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      suppressHydrationWarning
      className="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-chalk border-2 border-line flex items-center justify-center text-lg shadow-[var(--shadow)] cursor-pointer"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
