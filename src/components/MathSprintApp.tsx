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
import type { AchievementsDto, BestTimesDto, StudentDto } from "@/lib/apiTypes";

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
  const [preTestBadgeIds, setPreTestBadgeIds] = useState<string[]>([]);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [bestTimes, setBestTimes] = useState<BestTimesDto>({});

  function handleSelectStudent(chosen: StudentDto) {
    setStudent(chosen);
    setScreen("setup");
    fetch(`/api/students/${chosen.id}/achievements`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AchievementsDto | null) => {
        setPreTestBadgeIds(data?.earnedBadgeIds ?? []);
      })
      .catch(() => setPreTestBadgeIds([]));
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
    setBestTimes({});
    if (student) {
      fetch(`/api/students/${student.id}/best-times?level=${chosenLevel}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: BestTimesDto | null) => setBestTimes(data ?? {}))
        .catch(() => setBestTimes({}));
    }
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
    setNewBadgeIds([]);
    fetch("/api/test-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: student?.name ?? "Default",
        level,
        questions,
      }),
    })
      .then(() => {
        if (!student) return null;
        return fetch(`/api/students/${student.id}/achievements`).then((res) =>
          res.ok ? res.json() : null,
        );
      })
      .then((data: AchievementsDto | null) => {
        if (!data) return;
        const fresh = data.earnedBadgeIds.filter(
          (id) => !preTestBadgeIds.includes(id),
        );
        setNewBadgeIds(fresh);
      })
      .catch((err) => {
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
      {screen === "setup" && (
        <SetupScreen student={student} onStart={handleStart} />
      )}
      {screen === "quiz" && questions.length > 0 && (
        <QuizScreen
          questions={questions}
          currentIndex={currentIndex}
          level={level}
          bestTimes={bestTimes}
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
          newBadgeIds={newBadgeIds}
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
