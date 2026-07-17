-- CreateEnum
CREATE TYPE "Level" AS ENUM ('easy', 'medium', 'complex');

-- CreateEnum
CREATE TYPE "QuestionKind" AS ENUM ('arithmetic', 'word');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('answered', 'timeout', 'pending');

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "scoreEarned" INTEGER NOT NULL,
    "scoreTotal" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,

    CONSTRAINT "TestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "kind" "QuestionKind" NOT NULL,
    "type" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "timeLimitSec" INTEGER NOT NULL,
    "timeSpentSec" INTEGER,
    "status" "QuestionStatus" NOT NULL,
    "correctAnswer" INTEGER,
    "userAnswer" INTEGER,
    "answerParts" JSONB,
    "userAnswerParts" JSONB,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_name_key" ON "Student"("name");

-- CreateIndex
CREATE INDEX "TestRun_studentId_idx" ON "TestRun"("studentId");

-- CreateIndex
CREATE INDEX "Question_testRunId_idx" ON "Question"("testRunId");

-- AddForeignKey
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
