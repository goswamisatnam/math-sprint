"use client";

import { useEffect, useState } from "react";
import type { TestRunDetailDto } from "@/lib/apiTypes";
import { displayAvatar } from "@/lib/avatars";
import QuestionBreakdownList, {
  type BreakdownItem,
} from "./QuestionBreakdownList";

interface HistoryDetailScreenProps {
  testRunId: string;
  onBack: () => void;
}

const LEVEL_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  complex: "Complex",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toBreakdownItems(testRun: TestRunDetailDto): BreakdownItem[] {
  return testRun.questions.map((q) => ({
    kind: q.kind,
    promptText: q.promptText,
    correctAnswer: q.correctAnswer,
    userAnswer: q.userAnswer,
    parts: q.answerParts,
    userAnswerParts: q.userAnswerParts,
  }));
}

export default function HistoryDetailScreen({
  testRunId,
  onBack,
}: HistoryDetailScreenProps) {
  const [testRun, setTestRun] = useState<TestRunDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/test-runs/${testRunId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load test run");
        return res.json();
      })
      .then((data: TestRunDetailDto) => setTestRun(data))
      .catch(() => setError("Couldn't load this test. Try refreshing."));
  }, [testRunId]);

  if (error) {
    return (
      <div className="screen-fade">
        <p className="text-center text-danger text-sm mb-4">{error}</p>
        <button className="btn secondary" onClick={onBack}>
          ← Back to history
        </button>
      </div>
    );
  }

  if (!testRun) {
    return (
      <div className="screen-fade">
        <p className="text-center text-navy-soft text-sm">Loading…</p>
      </div>
    );
  }

  const pct =
    testRun.scoreTotal > 0
      ? Math.round((testRun.scoreEarned / testRun.scoreTotal) * 100)
      : 0;

  return (
    <div className="screen-fade">
      <div className="text-center mb-4.5">
        <p className="eyebrow">
          {LEVEL_LABEL[testRun.level] ?? testRun.level} · {formatDate(testRun.startedAt)}
        </p>
        <h2 className="text-2xl m-0">
          <span className="mr-1.5">{displayAvatar(testRun.student.avatar)}</span>
          {testRun.student.name}&apos;s Sprint
        </h2>
      </div>

      <div className="flex justify-center my-2 mb-5">
        <div className="w-[130px] h-[130px] rounded-full bg-navy flex flex-col items-center justify-center text-white shadow-[0_14px_26px_rgba(23,33,59,0.25)] border-[6px] border-lane-yellow">
          <div className="font-timer font-bold text-[26px]">
            {testRun.scoreEarned}/{testRun.scoreTotal}
          </div>
          <div className="text-[10px] uppercase tracking-[0.1em] opacity-75 mt-1">
            {pct}%
          </div>
        </div>
      </div>

      <QuestionBreakdownList items={toBreakdownItems(testRun)} />

      <div className="mt-5.5">
        <button className="btn secondary" onClick={onBack}>
          ← Back to history
        </button>
      </div>
    </div>
  );
}
