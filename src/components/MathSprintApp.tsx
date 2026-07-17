"use client";

import { useState } from "react";
import SetupScreen from "./SetupScreen";
import QuizScreen from "./QuizScreen";
import ReviewScreen from "./ReviewScreen";
import ResultsScreen from "./ResultsScreen";
import { buildQuestionSet } from "@/lib/buildQuestionSet";
import { isArithmetic, type QuizQuestion } from "@/lib/quizTypes";
import type { Level } from "@/lib/questionGenerator";

type ScreenId = "setup" | "quiz" | "review" | "results";

export default function MathSprintApp() {
  const [screen, setScreen] = useState<ScreenId>("setup");
  const [level, setLevel] = useState<Level>("medium");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  function handleStart(chosenLevel: Level) {
    setLevel(chosenLevel);
    setQuestions(buildQuestionSet(chosenLevel));
    setCurrentIndex(0);
    setScreen("quiz");
  }

  function applyAnswer(
    list: QuizQuestion[],
    index: number,
    answer: { userAnswer?: number | null; userAnswerParts?: (number | null)[] },
    isTimeout: boolean,
    timeSpentSec: number | null,
  ): QuizQuestion[] {
    const next = list.slice();
    const q = next[index];
    if (isArithmetic(q)) {
      const val = answer.userAnswer ?? null;
      next[index] = {
        ...q,
        userAnswer: val,
        status: val === null ? (isTimeout ? "timeout" : "pending") : "answered",
        timeSpentSec: timeSpentSec ?? q.timeSpentSec,
      };
    } else {
      const parts = answer.userAnswerParts ?? q.userAnswerParts;
      const anyFilled = parts.some((p) => p !== null);
      next[index] = {
        ...q,
        userAnswerParts: parts,
        status: anyFilled ? "answered" : isTimeout ? "timeout" : "pending",
        timeSpentSec: timeSpentSec ?? q.timeSpentSec,
      };
    }
    return next;
  }

  function handleCommitAndAdvance(
    index: number,
    answer: { userAnswer?: number | null; userAnswerParts?: (number | null)[] },
    isTimeout: boolean,
    timeSpentSec: number,
  ) {
    setQuestions((prev) => {
      const next = applyAnswer(prev, index, answer, isTimeout, timeSpentSec);
      if (index + 1 < next.length) {
        setCurrentIndex(index + 1);
      } else {
        setScreen("review");
      }
      return next;
    });
  }

  function handleSaveAnswer(
    index: number,
    answer: { userAnswer?: number | null; userAnswerParts?: (number | null)[] },
  ) {
    setQuestions((prev) => applyAnswer(prev, index, answer, false, null));
  }

  function handleFinalSubmit() {
    setScreen("results");
    fetch("/api/test-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName: "Default", level, questions }),
    }).catch((err) => {
      console.error("Failed to save test run", err);
    });
  }

  function handleRestart() {
    setScreen("setup");
  }

  return (
    <div className="stage">
      {screen === "setup" && <SetupScreen onStart={handleStart} />}
      {screen === "quiz" && questions.length > 0 && (
        <QuizScreen
          questions={questions}
          currentIndex={currentIndex}
          level={level}
          onCommitAndAdvance={handleCommitAndAdvance}
        />
      )}
      {screen === "review" && (
        <ReviewScreen
          questions={questions}
          onSaveAnswer={handleSaveAnswer}
          onFinalSubmit={handleFinalSubmit}
        />
      )}
      {screen === "results" && (
        <ResultsScreen questions={questions} onRestart={handleRestart} />
      )}
    </div>
  );
}
