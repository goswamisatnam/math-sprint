"use client";

import { useEffect, useState } from "react";
import type { AchievementsDto } from "@/lib/apiTypes";
import { BADGES, type BadgeId } from "@/lib/achievements";

export default function BadgeShelf({ studentId }: { studentId: string }) {
  const [data, setData] = useState<AchievementsDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/students/${studentId}/achievements`)
      .then((res) => (res.ok ? res.json() : null))
      .then((result: AchievementsDto | null) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (!data) return null;

  const earned = new Set(data.earnedBadgeIds);
  const allBadgeIds = Object.keys(BADGES) as BadgeId[];

  return (
    <div className="card px-5.5 pt-5.5 pb-5 mb-5">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-[13px] uppercase tracking-[0.08em] text-navy m-0">
          Badges
        </h3>
        {data.streak > 0 && (
          <span className="text-xs font-display font-bold text-track-red-deep">
            🔥 {data.streak}-day streak
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {allBadgeIds.map((id) => {
          const badge = BADGES[id];
          const got = earned.has(id);
          return (
            <div
              key={id}
              title={badge.description}
              className={`flex flex-col items-center text-center py-3 px-2 rounded-[12px] border-2 ${
                got ? "border-lane-yellow bg-[#FFF7E6]" : "border-line bg-cream opacity-45"
              }`}
            >
              <span className="text-2xl leading-none mb-1">{badge.emoji}</span>
              <span className="text-[11px] font-display font-semibold text-navy leading-tight">
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
