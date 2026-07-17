import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AVATAR_OPTIONS } from "@/lib/avatars";

export async function GET() {
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { name?: string; avatar?: string };
  const name = body.name?.trim();
  const avatar =
    body.avatar && (AVATAR_OPTIONS as readonly string[]).includes(body.avatar)
      ? body.avatar
      : undefined;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const student = await prisma.student.upsert({
    where: { name },
    update: avatar ? { avatar } : {},
    create: { name, avatar },
  });

  return NextResponse.json(student, { status: 201 });
}
