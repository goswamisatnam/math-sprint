"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ArithmeticOpKey,
  StudentDto,
  TrendPointDto,
} from "@/lib/apiTypes";
import { displayAvatar } from "@/lib/avatars";

interface TrendsScreenProps {
  student: StudentDto;
  onBack: () => void;
}

const OP_ORDER: ArithmeticOpKey[] = ["add", "sub", "mul", "div"];
const OP_LABEL: Record<ArithmeticOpKey, string> = {
  add: "Addition",
  sub: "Subtraction",
  mul: "Multiplication",
  div: "Division",
};
const OP_COLOR: Record<ArithmeticOpKey, string> = {
  add: "var(--series-add)",
  sub: "var(--series-sub)",
  mul: "var(--series-mul)",
  div: "var(--series-div)",
};

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface ChartRow {
  label: string;
  add?: number;
  sub?: number;
  mul?: number;
  div?: number;
}

function buildAccuracyRows(points: TrendPointDto[]): ChartRow[] {
  return points.map((p) => {
    const row: ChartRow = { label: formatDateShort(p.startedAt) };
    for (const op of OP_ORDER) {
      const stat = p.ops[op];
      if (stat.count > 0) row[op] = stat.accuracyPct ?? undefined;
    }
    return row;
  });
}

function buildTimeRows(points: TrendPointDto[]): ChartRow[] {
  return points.map((p) => {
    const row: ChartRow = { label: formatDateShort(p.startedAt) };
    for (const op of OP_ORDER) {
      const stat = p.ops[op];
      if (stat.count > 0) row[op] = stat.avgTimeSec ?? undefined;
    }
    return row;
  });
}

function computeWeakestArea(
  points: TrendPointDto[],
): { label: string; accuracyPct: number } | null {
  const RECENT_N = 5;
  const recent = points.slice(-RECENT_N);
  if (recent.length === 0) return null;

  const totals: Record<string, { correct: number; total: number }> = {};
  for (const p of recent) {
    for (const op of OP_ORDER) {
      const stat = p.ops[op];
      if (stat.count === 0) continue;
      const key = OP_LABEL[op];
      totals[key] ??= { correct: 0, total: 0 };
      totals[key].total += stat.count;
      totals[key].correct += Math.round((stat.accuracyPct ?? 0) * stat.count / 100);
    }
    if (p.wordProblems.count > 0) {
      totals["Word Problems"] ??= { correct: 0, total: 0 };
      totals["Word Problems"].total += p.wordProblems.count;
      totals["Word Problems"].correct += Math.round(
        ((p.wordProblems.accuracyPct ?? 0) * p.wordProblems.count) / 100,
      );
    }
  }

  let weakest: { label: string; accuracyPct: number } | null = null;
  for (const [label, { correct, total }] of Object.entries(totals)) {
    if (total === 0) continue;
    const pct = Math.round((correct / total) * 100);
    if (weakest === null || pct < weakest.accuracyPct) {
      weakest = { label, accuracyPct: pct };
    }
  }
  return weakest;
}

export default function TrendsScreen({ student, onBack }: TrendsScreenProps) {
  const [points, setPoints] = useState<TrendPointDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/students/${student.id}/trends`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load trends");
        return res.json();
      })
      .then((data: TrendPointDto[]) => setPoints(data))
      .catch(() => setError("Couldn't load progress trends. Try refreshing."));
  }, [student.id]);

  const weakest = points ? computeWeakestArea(points) : null;

  return (
    <div className="screen-fade">
      <div className="text-center mb-4.5">
        <p className="eyebrow">Progress Trends</p>
        <h2 className="text-2xl m-0 mb-1">
          <span className="mr-1.5">{displayAvatar(student.avatar)}</span>
          {student.name}&apos;s Speed Chart
        </h2>
        <p className="m-0 text-[13px] text-navy-soft">
          Accuracy and answer speed by operation, over time.
        </p>
      </div>

      {error && <p className="text-center text-danger text-sm mb-4">{error}</p>}

      {!error && points === null && (
        <p className="text-center text-navy-soft text-sm">Loading…</p>
      )}

      {points !== null && points.length === 0 && (
        <div className="card px-5.5 py-6 mb-5 text-center">
          <p className="text-[13px] text-navy-soft m-0">
            No completed tests yet for {student.name} — trends will show up
            after the first sprint.
          </p>
        </div>
      )}

      {points !== null && points.length > 0 && (
        <>
          {weakest && (
            <div className="card px-5.5 py-4.5 mb-5">
              <p className="eyebrow mb-1">Weakest area recently</p>
              <p className="m-0 font-display font-bold text-lg text-navy">
                {weakest.label}
                <span className="text-navy-soft font-semibold text-sm ml-2">
                  {weakest.accuracyPct}% accuracy (last {Math.min(points.length, 5)} tests)
                </span>
              </p>
            </div>
          )}

          <div className="card px-5 pt-5 pb-4 mb-5">
            <h3 className="text-[13px] uppercase tracking-[0.08em] mb-3 text-navy px-1">
              Accuracy % by operation
            </h3>
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buildAccuracyRows(points)} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--chart-ink-muted)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--chart-axis)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "var(--chart-ink-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--chalk)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "var(--navy-soft)" }}
                    formatter={(value: string) => OP_LABEL[value as ArithmeticOpKey] ?? value}
                  />
                  {OP_ORDER.map((op) => (
                    <Line
                      key={op}
                      type="monotone"
                      dataKey={op}
                      name={op}
                      stroke={OP_COLOR[op]}
                      strokeWidth={2}
                      dot={{ r: 4, stroke: "var(--chalk)", strokeWidth: 2, fill: OP_COLOR[op] }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card px-5 pt-5 pb-4 mb-5">
            <h3 className="text-[13px] uppercase tracking-[0.08em] mb-3 text-navy px-1">
              Avg time-to-answer (seconds) by operation
            </h3>
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buildTimeRows(points)} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--chart-ink-muted)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--chart-axis)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--chart-ink-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--chalk)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value}s`, ""]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "var(--navy-soft)" }}
                    formatter={(value: string) => OP_LABEL[value as ArithmeticOpKey] ?? value}
                  />
                  {OP_ORDER.map((op) => (
                    <Line
                      key={op}
                      type="monotone"
                      dataKey={op}
                      name={op}
                      stroke={OP_COLOR[op]}
                      strokeWidth={2}
                      dot={{ r: 4, stroke: "var(--chalk)", strokeWidth: 2, fill: OP_COLOR[op] }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <button className="btn secondary" onClick={onBack}>
        ← Back to history
      </button>
    </div>
  );
}
