import { isArithmetic, type QuizQuestion } from "./quizTypes";

export function scoreQuestions(questions: QuizQuestion[]) {
  let earned = 0;
  let total = 0;
  for (const q of questions) {
    if (isArithmetic(q)) {
      total += 1;
      if (q.userAnswer !== null && q.userAnswer === q.answer) earned += 1;
    } else {
      total += q.parts.length;
      q.parts.forEach((part, i) => {
        if (q.userAnswerParts[i] !== null && q.userAnswerParts[i] === part.answer) {
          earned += 1;
        }
      });
    }
  }
  return { earned, total };
}
