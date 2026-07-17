"use client";

const COLORS = [
  "var(--track-red)",
  "var(--lane-yellow)",
  "var(--success)",
  "var(--navy-soft)",
  "#7A4FA0",
];

interface Piece {
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  size: number;
}

function generatePieces(count: number): Piece[] {
  const pieces: Piece[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.6 + Math.random() * 1.1,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 5,
    });
  }
  return pieces;
}

const PIECES = generatePieces(36);

export default function Confetti() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-20"
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: "-5%",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
