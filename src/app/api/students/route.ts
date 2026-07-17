import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { name?: string };
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const student = await prisma.student.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  return NextResponse.json(student, { status: 201 });
}
