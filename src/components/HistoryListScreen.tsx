"use client";

import { useEffect, useState } from "react";
import type { StudentDto, TestRunSummaryDto } from "@/lib/apiTypes";
import { displayAvatar } from "@/lib/avatars";

interface HistoryListScreenProps {
  student: StudentDto;
  onBack: () => void;
  onOpenTestRun: (testRunId: string) => void;
  onViewTrends: () => void;
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

export default function HistoryListScreen({
  student,
  onBack,
  onOpenTestRun,
  onViewTrends,
}: HistoryListScreenProps) {
  const [runs, setRuns] = useState<TestRunSummaryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/students/${student.id}/test-runs`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load history");
        return res.json();
      })
      .then((data: TestRunSummaryDto[]) => setRuns(data))
      .catch(() => setError("Couldn't load test history. Try refreshing."));
  }, [student.id]);

  return (
    <div className="screen-fade">
      <div className="text-center mb-4.5">
        <p className="eyebrow">Test History</p>
        <h2 className="text-2xl m-0 mb-1">
          <span className="mr-1.5">{displayAvatar(student.avatar)}</span>
          {student.name}&apos;s Laps
        </h2>
        <p className="m-0 text-[13px] text-navy-soft">
          Every completed sprint, most recent first.
        </p>
      </div>

      <div className="card px-5.5 pt-5.5 pb-6">
        {error && <p className="text-[13px] text-danger mb-3.5">{error}</p>}
        {runs === null && !error && (
          <p className="text-[13px] text-navy-soft">Loading…</p>
        )}
        {runs !== null && runs.length === 0 && (
          <p className="text-[13px] text-navy-soft">
            No completed tests yet for {student.name}.
          </p>
        )}
        {runs !== null && runs.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {runs.map((run) => {
              const pct =
                run.scoreTotal > 0
                  ? Math.round((run.scoreEarned / run.scoreTotal) * 100)
                  : 0;
              return (
                <div
                  key={run.id}
                  onClick={() => onOpenTestRun(run.id)}
                  className="flex items-center justify-between py-3 px-4 rounded-[14px] border-2 border-line bg-cream cursor-pointer transition-transform active:scale-[0.98]"
                >
                  <div>
                    <div className="font-display font-bold text-base text-navy">
                      {LEVEL_LABEL[run.level] ?? run.level}
                    </div>
                    <div className="text-xs text-navy-soft">
                      {formatDate(run.startedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-timer font-bold text-lg text-navy">
                      {run.scoreEarned}/{run.scoreTotal}
                    </div>
                    <div className="text-xs text-navy-soft">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {runs !== null && runs.length > 0 && (
          <button className="btn" onClick={onViewTrends}>
            View progress trends →
          </button>
        )}
        <button className="btn secondary" onClick={onBack}>
          ← Back to student picker
        </button>
      </div>
    </div>
  );
}
