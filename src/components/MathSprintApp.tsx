"use client";

import { useState } from "react";
import StudentPickerScreen from "./StudentPickerScreen";
import SetupScreen from "./SetupScreen";
import QuizScreen from "./QuizScreen";
import ReviewScreen from "./ReviewScreen";
import ResultsScreen from "./ResultsScreen";
import HistoryListScreen from "./HistoryListScreen";
import HistoryDetailScreen from "./HistoryDetailScreen";
import TrendsScreen from "./TrendsScreen";
import SoundToggle from "./SoundToggle";
import { buildQuestionSet } from "@/lib/buildQuestionSet";
import { isArithmetic, type QuizQuestion } from "@/lib/quizTypes";
import type { Level } from "@/lib/questionGenerator";
import type { StudentDto } from "@/lib/apiTypes";

type ScreenId =
  | "picker"
  | "setup"
  | "quiz"
  | "review"
  | "results"
  | "history-list"
  | "history-detail"
  | "trends";

export default function MathSprintApp() {
  const [screen, setScreen] = useState<ScreenId>("picker");
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [level, setLevel] = useState<Level>("medium");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [historyStudent, setHistoryStudent] = useState<StudentDto | null>(null);
  const [historyTestRunId, setHistoryTestRunId] = useState<string | null>(null);

  function handleSelectStudent(chosen: StudentDto) {
    setStudent(chosen);
    setScreen("setup");
  }

  function handleViewHistoryFromPicker(chosen: StudentDto) {
    setHistoryStudent(chosen);
    setScreen("history-list");
  }

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
      body: JSON.stringify({
        studentName: student?.name ?? "Default",
        level,
        questions,
      }),
    }).catch((err) => {
      console.error("Failed to save test run", err);
    });
  }

  function handleRestart() {
    setScreen("setup");
  }

  function handleViewHistoryFromResults() {
    if (student) {
      setHistoryStudent(student);
      setScreen("history-list");
    }
  }

  function handleBackFromHistoryList() {
    setHistoryStudent(null);
    setScreen("picker");
  }

  function handleOpenTestRun(testRunId: string) {
    setHistoryTestRunId(testRunId);
    setScreen("history-detail");
  }

  function handleBackFromHistoryDetail() {
    setHistoryTestRunId(null);
    setScreen("history-list");
  }

  function handleViewTrends() {
    setScreen("trends");
  }

  function handleBackFromTrends() {
    setScreen("history-list");
  }

  return (
    <div className="stage">
      <SoundToggle />
      {screen === "picker" && (
        <StudentPickerScreen
          onSelect={handleSelectStudent}
          onViewHistory={handleViewHistoryFromPicker}
        />
      )}
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
        <ResultsScreen
          questions={questions}
          onRestart={handleRestart}
          onViewHistory={student ? handleViewHistoryFromResults : undefined}
        />
      )}
      {screen === "history-list" && historyStudent && (
        <HistoryListScreen
          student={historyStudent}
          onBack={handleBackFromHistoryList}
          onOpenTestRun={handleOpenTestRun}
          onViewTrends={handleViewTrends}
        />
      )}
      {screen === "history-detail" && historyTestRunId && (
        <HistoryDetailScreen
          testRunId={historyTestRunId}
          onBack={handleBackFromHistoryDetail}
        />
      )}
      {screen === "trends" && historyStudent && (
        <TrendsScreen student={historyStudent} onBack={handleBackFromTrends} />
      )}
    </div>
  );
}
