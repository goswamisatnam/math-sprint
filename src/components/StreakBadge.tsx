"use client";

import { useEffect, useState } from "react";
import type { AchievementsDto } from "@/lib/apiTypes";

export default function StreakBadge({ studentId }: { studentId: string }) {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/students/${studentId}/achievements`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AchievementsDto | null) => {
        if (!cancelled && data) setStreak(data.streak);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (!streak || streak < 1) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-display font-bold text-track-red-deep">
      🔥 {streak}
    </span>
  );
}
