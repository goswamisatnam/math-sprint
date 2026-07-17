"use client";

import { useState } from "react";
import { OP_SYMBOL, type ArithmeticType } from "@/lib/questionGenerator";
import { isArithmetic, type QuizQuestion } from "@/lib/quizTypes";

interface ReviewScreenProps {
  questions: QuizQuestion[];
  onSaveAnswer: (
    index: number,
    answer: { userAnswer?: number | null; userAnswerParts?: (number | null)[] },
  ) => void;
  onFinalSubmit: () => void;
}

export default function ReviewScreen({
  questions,
  onSaveAnswer,
  onFinalSubmit,
}: ReviewScreenProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [singleValue, setSingleValue] = useState("");
  const [partValues, setPartValues] = useState<string[]>([]);

  const answered = questions.filter((q) => q.status === "answered").length;
  const skipped = questions.length - answered;

  function openEdit(index: number) {
    const q = questions[index];
    setEditingIndex(index);
    if (isArithmetic(q)) {
      setSingleValue(q.userAnswer !== null ? String(q.userAnswer) : "");
    } else {
      setPartValues(
        q.userAnswerParts.map((v) => (v !== null ? String(v) : "")),
      );
    }
  }

  function saveEdit() {
    if (editingIndex === null) return;
    const q = questions[editingIndex];
    if (isArithmetic(q)) {
      const trimmed = singleValue.trim();
      onSaveAnswer(editingIndex, {
        userAnswer: trimmed === "" ? null : parseInt(trimmed, 10),
      });
    } else {
      const parts = partValues.map((v) =>
        v.trim() === "" ? null : parseInt(v.trim(), 10),
      );
      onSaveAnswer(editingIndex, { userAnswerParts: parts });
    }
    setEditingIndex(null);
  }

  const editingQ = editingIndex !== null ? questions[editingIndex] : null;

  return (
    <div className="screen-fade">
      <div className="text-center mb-4.5">
        <h2 className="text-2xl m-0 mb-1">Review before you submit</h2>
        <p className="m-0 text-[13px] text-navy-soft">
          Tap any lap to revisit or change your answer.
        </p>
      </div>

      <div className="flex justify-between text-sm text-navy-soft mb-4.5 px-1">
        <span>
          Answered: <b className="text-navy">{answered}</b>/{questions.length}
        </span>
        <span>
          Skipped / timed out: <b className="text-navy">{skipped}</b>
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2.5 mb-5.5">
        {questions.map((q, i) => {
          const symbol = isArithmetic(q) ? OP_SYMBOL[q.type as ArithmeticType] : "?";
          let stateClasses = "border-line bg-cream";
          let dotClasses = "bg-line";
          if (q.status === "answered") {
            stateClasses = "border-success bg-success-soft";
            dotClasses = "bg-success";
          } else if (q.status === "timeout") {
            stateClasses = "border-lane-yellow bg-[#FFF7E6]";
            dotClasses = "bg-lane-yellow";
          }
          return (
            <div
              key={i}
              onClick={() => openEdit(i)}
              className={`aspect-square rounded-xl border-2 ${stateClasses} flex flex-col items-center justify-center cursor-pointer relative font-display font-bold transition-transform active:scale-95`}
            >
              <div
                className={`absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full ${dotClasses}`}
              />
              <div className="text-base text-navy">{i + 1}</div>
              <div className="text-[11px] text-navy-soft">{symbol}</div>
            </div>
          );
        })}
      </div>

      {editingQ && editingIndex !== null && (
        <div className="card px-5.5 pt-5.5 pb-5 mb-5">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-navy-soft uppercase tracking-[0.08em] font-semibold">
              Lap {editingIndex + 1}
            </span>
            <button
              className="link-btn"
              onClick={() => setEditingIndex(null)}
            >
              Close
            </button>
          </div>
          <div className="q-op-badge inline-flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-[0.08em] text-navy-soft bg-cream rounded-full py-1 px-3 mb-3.5">
            {isArithmetic(editingQ) ? editingQ.type.toUpperCase() : "WORD PROBLEM"}
          </div>
          {isArithmetic(editingQ) ? (
            <>
              <div className="font-display font-bold text-[clamp(24px,6vw,34px)] text-navy mb-4">
                {editingQ.text} = ?
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="answer-input mb-3.5"
                placeholder="Your answer"
                autoComplete="off"
                value={singleValue}
                onChange={(e) => setSingleValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              />
            </>
          ) : (
            <>
              <div className="text-left text-[15px] leading-relaxed text-navy mb-4">
                {editingQ.prompt}
              </div>
              <div className="flex flex-col gap-3 mb-3.5">
                {editingQ.parts.map((part, i) => (
                  <div key={i} className="text-left">
                    <label className="text-[12px] text-navy-soft font-display font-semibold block mb-1">
                      {part.label}
                    </label>
                    <input
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
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
          <button className="btn small" onClick={saveEdit}>
            Save answer
          </button>
        </div>
      )}

      <button className="btn" onClick={onFinalSubmit}>
        Submit final test
      </button>
    </div>
  );
}
