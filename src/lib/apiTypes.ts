import type { Level } from "./questionGenerator";

export interface StudentDto {
  id: string;
  name: string;
  avatar: string | null;
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

export type ArithmeticOpKey = "add" | "sub" | "mul" | "div";

export interface OpSummaryDto {
  accuracyPct: number | null;
  avgTimeSec: number | null;
  count: number;
}

export interface TrendPointDto {
  testRunId: string;
  startedAt: string;
  level: string;
  ops: Record<ArithmeticOpKey, OpSummaryDto>;
  wordProblems: OpSummaryDto;
}

export interface AchievementsDto {
  streak: number;
  totalQuestionsAnswered: number;
  earnedBadgeIds: string[];
}

export type BestTimesDto = Partial<Record<ArithmeticOpKey, number>>;
