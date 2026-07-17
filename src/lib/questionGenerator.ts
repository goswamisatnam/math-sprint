export type Level = "easy" | "medium" | "complex";
export type ArithmeticType = "add" | "sub" | "mul" | "div";

export interface ArithmeticQuestion {
  kind: "arithmetic";
  type: ArithmeticType;
  text: string;
  answer: number;
  timeLimitSec: number;
}

const TIME_PER_ARITHMETIC_Q = 30;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Range {
  addsub: [number, number];
  mulA: [number, number];
  mulB: [number, number];
  divDivisor: [number, number];
  divDividend: [number, number];
}

const RANGES: Record<Level, Range> = {
  easy: {
    addsub: [10, 99],
    mulA: [10, 99],
    mulB: [2, 9],
    divDivisor: [2, 9],
    divDividend: [100, 999],
  },
  medium: {
    addsub: [100, 9999],
    mulA: [10, 50],
    mulB: [10, 50],
    divDivisor: [10, 99],
    divDividend: [1000, 4999],
  },
  complex: {
    addsub: [1000, 99999],
    mulA: [10, 99],
    mulB: [10, 99],
    divDivisor: [10, 99],
    divDividend: [1000, 9999],
  },
};

function genAdd(r: Range): ArithmeticQuestion {
  const a = randInt(r.addsub[0], r.addsub[1]);
  const b = randInt(r.addsub[0], r.addsub[1]);
  return {
    kind: "arithmetic",
    type: "add",
    text: `${a} + ${b}`,
    answer: a + b,
    timeLimitSec: TIME_PER_ARITHMETIC_Q,
  };
}

function genSub(r: Range): ArithmeticQuestion {
  const a = randInt(r.addsub[0], r.addsub[1]);
  const b = randInt(r.addsub[0], a); // keep result non-negative
  return {
    kind: "arithmetic",
    type: "sub",
    text: `${a} − ${b}`,
    answer: a - b,
    timeLimitSec: TIME_PER_ARITHMETIC_Q,
  };
}

function genMul(r: Range): ArithmeticQuestion {
  const a = randInt(r.mulA[0], r.mulA[1]);
  const b = randInt(r.mulB[0], r.mulB[1]);
  return {
    kind: "arithmetic",
    type: "mul",
    text: `${a} × ${b}`,
    answer: a * b,
    timeLimitSec: TIME_PER_ARITHMETIC_Q,
  };
}

function genDiv(r: Range): ArithmeticQuestion {
  let divisor = 12;
  let quotient = 34;
  let dividend = 408;
  let found = false;
  for (let tries = 0; tries < 25 && !found; tries++) {
    const d = randInt(r.divDivisor[0], r.divDivisor[1]);
    const qMin = Math.ceil(r.divDividend[0] / d);
    const qMax = Math.floor(r.divDividend[1] / d);
    if (qMin > qMax) continue;
    const q = randInt(qMin, qMax);
    divisor = d;
    quotient = q;
    dividend = d * q;
    found = true;
  }
  return {
    kind: "arithmetic",
    type: "div",
    text: `${dividend} ÷ ${divisor}`,
    answer: quotient,
    timeLimitSec: TIME_PER_ARITHMETIC_Q,
  };
}

const GEN: Record<ArithmeticType, (r: Range) => ArithmeticQuestion> = {
  add: genAdd,
  sub: genSub,
  mul: genMul,
  div: genDiv,
};

export const OP_LABEL: Record<ArithmeticType, string> = {
  add: "Addition",
  sub: "Subtraction",
  mul: "Multiplication",
  div: "Division",
};

export const OP_SYMBOL: Record<ArithmeticType, string> = {
  add: "+",
  sub: "−",
  mul: "×",
  div: "÷",
};

export function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildArithmeticSet(
  level: Level,
  count: number,
): ArithmeticQuestion[] {
  const r = RANGES[level];
  const types: ArithmeticType[] = [];
  const opOrder: ArithmeticType[] = ["add", "sub", "mul", "div"];
  for (let i = 0; i < count; i++) {
    types.push(opOrder[i % opOrder.length]);
  }
  return shuffle(types).map((t) => GEN[t](r));
}

export function generateOneArithmetic(
  level: Level,
  type: ArithmeticType,
): ArithmeticQuestion {
  return GEN[type](RANGES[level]);
}
