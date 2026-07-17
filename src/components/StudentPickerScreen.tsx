"use client";

import { useEffect, useState } from "react";
import type { StudentDto } from "@/lib/apiTypes";

interface StudentPickerScreenProps {
  onSelect: (student: StudentDto) => void;
  onViewHistory: (student: StudentDto) => void;
}

export default function StudentPickerScreen({
  onSelect,
  onViewHistory,
}: StudentPickerScreenProps) {
  const [students, setStudents] = useState<StudentDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load students");
        return res.json();
      })
      .then((data: StudentDto[]) => setStudents(data))
      .catch(() => setError("Couldn't load student list. Try refreshing."));
  }, []);

  async function handleAddStudent() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create student");
      const student: StudentDto = await res.json();
      setStudents((prev) => {
        const withoutDup = (prev ?? []).filter((s) => s.id !== student.id);
        return [...withoutDup, student].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });
      setNewName("");
      setSelectedId(student.id);
    } catch {
      setError("Couldn't add student. Try again.");
    } finally {
      setCreating(false);
    }
  }

  const selected = students?.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="screen-fade">
      <div className="text-center px-1 pt-3.5 pb-6.5">
        <p className="eyebrow">5th Grade Speed Drill</p>
        <h1 className="text-[44px] m-0 mb-1 text-navy">
          MATH <span className="text-track-red">SPRINT</span>
        </h1>
        <p className="m-0 text-navy-soft text-[15px]">
          Who&apos;s racing today?
        </p>
      </div>

      <div className="card px-6 pt-6.5 pb-7">
        <h3 className="text-[15px] uppercase tracking-[0.08em] mb-3.5 text-navy">
          Pick your name
        </h3>

        {error && (
          <p className="text-[13px] text-danger mb-3.5">{error}</p>
        )}

        {students === null && !error && (
          <p className="text-[13px] text-navy-soft mb-3.5">Loading…</p>
        )}

        {students !== null && students.length > 0 && (
          <div className="flex flex-col gap-2 mb-5">
            {students.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`flex items-center justify-between py-3 px-4 rounded-[14px] border-2 cursor-pointer select-none transition-all ${
                  selectedId === s.id
                    ? "border-track-red bg-[#FFF3EE] shadow-[inset_0_0_0_1px_var(--track-red)]"
                    : "border-line bg-cream"
                }`}
              >
                <span
                  className={`font-display font-bold text-lg ${
                    selectedId === s.id ? "text-track-red-deep" : "text-navy"
                  }`}
                >
                  {s.name}
                </span>
                <button
                  type="button"
                  className="link-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewHistory(s);
                  }}
                >
                  History
                </button>
              </div>
            ))}
          </div>
        )}

        {students !== null && students.length === 0 && (
          <p className="text-[13px] text-navy-soft mb-5">
            No students yet — add the first name below.
          </p>
        )}

        <h3 className="text-[15px] uppercase tracking-[0.08em] mb-3.5 text-navy">
          Add a new name
        </h3>
        <div className="flex gap-2.5 mb-6">
          <input
            type="text"
            className="answer-input text-left text-lg font-display flex-1 min-w-0"
            placeholder="Type a name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
          />
          <button
            className="btn small shrink-0"
            style={{ width: "auto" }}
            disabled={!newName.trim() || creating}
            onClick={handleAddStudent}
          >
            Add
          </button>
        </div>

        <button
          className="btn"
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
        >
          {selected ? `Start the race as ${selected.name} →` : "Pick a name to start"}
        </button>
      </div>
    </div>
  );
}
