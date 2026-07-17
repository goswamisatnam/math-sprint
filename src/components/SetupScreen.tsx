"use client";

import { useState } from "react";
import type { Level } from "@/lib/questionGenerator";

interface SetupScreenProps {
  onStart: (level: Level) => void;
}

const LEVELS: { id: Level; label: string; sub: string }[] = [
  { id: "easy", label: "Easy", sub: "Warm-up numbers" },
  { id: "medium", label: "Medium", sub: "Race pace" },
  { id: "complex", label: "Complex", sub: "Full sprint" },
];

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [level, setLevel] = useState<Level>("medium");

  return (
    <div className="screen-fade">
      <div className="text-center px-1 pt-3.5 pb-6.5">
        <p className="eyebrow">5th Grade Speed Drill</p>
        <h1 className="text-[44px] m-0 mb-1 text-navy">
          MATH <span className="text-track-red">SPRINT</span>
        </h1>
        <p className="m-0 text-navy-soft text-[15px]">
          20 questions. Beat the clock, not just the problem.
        </p>
      </div>

      <div className="card px-6 pt-6.5 pb-7">
        <h3 className="text-[15px] uppercase tracking-[0.08em] mb-3.5 text-navy">
          Choose your pace
        </h3>
        <div className="flex gap-2.5 mb-6">
          {LEVELS.map((l) => (
            <div
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={`flex-1 text-center py-3.5 px-2 rounded-[14px] border-2 cursor-pointer select-none transition-all ${
                level === l.id
                  ? "border-track-red bg-[#FFF3EE] shadow-[inset_0_0_0_1px_var(--track-red)]"
                  : "border-line bg-cream"
              }`}
            >
              <span
                className={`font-display font-bold text-lg block ${
                  level === l.id ? "text-track-red-deep" : "text-navy"
                }`}
              >
                {l.label}
              </span>
              <span className="text-[11px] text-navy-soft block mt-0.5">
                {l.sub}
              </span>
            </div>
          ))}
        </div>

        <h3 className="text-[15px] uppercase tracking-[0.08em] mb-3.5 text-navy">
          What&apos;s in this drill
        </h3>
        <div className="flex gap-2 mb-6 flex-wrap">
          <OpChip symbol="+" label="Addition" className="bg-track-red" />
          <OpChip symbol="−" label="Subtraction" className="bg-navy" />
          <OpChip symbol="×" label="Multiplication" className="bg-[#3D7A6B]" />
          <OpChip symbol="÷" label="Division" className="bg-[#7A4FA0]" />
          <OpChip symbol="?" label="Word problems" className="bg-[#B08900]" />
        </div>

        <div className="bg-cream border border-dashed border-line rounded-[14px] px-4 py-3.5 mb-6 text-[13px] text-navy-soft leading-relaxed">
          <b className="text-navy">Number sizes at &quot;Complex&quot;:</b> the
          toughest setting the ranges reach.
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-1 mt-1.5">
            <div>Add / Subtract</div>
            <div>up to 5 digits</div>
            <div>Multiply</div>
            <div>2 digits × 2 digits</div>
            <div>Divide</div>
            <div>4 digits ÷ 2 digits</div>
            <div>Word problems</div>
            <div>3 per test, 60s each</div>
            <div>Easy / Medium</div>
            <div>scaled-down versions of the same mix</div>
          </div>
        </div>

        <button className="btn" onClick={() => onStart(level)}>
          Start the race →
        </button>
      </div>
    </div>
  );
}

function OpChip({
  symbol,
  label,
  className,
}: {
  symbol: string;
  label: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-cream border border-line rounded-full py-1.5 px-3 text-[13px]">
      <span
        className={`w-5 h-5 rounded-[6px] flex items-center justify-center font-display font-bold text-[13px] text-white ${className}`}
      >
        {symbol}
      </span>
      {label}
    </div>
  );
}
