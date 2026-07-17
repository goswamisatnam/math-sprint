"use client";

export interface BreakdownItem {
  kind: "arithmetic" | "word";
  promptText: string;
  correctAnswer: number | null;
  userAnswer: number | null;
  parts: { label: string; answer: number }[] | null;
  userAnswerParts: (number | null)[] | null;
}

export default function QuestionBreakdownList({
  items,
}: {
  items: BreakdownItem[];
}) {
  return (
    <div>
      {items.map((q, i) => {
        if (q.kind === "arithmetic") {
          const isCorrect =
            q.userAnswer !== null && q.userAnswer === q.correctAnswer;
          const userAnsText = q.userAnswer !== null ? q.userAnswer : "—";
          return (
            <div
              key={i}
              className={`flex items-center gap-3 py-3 px-3.5 rounded-xl border mb-2 ${
                isCorrect
                  ? "bg-success-soft border-[rgba(47,158,68,0.25)]"
                  : "bg-danger-soft border-[rgba(214,69,80,0.25)]"
              }`}
            >
              <div className="font-display font-bold text-sm text-navy-soft w-[22px]">
                {i + 1}
              </div>
              <div className="flex-1 font-display font-semibold text-base text-navy">
                {q.promptText} = ?
              </div>
              <div className="text-xs text-right">
                <span className="text-navy-soft">You: {userAnsText}</span>
                <br />
                <span
                  className={`font-bold ${
                    isCorrect ? "text-success" : "text-danger"
                  }`}
                >
                  Correct: {q.correctAnswer}
                </span>
              </div>
              <div
                className={`w-5 text-center font-bold ${
                  isCorrect ? "text-success" : "text-danger"
                }`}
              >
                {isCorrect ? "✓" : "✗"}
              </div>
            </div>
          );
        }

        const parts = q.parts ?? [];
        const userParts = q.userAnswerParts ?? [];
        const correctParts = parts.filter(
          (part, pi) => userParts[pi] === part.answer,
        ).length;
        const allCorrect = correctParts === parts.length;
        return (
          <div
            key={i}
            className={`py-3 px-3.5 rounded-xl border mb-2 ${
              allCorrect
                ? "bg-success-soft border-[rgba(47,158,68,0.25)]"
                : correctParts > 0
                  ? "bg-cream border-line"
                  : "bg-danger-soft border-[rgba(214,69,80,0.25)]"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="font-display font-bold text-sm text-navy-soft w-[22px]">
                {i + 1}
              </div>
              <div className="flex-1 font-display font-semibold text-base text-navy">
                Word problem
              </div>
              <div className="text-xs font-bold text-navy-soft">
                {correctParts}/{parts.length} parts
              </div>
            </div>
            <div className="text-sm text-navy-soft mb-2 pl-[34px]">
              {q.promptText}
            </div>
            <div className="pl-[34px] flex flex-col gap-1">
              {parts.map((part, pi) => {
                const userVal = userParts[pi] ?? null;
                const correct = userVal === part.answer;
                return (
                  <div key={pi} className="text-xs flex justify-between">
                    <span className="text-navy-soft">{part.label}</span>
                    <span>
                      <span className="text-navy-soft">
                        You: {userVal !== null ? userVal : "—"}
                      </span>{" "}
                      <span
                        className={`font-bold ${
                          correct ? "text-success" : "text-danger"
                        }`}
                      >
                        Correct: {part.answer}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
