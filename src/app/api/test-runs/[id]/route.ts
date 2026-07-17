import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const testRun = await prisma.testRun.findUnique({
    where: { id },
    include: {
      student: true,
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!testRun) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(testRun);
}
