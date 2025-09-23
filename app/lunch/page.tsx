"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SubmitBody = {
  serve_date: string;
  room_number: number | null;
  adults_count: number;
  children_count: number;
  babies_count: number;
  names: string; // free text; server normalizes to array
  dietaries: string;
  comment: string;
};

function formatLongDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map((v) => parseInt(v, 10));
  const dt = new Date(y, (m - 1), d);
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
}

function addDays(yyyyMmDd: string, delta: number) {
  const [y, m, d] = yyyyMmDd.split("-").map((v) => parseInt(v, 10));
  const dt = new Date(y, (m - 1), d);
  dt.setDate(dt.getDate() + delta);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth() + 1).padStart(2, "0");
  const d2 = String(dt.getDate()).padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

function todayInSydney(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function isBefore(a: string, b: string) {
  return new Date(a) < new Date(b);
}

export default function LunchPage() {
  // Date picker (no past dates)
  const todaySydney = useMemo(() => todayInSydney(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todaySydney);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const openCalendar = () => {
    const el = dateInputRef.current;
    if (!el) return;
    // @ts-expect-error showPicker exists on some browsers
    if (el.showPicker) el.showPicker();
    else {
      el.focus();
      el.click();
    }
  };
  const goPrevDay = () => {
    const prev = addDays(selectedDate, -1);
    if (!isBefore(prev, todaySydney)) setSelectedDate(prev);
  };
  const goNextDay = () => setSelectedDate((d) => addDays(d, 1));

  // Form state
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [names, setNames] = useState<string>("");
  const [adults, setAdults] = useState<string>("0");
  const [children, setChildren] = useState<string>("0");
  const [babies, setBabies] = useState<string>("0");
  const [dietaries, setDietaries] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  const [isSubmitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear success after 5s
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 5000);
    return () => clearTimeout(t);
  }, [success]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: SubmitBody = {
      serve_date: selectedDate, // exact date string (Sydney-local)
      room_number: roomNumber.trim() === "" ? null : Number(roomNumber),
      adults_count: Number(adults || 0),
      children_count: Number(children || 0),
      babies_count: Number(babies || 0),
      names,
      dietaries,
      comment,
    };

    try {
      const res = await fetch("/api/forms/lunch/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Submission failed");
      }

      // Success: clear inputs (keep the selected date)
      setRoomNumber("");
      setNames("");
      setAdults("0");
      setChildren("0");
      setBabies("0");
      setDietaries("");
      setComment("");
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      {/* Header with compact date picker */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">Lunch</h1>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <button
            type="button"
            onClick={goPrevDay}
            disabled={isBefore(addDays(selectedDate, -1), todaySydney)}
            className="rounded-lg border px-3 py-2 text-sm h-11 disabled:opacity-40"
            title="Previous day"
            aria-label="Previous day"
          >
            {/* Left arrow */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={openCalendar}
            className="flex w-full sm:w-80 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm h-11"
            title="Pick a date"
            aria-label="Pick a date"
          >
            {/* Calendar icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 14H5V9h14v9Zm0-11H5V6h14v1Z"/>
            </svg>
            <span className="whitespace-nowrap text-center">{formatLongDate(selectedDate)}</span>
          </button>
          <button
            type="button"
            onClick={goNextDay}
            className="rounded-lg border px-3 py-2 text-sm h-11"
            title="Next day"
            aria-label="Next day"
          >
            {/* Right arrow */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => {
              const v = e.currentTarget.value;
              if (!isBefore(v, todaySydney)) setSelectedDate(v);
            }}
            min={todaySydney}
            className="absolute -m-px h-px w-px overflow-hidden p-0 opacity-0"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {success && <div className="rounded-md bg-green-50 p-2 text-green-700">Successfully submitted</div>}
        {error && <div className="rounded-md bg-red-50 p-2 text-red-700">{error}</div>}

        <div>
          <label className="mb-1 block text-sm font-medium">Room number</label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded border p-3 h-11 text-base"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.currentTarget.value)}
            placeholder="e.g. 12"
            min={0}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Name(s)</label>
          <textarea
            className="w-full rounded border p-3 text-base"
            rows={2}
            value={names}
            onChange={(e) => setNames(e.currentTarget.value)}
            placeholder="Free text (comma or newline separated)"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium"># Guests</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Adults</div>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full rounded border p-3 h-11 text-base"
                value={adults}
                onChange={(e) => setAdults(e.currentTarget.value)}
                min={0}
              />
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Children</div>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full rounded border p-3 h-11 text-base"
                value={children}
                onChange={(e) => setChildren(e.currentTarget.value)}
                min={0}
              />
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Babies</div>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full rounded border p-3 h-11 text-base"
                value={babies}
                onChange={(e) => setBabies(e.currentTarget.value)}
                min={0}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Dietaries</label>
          <textarea
            className="w-full rounded border p-3 text-base"
            rows={2}
            value={dietaries}
            onChange={(e) => setDietaries(e.currentTarget.value)}
            placeholder="Allergies, vegetarian, gluten-free, etc."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Comment</label>
          <textarea
            className="w-full rounded border p-3 text-base"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            placeholder="Anything else to note"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50 h-11"
          >
            {isSubmitting ? "Saving…" : "Submit"}
          </button>
        </div>
      </form>
    </main>
  );
}
