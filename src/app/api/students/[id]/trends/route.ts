import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ARITHMETIC_TYPES = ["add", "sub", "mul", "div"] as const;
type ArithmeticType = (typeof ARITHMETIC_TYPES)[number];

interface OpStat {
  correct: number;
  total: number;
  timeSpentSum: number;
  timeSpentCount: number;
}

export interface TrendPoint {
  testRunId: string;
  startedAt: string;
  level: string;
  ops: Record<ArithmeticType, { accuracyPct: number | null; avgTimeSec: number | null; count: number }>;
  wordProblems: { accuracyPct: number | null; avgTimeSec: number | null; count: number };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const testRuns = await prisma.testRun.findMany({
    where: { studentId: id },
    orderBy: { startedAt: "asc" },
    include: { questions: true },
  });

  const points: TrendPoint[] = testRuns.map((run) => {
    const opStats: Record<ArithmeticType, OpStat> = {
      add: { correct: 0, total: 0, timeSpentSum: 0, timeSpentCount: 0 },
      sub: { correct: 0, total: 0, timeSpentSum: 0, timeSpentCount: 0 },
      mul: { correct: 0, total: 0, timeSpentSum: 0, timeSpentCount: 0 },
      div: { correct: 0, total: 0, timeSpentSum: 0, timeSpentCount: 0 },
    };
    const wordStat: OpStat = { correct: 0, total: 0, timeSpentSum: 0, timeSpentCount: 0 };

    for (const q of run.questions) {
      if (q.kind === "arithmetic" && ARITHMETIC_TYPES.includes(q.type as ArithmeticType)) {
        const stat = opStats[q.type as ArithmeticType];
        stat.total += 1;
        if (q.userAnswer !== null && q.userAnswer === q.correctAnswer) {
          stat.correct += 1;
        }
        if (q.timeSpentSec !== null) {
          stat.timeSpentSum += q.timeSpentSec;
          stat.timeSpentCount += 1;
        }
      } else if (q.kind === "word") {
        const parts = (q.answerParts as { label: string; answer: number }[] | null) ?? [];
        const userParts = (q.userAnswerParts as (number | null)[] | null) ?? [];
        wordStat.total += parts.length;
        parts.forEach((part, i) => {
          if (userParts[i] === part.answer) wordStat.correct += 1;
        });
        if (q.timeSpentSec !== null) {
          wordStat.timeSpentSum += q.timeSpentSec;
          wordStat.timeSpentCount += 1;
        }
      }
    }

    function toSummary(stat: OpStat) {
      return {
        accuracyPct: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null,
        avgTimeSec:
          stat.timeSpentCount > 0
            ? Math.round((stat.timeSpentSum / stat.timeSpentCount) * 10) / 10
            : null,
        count: stat.total,
      };
    }

    return {
      testRunId: run.id,
      startedAt: run.startedAt.toISOString(),
      level: run.level,
      ops: {
        add: toSummary(opStats.add),
        sub: toSummary(opStats.sub),
        mul: toSummary(opStats.mul),
        div: toSummary(opStats.div),
      },
      wordProblems: toSummary(wordStat),
    };
  });

  return NextResponse.json(points);
}
