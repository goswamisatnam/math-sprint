import type { Level } from "./questionGenerator";

export interface StudentDto {
  id: string;
  name: string;
  createdAt: string;
}

export interface TestRunSummaryDto {
  id: string;
  level: Level;
  startedAt: string;
  completedAt: string | null;
  scoreEarned: number;
  scoreTotal: number;
  totalQuestions: number;
}

export interface QuestionDto {
  id: string;
  order: number;
  kind: "arithmetic" | "word";
  type: string;
  promptText: string;
  timeLimitSec: number;
  timeSpentSec: number | null;
  status: "answered" | "timeout" | "pending";
  correctAnswer: number | null;
  userAnswer: number | null;
  answerParts: { label: string; answer: number }[] | null;
  userAnswerParts: (number | null)[] | null;
}

export interface TestRunDetailDto extends TestRunSummaryDto {
  student: StudentDto;
  questions: QuestionDto[];
}
