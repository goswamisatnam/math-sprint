"use client";

import { useEffect, useRef } from "react";
import { isArithmetic, type QuizQuestion } from "@/lib/quizTypes";
import { scoreQuestions } from "@/lib/scoring";
import { playEncouraging, playFanfare } from "@/lib/sound";
import { BADGES, type BadgeId } from "@/lib/achievements";
import Confetti from "./Confetti";
import QuestionBreakdownList, {
  type BreakdownItem,
} from "./QuestionBreakdownList";

const CELEBRATION_THRESHOLD_PCT = 80;

interface ResultsScreenProps {
  questions: QuizQuestion[];
  onRestart: () => void;
  onViewHistory?: () => void;
  newBadgeIds?: string[];
}

function toBreakdownItems(questions: QuizQuestion[]): BreakdownItem[] {
  return questions.map((q) =>
    isArithmetic(q)
      ? {
          kind: "arithmetic",
          promptText: q.text,
          correctAnswer: q.answer,
          userAnswer: q.userAnswer,
          parts: null,
          userAnswerParts: null,
        }
      : {
          kind: "word",
          promptText: q.prompt,
          correctAnswer: null,
          userAnswer: null,
          parts: q.parts,
          userAnswerParts: q.userAnswerParts,
        },
  );
}

export default function ResultsScreen({
  questions,
  onRestart,
  onViewHistory,
  newBadgeIds = [],
}: ResultsScreenProps) {
  const { earned, total } = scoreQuestions(questions);
  const pct = Math.round((earned / total) * 100);
  const celebrate = pct >= CELEBRATION_THRESHOLD_PCT;
  const badgeSoundPlayedRef = useRef(false);

  let tagline = "Nice effort out there!";
  if (pct === 100) tagline = "Photo finish — a perfect score!";
  else if (pct >= 80) tagline = "Strong sprint — just a few laps to sharpen.";
  else if (pct >= 50) tagline = "Good pace — keep training those laps.";
  else tagline = "Good start — practice will build your speed.";

  useEffect(() => {
    if (celebrate) {
      playFanfare();
    } else {
      playEncouraging();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (newBadgeIds.length > 0 && !badgeSoundPlayedRef.current) {
      badgeSoundPlayedRef.current = true;
      playFanfare();
    }
  }, [newBadgeIds]);

  return (
    <div className="screen-fade">
      {(celebrate || newBadgeIds.length > 0) && <Confetti />}
      <div className="flex justify-center my-2 mb-1.5">
        <div className="w-[150px] h-[150px] rounded-full bg-navy flex flex-col items-center justify-center text-white shadow-[0_14px_26px_rgba(23,33,59,0.25)] border-[6px] border-lane-yellow">
          <div className="font-timer font-bold text-[32px]">
            {earned}/{total}
          </div>
          <div className="text-[11px] uppercase tracking-[0.1em] opacity-75 mt-1">
            final score
          </div>
        </div>
      </div>
      <p className="text-center my-3.5 mb-5.5 text-navy-soft text-sm">
        {tagline} ({pct}%)
      </p>

      {newBadgeIds.length > 0 && (
        <div className="card px-5.5 py-4.5 mb-5.5 text-center">
          <p className="eyebrow mb-2">New badge{newBadgeIds.length > 1 ? "s" : ""} earned!</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {newBadgeIds.map((id) => {
              const badge = BADGES[id as BadgeId];
              if (!badge) return null;
              return (
                <div key={id} className="flex flex-col items-center">
                  <span className="text-3xl leading-none mb-1">{badge.emoji}</span>
                  <span className="text-xs font-display font-bold text-navy">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <QuestionBreakdownList items={toBreakdownItems(questions)} />

      <div className="mt-5.5 flex flex-col gap-2.5">
        <button className="btn" onClick={onRestart}>
          Run it back →
        </button>
        {onViewHistory && (
          <button className="btn secondary" onClick={onViewHistory}>
            View my history
          </button>
        )}
      </div>
    </div>
  );
}
