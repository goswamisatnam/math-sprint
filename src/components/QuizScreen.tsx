"use client";

import { useEffect, useRef, useState } from "react";
import CircularTimer from "./CircularTimer";
import { OP_LABEL, OP_SYMBOL, type ArithmeticType } from "@/lib/questionGenerator";
import { isArithmetic, type QuizQuestion } from "@/lib/quizTypes";

interface QuizScreenProps {
  questions: QuizQuestion[];
  currentIndex: number;
  level: string;
  onCommitAndAdvance: (
    index: number,
    answer: { userAnswer?: number | null; userAnswerParts?: (number | null)[] },
    isTimeout: boolean,
    timeSpentSec: number,
  ) => void;
}

const WORD_PROBLEM_BADGE = "Word Problem";

export default function QuizScreen(props: QuizScreenProps) {
  // Remount the question body whenever the lap changes so each question
  // starts with fresh timer/input state without resetting it in an effect.
  return (
    <QuizQuestionBody
      key={props.currentIndex}
      {...props}
    />
  );
}

function QuizQuestionBody({
  questions,
  currentIndex,
  level,
  onCommitAndAdvance,
}: QuizScreenProps) {
  const q = questions[currentIndex];
  const timeLimit = q.timeLimitSec;
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const [singleValue, setSingleValue] = useState(() =>
    isArithmetic(q) && q.userAnswer !== null ? String(q.userAnswer) : "",
  );
  const [partValues, setPartValues] = useState<string[]>(() =>
    !isArithmetic(q)
      ? q.userAnswerParts.map((v) => (v !== null ? String(v) : ""))
      : [],
  );
  const startedAtRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      submit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function elapsedSeconds(): number {
    return Math.min(
      timeLimit,
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
  }

  function submit(isTimeout: boolean) {
    const spent = elapsedSeconds();
    if (isArithmetic(q)) {
      const trimmed = singleValue.trim();
      onCommitAndAdvance(
        currentIndex,
        { userAnswer: trimmed === "" ? null : parseInt(trimmed, 10) },
        isTimeout,
        spent,
      );
    } else {
      const parts = partValues.map((v) =>
        v.trim() === "" ? null : parseInt(v.trim(), 10),
      );
      onCommitAndAdvance(currentIndex, { userAnswerParts: parts }, isTimeout, spent);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit(false);
  }

  return (
    <div className="screen-fade">
      <div className="flex items-center justify-between mb-4">
        <div className="font-display font-bold text-[15px] text-navy-soft tracking-[0.04em]">
          LAP <b className="text-track-red text-[17px]">{currentIndex + 1}</b>/
          {questions.length}
        </div>
        <div className="font-display font-bold text-[15px] text-navy-soft tracking-[0.04em]">
          {level.toUpperCase()}
        </div>
      </div>

      <LaneTrack questions={questions} currentIndex={currentIndex} />

      <div className="flex justify-center my-1.5 mb-5.5">
        <CircularTimer secondsLeft={secondsLeft} totalSeconds={timeLimit} />
      </div>

      <div className="card px-6.5 pt-6.5 pb-6 text-center">
        {isArithmetic(q) ? (
          <>
            <div className="q-op-badge inline-flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-[0.08em] text-navy-soft bg-cream rounded-full py-1 px-3 mb-3.5">
              {OP_LABEL[q.type as ArithmeticType]}
            </div>
            <div className="font-display font-bold text-[clamp(30px,7vw,42px)] text-navy mb-5.5 tracking-[0.01em]">
              {q.text} = ?
            </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="answer-input mb-4.5"
              placeholder="Your answer"
              autoComplete="off"
              value={singleValue}
              onChange={(e) => setSingleValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </>
        ) : (
          <>
            <div className="q-op-badge inline-flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-[0.08em] text-navy-soft bg-cream rounded-full py-1 px-3 mb-3.5">
              {WORD_PROBLEM_BADGE}
            </div>
            <div className="font-body text-left text-[17px] leading-relaxed text-navy mb-5">
              {q.prompt}
            </div>
            <div className="flex flex-col gap-3 mb-4.5">
              {q.parts.map((part, i) => (
                <div key={i} className="text-left">
                  <label className="text-[12px] text-navy-soft font-display font-semibold block mb-1">
                    {part.label}
                  </label>
                  <input
                    ref={i === 0 ? inputRef : undefined}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="answer-input"
                    placeholder="?"
                    autoComplete="off"
                    value={partValues[i] ?? ""}
                    onChange={(e) => {
                      const next = [...partValues];
                      next[i] = e.target.value;
                      setPartValues(next);
                    }}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2.5">
          <button className="btn" onClick={() => submit(false)}>
            Submit &amp; next lap →
          </button>
        </div>
        <p className="text-center text-xs text-navy-soft mt-3.5">
          Press Enter to submit. Timer auto-submits whatever you&apos;ve
          typed.
        </p>
      </div>
    </div>
  );
}

function LaneTrack({
  questions,
  currentIndex,
}: {
  questions: QuizQuestion[];
  currentIndex: number;
}) {
  return (
    <div className="flex gap-[3px] mb-5">
      {questions.map((q, i) => {
        let bg = "bg-line";
        if (q.status === "answered") bg = "bg-track-red";
        else if (q.status === "timeout") bg = "bg-lane-yellow";
        const current = i === currentIndex;
        return (
          <div
            key={i}
            className={`flex-1 h-2 rounded ${bg} ${
              current ? "outline outline-2 outline-navy outline-offset-2" : ""
            }`}
          />
        );
      })}
    </div>
  );
}

export { OP_SYMBOL };
