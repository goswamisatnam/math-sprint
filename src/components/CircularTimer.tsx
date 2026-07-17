"use client";

const RADIUS = 54;
const CIRC = 2 * Math.PI * RADIUS;

interface CircularTimerProps {
  secondsLeft: number;
  totalSeconds: number;
}

export default function CircularTimer({
  secondsLeft,
  totalSeconds,
}: CircularTimerProps) {
  const clamped = Math.max(0, secondsLeft);
  const offset = Math.max(0, CIRC * (1 - clamped / totalSeconds));

  let arcColor = "var(--track-red)";
  let digitColor = "var(--navy)";
  let pulse = false;
  if (clamped <= 5) {
    arcColor = "var(--danger)";
    digitColor = "var(--danger)";
    pulse = true;
  } else if (clamped <= 10) {
    arcColor = "var(--lane-yellow)";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[132px] h-[132px]">
        <svg
          width="132"
          height="132"
          viewBox="0 0 132 132"
          className="-rotate-90"
        >
          <circle
            cx="66"
            cy="66"
            r={RADIUS}
            fill="none"
            stroke="var(--line)"
            strokeWidth="7"
          />
          <circle
            cx="66"
            cy="66"
            r={RADIUS}
            fill="none"
            stroke={arcColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s linear, stroke .3s ease",
            }}
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center font-timer font-bold text-[34px] ${
            pulse ? "animate-[pulse_1s_infinite]" : ""
          }`}
          style={{ color: digitColor }}
        >
          {clamped}
        </div>
      </div>
      <div className="text-[11px] uppercase tracking-[0.12em] mt-1 text-navy-soft">
        seconds left
      </div>
    </div>
  );
}
