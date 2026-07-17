import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  toQuestionRecords,
  scoreQuestions,
  type SaveTestRunPayload,
} from "@/lib/testRunPayload";

const DEFAULT_STUDENT_NAME = "Default";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SaveTestRunPayload;

  if (!Array.isArray(body.questions) || body.questions.length === 0) {
    return NextResponse.json({ error: "No questions provided" }, { status: 400 });
  }

  const studentName = body.studentName?.trim() || DEFAULT_STUDENT_NAME;

  const student = await prisma.student.upsert({
    where: { name: studentName },
    update: {},
    create: { name: studentName },
  });

  const { earned, total } = scoreQuestions(body.questions);
  const records = toQuestionRecords(body.questions);

  const testRun = await prisma.testRun.create({
    data: {
      studentId: student.id,
      level: body.level,
      completedAt: new Date(),
      scoreEarned: earned,
      scoreTotal: total,
      totalQuestions: body.questions.length,
      questions: {
        create: records.map((r) => ({
          order: r.order,
          kind: r.kind,
          type: r.type,
          promptText: r.promptText,
          timeLimitSec: r.timeLimitSec,
          timeSpentSec: r.timeSpentSec,
          status: r.status,
          correctAnswer: r.correctAnswer,
          userAnswer: r.userAnswer,
          answerParts: r.answerParts ?? undefined,
          userAnswerParts: r.userAnswerParts ?? undefined,
        })),
      },
    },
    include: { questions: true },
  });

  return NextResponse.json({ testRunId: testRun.id, earned, total });
}
