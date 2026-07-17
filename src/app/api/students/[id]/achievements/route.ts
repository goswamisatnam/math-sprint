import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAchievements, type AchievementTestRunInput } from "@/lib/achievements";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const runs = await prisma.testRun.findMany({
    where: { studentId: id },
    orderBy: { startedAt: "desc" },
    include: { questions: true },
  });

  const input: AchievementTestRunInput[] = runs.map((run) => ({
    startedAt: run.startedAt,
    scoreEarned: run.scoreEarned,
    scoreTotal: run.scoreTotal,
    totalQuestions: run.totalQuestions,
    questions: run.questions.map((q) => ({
      kind: q.kind,
      timeLimitSec: q.timeLimitSec,
      timeSpentSec: q.timeSpentSec,
      correctAnswer: q.correctAnswer,
      userAnswer: q.userAnswer,
      answerParts: q.answerParts,
      userAnswerParts: q.userAnswerParts,
    })),
  }));

  const result = computeAchievements(input);
  return NextResponse.json(result);
}
