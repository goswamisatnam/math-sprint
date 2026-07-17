import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const testRuns = await prisma.testRun.findMany({
    where: { studentId: id },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      level: true,
      startedAt: true,
      completedAt: true,
      scoreEarned: true,
      scoreTotal: true,
      totalQuestions: true,
    },
  });

  return NextResponse.json(testRuns);
}
