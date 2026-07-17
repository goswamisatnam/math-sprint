export type BadgeId =
  | "perfect_score"
  | "speed_demon"
  | "streak_3"
  | "streak_7"
  | "century_club"
  | "word_wizard";

export interface BadgeDef {
  id: BadgeId;
  label: string;
  emoji: string;
  description: string;
}

export const BADGES: Record<BadgeId, BadgeDef> = {
  perfect_score: {
    id: "perfect_score",
    label: "Perfect Score",
    emoji: "🏆",
    description: "Score 100% on a test",
  },
  speed_demon: {
    id: "speed_demon",
    label: "Speed Demon",
    emoji: "⚡",
    description: "Average under half the time limit on a test",
  },
  streak_3: {
    id: "streak_3",
    label: "3-Day Streak",
    emoji: "🔥",
    description: "Complete a test 3 days in a row",
  },
  streak_7: {
    id: "streak_7",
    label: "7-Day Streak",
    emoji: "🔥🔥",
    description: "Complete a test 7 days in a row",
  },
  century_club: {
    id: "century_club",
    label: "Century Club",
    emoji: "💯",
    description: "Answer 100 questions total",
  },
  word_wizard: {
    id: "word_wizard",
    label: "Word Wizard",
    emoji: "🧠",
    description: "Get every word problem part correct in one test",
  },
};

const SPEED_DEMON_RATIO = 0.5;

export interface AchievementTestRunInput {
  startedAt: Date;
  scoreEarned: number;
  scoreTotal: number;
  totalQuestions: number;
  questions: {
    kind: "arithmetic" | "word";
    timeLimitSec: number;
    timeSpentSec: number | null;
    correctAnswer: number | null;
    userAnswer: number | null;
    answerParts: unknown;
    userAnswerParts: unknown;
  }[];
}

function isPerfectScore(run: AchievementTestRunInput): boolean {
  return run.scoreTotal > 0 && run.scoreEarned === run.scoreTotal;
}

function isSpeedDemon(run: AchievementTestRunInput): boolean {
  const arithmetic = run.questions.filter(
    (q) => q.kind === "arithmetic" && q.timeSpentSec !== null,
  );
  if (arithmetic.length === 0) return false;
  const avgRatio =
    arithmetic.reduce((sum, q) => sum + (q.timeSpentSec as number) / q.timeLimitSec, 0) /
    arithmetic.length;
  return avgRatio <= SPEED_DEMON_RATIO;
}

function isWordWizard(run: AchievementTestRunInput): boolean {
  const wordQuestions = run.questions.filter((q) => q.kind === "word");
  if (wordQuestions.length === 0) return false;
  return wordQuestions.every((q) => {
    const parts = (q.answerParts as { label: string; answer: number }[] | null) ?? [];
    const userParts = (q.userAnswerParts as (number | null)[] | null) ?? [];
    if (parts.length === 0) return false;
    return parts.every((part, i) => userParts[i] === part.answer);
  });
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeCurrentStreak(runs: { startedAt: Date }[]): number {
  if (runs.length === 0) return 0;

  const uniqueDays = Array.from(new Set(runs.map((r) => dateKey(r.startedAt)))).sort(
    (a, b) => (a < b ? 1 : -1),
  );

  const today = new Date();
  const todayKey = dateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);

  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) {
    return 0;
  }

  let streak = 1;
  let cursor = new Date(uniqueDays[0]);
  for (let i = 1; i < uniqueDays.length; i++) {
    const expected = new Date(cursor);
    expected.setDate(expected.getDate() - 1);
    if (dateKey(expected) === uniqueDays[i]) {
      streak++;
      cursor = expected;
    } else {
      break;
    }
  }
  return streak;
}

export interface AchievementsResult {
  streak: number;
  totalQuestionsAnswered: number;
  earnedBadgeIds: BadgeId[];
}

export function computeAchievements(
  runs: AchievementTestRunInput[],
): AchievementsResult {
  const streak = computeCurrentStreak(runs);
  const totalQuestionsAnswered = runs.reduce((sum, r) => sum + r.totalQuestions, 0);

  const earned = new Set<BadgeId>();
  for (const run of runs) {
    if (isPerfectScore(run)) earned.add("perfect_score");
    if (isSpeedDemon(run)) earned.add("speed_demon");
    if (isWordWizard(run)) earned.add("word_wizard");
  }
  if (streak >= 3) earned.add("streak_3");
  if (streak >= 7) earned.add("streak_7");
  if (totalQuestionsAnswered >= 100) earned.add("century_club");

  return {
    streak,
    totalQuestionsAnswered,
    earnedBadgeIds: Array.from(earned),
  };
}
