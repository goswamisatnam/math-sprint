export type WordProblemTemplateId = "ages" | "change" | "distance";

export interface WordProblemQuestion {
  kind: "word";
  templateId: WordProblemTemplateId;
  prompt: string;
  parts: { label: string; answer: number }[];
  timeLimitSec: number;
}

const TIME_PER_WORD_Q = 60;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Father is N years old; his 3 kids' ages sum with fixed gaps to N minus a base offset.
function genAges(): WordProblemQuestion {
  const gap1 = randInt(2, 5);
  const gap2 = randInt(2, 5);
  const youngest = randInt(4, 10);
  const middle = youngest + gap1;
  const oldest = middle + gap2;
  const parentAge = youngest + middle + oldest + randInt(15, 25);

  return {
    kind: "word",
    templateId: "ages",
    prompt:
      `A father is ${parentAge} years old. He has three kids. ` +
      `The oldest is ${gap2} years older than the middle child, and the middle child is ${gap1} years older than the youngest. ` +
      `The three kids' ages add up to ${youngest + middle + oldest}. How old is each kid?`,
    parts: [
      { label: "Youngest kid's age", answer: youngest },
      { label: "Middle kid's age", answer: middle },
      { label: "Oldest kid's age", answer: oldest },
    ],
    timeLimitSec: TIME_PER_WORD_Q,
  };
}

// Buying items with a bill, find change and how many $5 bills etc. Kept simple: total cost + amount paid -> change.
function genChange(): WordProblemQuestion {
  const itemPrice = randInt(3, 40);
  const quantity = randInt(2, 6);
  const total = itemPrice * quantity;
  const paidOptions = [50, 100, 20, 200].filter((p) => p > total);
  const paid = paidOptions.length > 0 ? paidOptions[0] : total + randInt(10, 50);
  const change = paid - total;

  return {
    kind: "word",
    templateId: "change",
    prompt:
      `A notebook costs $${itemPrice}. You buy ${quantity} of them and pay with a $${paid} bill. ` +
      `How much did the notebooks cost in total, and how much change should you get back?`,
    parts: [
      { label: "Total cost ($)", answer: total },
      { label: "Change received ($)", answer: change },
    ],
    timeLimitSec: TIME_PER_WORD_Q,
  };
}

// Distance = rate * time. Give rate and time, ask distance and also time for a second leg at a different rate.
function genDistance(): WordProblemQuestion {
  const speed1 = randInt(20, 60);
  const time1 = randInt(2, 5);
  const distance1 = speed1 * time1;
  const speed2 = randInt(20, 60);
  const distance2 = speed2 * randInt(2, 4);
  const time2 = distance2 / speed2;

  return {
    kind: "word",
    templateId: "distance",
    prompt:
      `A car travels at ${speed1} mph for ${time1} hours, then at ${speed2} mph and covers ${distance2} miles on the second leg. ` +
      `How far did the car travel on the first leg, and how many hours did the second leg take?`,
    parts: [
      { label: "First leg distance (miles)", answer: distance1 },
      { label: "Second leg time (hours)", answer: time2 },
    ],
    timeLimitSec: TIME_PER_WORD_Q,
  };
}

const TEMPLATES: Record<WordProblemTemplateId, () => WordProblemQuestion> = {
  ages: genAges,
  change: genChange,
  distance: genDistance,
};

export const TEMPLATE_IDS: WordProblemTemplateId[] = ["ages", "change", "distance"];

export function generateWordProblem(
  templateId: WordProblemTemplateId,
): WordProblemQuestion {
  return TEMPLATES[templateId]();
}

export function buildWordProblemSet(count: number): WordProblemQuestion[] {
  const ids: WordProblemTemplateId[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(TEMPLATE_IDS[i % TEMPLATE_IDS.length]);
  }
  return ids.map((id) => generateWordProblem(id));
}
