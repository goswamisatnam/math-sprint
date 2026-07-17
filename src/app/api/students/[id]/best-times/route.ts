import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Level } from "@/lib/questionGenerator";

const ARITHMETIC_TYPES = ["add", "sub", "mul", "div"] as const;
type ArithmeticType = (typeof ARITHMETIC_TYPES)[number];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const level = req.nextUrl.searchParams.get("level") as Level | null;

  if (!level) {
    return NextResponse.json({ error: "level query param is required" }, { status: 400 });
  }

  const testRuns = await prisma.testRun.findMany({
    where: { studentId: id, level },
    select: {
      id: true,
      questions: {
        where: { kind: "arithmetic", timeSpentSec: { not: null } },
        select: { type: true, timeSpentSec: true },
      },
    },
  });

  // per-testRun, per-op average time, then take the minimum average across test runs
  const bestByOp: Partial<Record<ArithmeticType, number>> = {};

  for (const run of testRuns) {
    const sums: Record<string, { sum: number; count: number }> = {};
    for (const q of run.questions) {
      if (!ARITHMETIC_TYPES.includes(q.type as ArithmeticType)) continue;
      sums[q.type] ??= { sum: 0, count: 0 };
      sums[q.type].sum += q.timeSpentSec as number;
      sums[q.type].count += 1;
    }
    for (const [type, { sum, count }] of Object.entries(sums)) {
      if (count === 0) continue;
      const avg = sum / count;
      const key = type as ArithmeticType;
      if (bestByOp[key] === undefined || avg < bestByOp[key]!) {
        bestByOp[key] = avg;
      }
    }
  }

  return NextResponse.json(bestByOp);
}
