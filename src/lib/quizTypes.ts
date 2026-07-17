import type { ArithmeticQuestion } from "./questionGenerator";
import type { WordProblemQuestion } from "./wordProblemGenerator";

export type QuestionStatus = "pending" | "answered" | "timeout";

export type QuizQuestion =
  | (ArithmeticQuestion & {
      userAnswer: number | null;
      status: QuestionStatus;
      timeSpentSec: number | null;
    })
  | (WordProblemQuestion & {
      userAnswerParts: (number | null)[];
      status: QuestionStatus;
      timeSpentSec: number | null;
    });

export function isArithmetic(
  q: QuizQuestion,
): q is QuizQuestion & { kind: "arithmetic" } {
  return q.kind === "arithmetic";
}

export function isWordProblem(
  q: QuizQuestion,
): q is QuizQuestion & { kind: "word" } {
  return q.kind === "word";
}
