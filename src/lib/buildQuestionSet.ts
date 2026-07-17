import { buildArithmeticSet, shuffle, type Level } from "./questionGenerator";
import { buildWordProblemSet } from "./wordProblemGenerator";
import type { QuizQuestion } from "./quizTypes";

const TOTAL_QUESTIONS = 20;
const WORD_PROBLEM_COUNT = 3;

export function buildQuestionSet(level: Level): QuizQuestion[] {
  const arithmeticCount = TOTAL_QUESTIONS - WORD_PROBLEM_COUNT;
  const arithmetic = buildArithmeticSet(level, arithmeticCount).map(
    (q) => ({ ...q, userAnswer: null, status: "pending" as const, timeSpentSec: null }),
  );
  const wordProblems = buildWordProblemSet(WORD_PROBLEM_COUNT).map((q) => ({
    ...q,
    userAnswerParts: new Array(q.parts.length).fill(null),
    status: "pending" as const,
    timeSpentSec: null,
  }));

  return shuffle([...arithmetic, ...wordProblems]);
}

export { TOTAL_QUESTIONS };
