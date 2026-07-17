"use client";

import { isArithmetic, type QuizQuestion } from "@/lib/quizTypes";
import { scoreQuestions } from "@/lib/scoring";

interface ResultsScreenProps {
  questions: QuizQuestion[];
  onRestart: () => void;
}

export default function ResultsScreen({
  questions,
  onRestart,
}: ResultsScreenProps) {
  const { earned, total } = scoreQuestions(questions);
  const pct = Math.round((earned / total) * 100);

  let tagline = "Nice effort out there!";
  if (pct === 100) tagline = "Photo finish — a perfect score!";
  else if (pct >= 80) tagline = "Strong sprint — just a few laps to sharpen.";
  else if (pct >= 50) tagline = "Good pace — keep training those laps.";
  else tagline = "Good start — practice will build your speed.";

  return (
    <div className="screen-fade">
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

      <div>
        {questions.map((q, i) => {
          if (isArithmetic(q)) {
            const isCorrect = q.userAnswer !== null && q.userAnswer === q.answer;
            const userAnsText = q.userAnswer !== null ? q.userAnswer : "—";
            return (
              <div
                key={i}
                className={`flex items-center gap-3 py-3 px-3.5 rounded-xl border mb-2 ${
                  isCorrect
                    ? "bg-success-soft border-[rgba(47,158,68,0.25)]"
                    : "bg-danger-soft border-[rgba(214,69,80,0.25)]"
                }`}
              >
                <div className="font-display font-bold text-sm text-navy-soft w-[22px]">
                  {i + 1}
                </div>
                <div className="flex-1 font-display font-semibold text-base text-navy">
                  {q.text} = ?
                </div>
                <div className="text-xs text-right">
                  <span className="text-navy-soft">You: {userAnsText}</span>
                  <br />
                  <span
                    className={`font-bold ${
                      isCorrect ? "text-success" : "text-danger"
                    }`}
                  >
                    Correct: {q.answer}
                  </span>
                </div>
                <div
                  className={`w-5 text-center font-bold ${
                    isCorrect ? "text-success" : "text-danger"
                  }`}
                >
                  {isCorrect ? "✓" : "✗"}
                </div>
              </div>
            );
          }

          const correctParts = q.parts.filter(
            (part, pi) => q.userAnswerParts[pi] === part.answer,
          ).length;
          const allCorrect = correctParts === q.parts.length;
          return (
            <div
              key={i}
              className={`py-3 px-3.5 rounded-xl border mb-2 ${
                allCorrect
                  ? "bg-success-soft border-[rgba(47,158,68,0.25)]"
                  : correctParts > 0
                    ? "bg-cream border-line"
                    : "bg-danger-soft border-[rgba(214,69,80,0.25)]"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="font-display font-bold text-sm text-navy-soft w-[22px]">
                  {i + 1}
                </div>
                <div className="flex-1 font-display font-semibold text-base text-navy">
                  Word problem
                </div>
                <div className="text-xs font-bold text-navy-soft">
                  {correctParts}/{q.parts.length} parts
                </div>
              </div>
              <div className="text-sm text-navy-soft mb-2 pl-[34px]">
                {q.prompt}
              </div>
              <div className="pl-[34px] flex flex-col gap-1">
                {q.parts.map((part, pi) => {
                  const userVal = q.userAnswerParts[pi];
                  const correct = userVal === part.answer;
                  return (
                    <div key={pi} className="text-xs flex justify-between">
                      <span className="text-navy-soft">{part.label}</span>
                      <span>
                        <span className="text-navy-soft">
                          You: {userVal !== null ? userVal : "—"}
                        </span>{" "}
                        <span
                          className={`font-bold ${
                            correct ? "text-success" : "text-danger"
                          }`}
                        >
                          Correct: {part.answer}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5.5">
        <button className="btn" onClick={onRestart}>
          Run it back →
        </button>
      </div>
    </div>
  );
}
