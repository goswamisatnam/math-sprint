import type { Level } from "./questionGenerator";
import type { QuizQuestion } from "./quizTypes";
import { isArithmetic } from "./quizTypes";
import { scoreQuestions } from "./scoring";

export interface SaveTestRunPayload {
  studentName: string;
  level: Level;
  questions: QuizQuestion[];
}

export interface QuestionRecordInput {
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

export function toQuestionRecords(
  questions: QuizQuestion[],
): QuestionRecordInput[] {
  return questions.map((q, i) => {
    if (isArithmetic(q)) {
      return {
        order: i,
        kind: "arithmetic",
        type: q.type,
        promptText: q.text,
        timeLimitSec: q.timeLimitSec,
        timeSpentSec: q.timeSpentSec,
        status: q.status,
        correctAnswer: q.answer,
        userAnswer: q.userAnswer,
        answerParts: null,
        userAnswerParts: null,
      };
    }
    return {
      order: i,
      kind: "word",
      type: q.templateId,
      promptText: q.prompt,
      timeLimitSec: q.timeLimitSec,
      timeSpentSec: q.timeSpentSec,
      status: q.status,
      correctAnswer: null,
      userAnswer: null,
      answerParts: q.parts,
      userAnswerParts: q.userAnswerParts,
    };
  });
}

export { scoreQuestions };
