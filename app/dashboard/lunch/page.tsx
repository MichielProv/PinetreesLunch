"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { MugSteamLoader } from "@/components/Loaders";

export type LunchRow = {
  id: string;
  serve_date: string | null; // YYYY-MM-DD
  room_number: number | null;
  adults_count: number | null;
  children_count: number | null;
  babies_count: number | null;
  guests_count: number | null; // sum, kept for compatibility
  names: string[] | null;
  dietaries: string | null;
  comment?: string | null;
};

type DbRec = Record<string, unknown>;

function toRow(rec: DbRec): LunchRow {
  const names = Array.isArray(rec?.names)
    ? (rec.names as string[])
    : typeof rec?.names === "string"
      ? (rec.names as string)
          .split(/[\n,]+/)
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
  const sd =
    typeof rec?.serve_date === "string"
      ? (rec.serve_date as string).slice(0, 10)
      : (rec as any)?.serve_date?.toString?.().slice(0, 10) ?? null;
  return {
    id: rec.id as string,
    serve_date: sd,
    room_number: (rec.room_number as number) ?? null,
    adults_count: (rec.adults_count as number) ?? 0,
    children_count: (rec.children_count as number) ?? 0,
    babies_count: (rec.babies_count as number) ?? 0,
    guests_count:
      (rec.guests_count as number) ??
      (((rec.adults_count as number) ?? 0) +
        ((rec.children_count as number) ?? 0) +
        ((rec.babies_count as number) ?? 0)),
    names,
    dietaries: (rec.dietaries as string) ?? null,
    comment: (rec.comment as string) ?? null,
  };
}

function formatLongDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map((v) => parseInt(v, 10));
  const dt = new Date(y, m - 1, d); // local
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
}

function addDays(yyyyMmDd: string, delta: number) {
  const [y, m, d] = yyyyMmDd.split("-").map((v) => parseInt(v, 10));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth() + 1).padStart(2, "0");
  const d2 = String(dt.getDate()).padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

function formatGuestsTriple(a?: number | null, c?: number | null, b?: number | null) {
  const parts: string[] = [];
  const A = Number(a || 0);
  const C = Number(c || 0);
  const B = Number(b || 0);
  if (A > 0) parts.push(`A${A}`);
  if (C > 0) parts.push(`C${C}`);
  if (B > 0) parts.push(`B${B}`);
  return parts.join(" ");
}

export default function LunchDashboard() {
  const [rows, setRows] = useState<LunchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LunchRow | null>(null);
  const [namesText, setNamesText] = useState<string>("");

  // Date filter (default today); past allowed
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);

  function openCalendar() {
    const el = dateInputRef.current;
    if (!el) return;
    // @ts-expect-error
    if (el.showPicker) el.showPicker();
    else {
      el.focus();
      el.click();
    }
  }
  const goPrevDay = () => setSelectedDate((d) => addDays(d, -1));
  const goNextDay = () => setSelectedDate((d) => addDays(d, 1));

  const totals = useMemo(() => {
    const A = rows.reduce((sum, r) => sum + (r.adults_count ?? 0), 0);
    const C = rows.reduce((sum, r) => sum + (r.children_count ?? 0), 0);
    const B = rows.reduce((sum, r) => sum + (r.babies_count ?? 0), 0);
    return { A, C, B };
  }, [rows]);

  async function load(forDate: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forms/lunch/list?date=${forDate}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setRows((json?.data || []).map(toRow));
    } catch (e: any) {
      setError(e?.message || "Load error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(selectedDate);
  }, [selectedDate]);

  // Realtime
  useEffect(() => {
    const supabase = supabaseBrowser() as any;

    const channel = supabase
      .channel?.(`lunch-${selectedDate}`)
      ?.on?.(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions", filter: "form_slug=eq.lunch" },
        (payload: any) => {
          const newRec = payload.new ? toRow(payload.new) : null;
          const oldRec = payload.old ? toRow(payload.old) : null;
          const newDate = newRec?.serve_date || null;
          const oldDate = oldRec?.serve_date || null;

          setRows((prev) => {
            if (payload.eventType === "INSERT") {
              const rec = newRec!;
              if (rec.serve_date !== selectedDate) return prev;
              if (prev.some((r) => r.id === rec.id)) return prev;
              return [rec, ...prev];
            }

            if (payload.eventType === "UPDATE") {
              const rec = newRec!;
              if (oldDate === selectedDate && newDate !== selectedDate) {
                return prev.filter((r) => r.id !== rec.id);
              }
              if (oldDate !== selectedDate && newDate === selectedDate) {
                if (prev.some((r) => r.id === rec.id)) {
                  return prev.map((r) => (r.id === rec.id ? rec : r));
                }
                return [rec, ...prev];
              }
              if (newDate === selectedDate) {
                if (editId === rec.id) return prev;
                return prev.map((r) => (r.id === rec.id ? rec : r));
              }
              return prev;
            }

            if (payload.eventType === "DELETE") {
              const id = oldRec?.id;
              if (!id) return prev;
              if (oldDate !== selectedDate) return prev;
              return prev.filter((r) => r.id !== id);
            }

            return prev;
          });
        }
      )
      ?.subscribe?.();

    return () => {
      supabase?.removeChannel?.(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, editId]);

  const onEdit = (row: LunchRow) => {
    setEditId(row.id);
    setDraft({ ...row });
    setNamesText((row.names || []).join(", "));
  };

  const onCancel = () => {
    setEditId(null);
    setDraft(null);
    setNamesText("");
  };

  const onChange = (field: keyof LunchRow, value: any) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const onSave = async () => {
    if (!draft) return;
    const namesArr = (namesText || "")
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      id: draft.id,
      room_number: Number(draft.room_number || 0),
      adults_count: Number(draft.adults_count || 0),
      children_count: Number(draft.children_count || 0),
      babies_count: Number(draft.babies_count || 0),
      names: namesArr,
      dietaries: draft.dietaries || "",
      comment: draft.comment || "",
    };
    const res = await fetch("/api/forms/lunch/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Save failed");
      return;
    }
    const updated = { ...draft, names: namesArr };
    setRows((prev) => prev.map((r) => (r.id === draft.id ? updated : r)));
    setEditId(null);
    setDraft(null);
    setNamesText("");
  };

  const onDelete = async (row: LunchRow) => {
    const ok = window.confirm("Delete this submission? This cannot be undone.");
    if (!ok) return;
    const res = await fetch("/api/forms/lunch/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    if (editId === row.id) {
      setEditId(null);
      setDraft(null);
      setNamesText("");
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-0">
      {/* Sticky header with safe area */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur pt-[env(safe-area-inset-top)] print:static print:bg-transparent">
        <div className="mx-auto max-w-6xl px-6 pt-2 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold print:text-lg">Lunch – Submissions</h1>
            {/* Date filter & actions (hidden on print) */}
            <div className="flex w-full sm:w-auto items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={goPrevDay}
                className="rounded-lg border px-3 py-2 text-sm h-11"
                title="Previous day"
                aria-label="Previous day"
              >
                {/* Left arrow */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={openCalendar}
                className="flex w-full sm:w-80 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm h-11"
                title="Pick a date"
                aria-label="Pick a date"
              >
                {/* Calendar */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 14H5V9h14v9Zm0-11H5V6h14v1Z" />
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
                  <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.currentTarget.value)}
                className="absolute -m-px h-px w-px overflow-hidden p-0 opacity-0"
                tabIndex={-1}
                aria-hidden="true"
              />
              <button
                onClick={() => window.print()}
                className="ml-2 w-full sm:w-auto rounded-lg border px-3 py-2 text-sm h-11"
                title="Print this day"
              >
                Print
              </button>
            </div>
          </div>
          <hr className="mt-2 border-gray-200" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl p-6">
        {error && <div className="p-2 text-red-600">{error}</div>}

        {/* Loading: white canvas with the mug loader + text */}
        {loading ? (
          <section className="grid min-height-[320px] place-items-center rounded-xl bg-white print:hidden" aria-busy="true">
            <div className="flex flex-col items-center gap-2">
              <MugSteamLoader className="text-gray-800" size={72} label="Loading" />
              <div className="text-sm text-gray-700">Loading...</div>
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">{formatLongDate(selectedDate)}</h2>

            {/* Desktop/Tablet table */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border bg-white">
              <table className="w-full table-fixed text-sm">
                {/* NOTE: keep <col> tags contiguous (no whitespace) to avoid hydration issues in <colgroup> */}
                <colgroup><col className="w-[3.75rem]"/><col className="w-[6.5rem]"/><col/><col/><col/><col className="w-40"/></colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Room</th>
                    <th className="p-2 text-left"># Guests</th>
                    <th className="p-2 text-left">Names</th>
                    <th className="p-2 text-left">Dietaries</th>
                    <th className="p-2 text-left">Comments</th>
                    <th className="p-2 text-left print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className="p-4 text-gray-500" colSpan={6}>No submissions for this date.</td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const isEditing = row.id === editId;
                      const r = isEditing ? (draft as LunchRow) : row;
                      const A = r.adults_count ?? 0;
                      const C = r.children_count ?? 0;
                      const B = r.babies_count ?? 0;
                      const total = (A + C + B) || 0;
                      const compParts: string[] = [];
                      if (A > 0) compParts.push(`A${A}`);
                      if (C > 0) compParts.push(`C${C}`);
                      if (B > 0) compParts.push(`B${B}`);
                      const comp = compParts.join(" ");
                      const showComp = C > 0 || B > 0;

                      return (
                        <tr key={row.id} className="border-t align-top" style={{ breakInside: "avoid" }}>
                          <td className="p-2 whitespace-nowrap">
                            {isEditing ? (
                              <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Room</label>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  className="w-full rounded border p-1 h-10 text-base"
                                  value={r.room_number ?? 0}
                                  onChange={(e) => onChange("room_number", Number(e.currentTarget.value))}
                                />
                              </div>
                            ) : (
                              r.room_number
                            )}
                          </td>

                          {/* # Guests */}
                          <td className="p-2 whitespace-nowrap align-top">
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wide text-gray-500">Adults</label>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  className="w-full rounded border p-1 h-10 text-base"
                                  value={A}
                                  onChange={(e) => onChange("adults_count", Number(e.currentTarget.value))}
                                  placeholder="Adults"
                                  title="Adults"
                                  min={0}
                                />
                                <label className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">Children</label>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  className="w-full rounded border p-1 h-10 text-base"
                                  value={C}
                                  onChange={(e) => onChange("children_count", Number(e.currentTarget.value))}
                                  placeholder="Children"
                                  title="Children"
                                  min={0}
                                />
                                <label className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">Babies</label>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  className="w-full rounded border p-1 h-10 text-base"
                                  value={B}
                                  onChange={(e) => onChange("babies_count", Number(e.currentTarget.value))}
                                  placeholder="Babies"
                                  title="Babies"
                                  min={0}
                                />
                              </div>
                            ) : (
                              <div>
                                <span>{total}</span>{" "}
                                {showComp && comp && <em className="text-gray-600">({comp})</em>}
                              </div>
                            )}
                          </td>

                          <td className="p-2">
                            {isEditing ? (
                              <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Names</label>
                                <textarea
                                  className="w-full rounded border p-1"
                                  rows={3}
                                  value={(draft?.names || []).join(", ")}
                                  onChange={(e) => {
                                    const txt = e.currentTarget.value;
                                    setNamesText(txt);
                                    const arr = txt.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
                                    onChange("names", arr);
                                  }}
                                  placeholder="Free text (comma or newline separated)"
                                />
                              </div>
                            ) : (
                              <div className="whitespace-pre-line break-words">{(r.names || []).join(", ")}</div>
                            )}
                          </td>

                          <td className="p-2">
                            {isEditing ? (
                              <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Dietaries</label>
                                <textarea
                                  className="w-full rounded border p-1"
                                  rows={2}
                                  value={r.dietaries ?? ""}
                                  onChange={(e) => onChange("dietaries", e.currentTarget.value)}
                                />
                              </div>
                            ) : (
                              <div className="whitespace-pre-line break-words">{r.dietaries ?? ""}</div>
                            )}
                          </td>

                          <td className="p-2">
                            {isEditing ? (
                              <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Comments</label>
                                <textarea
                                  className="w-full rounded border p-1"
                                  rows={2}
                                  value={r.comment ?? ""}
                                  onChange={(e) => onChange("comment", e.currentTarget.value)}
                                />
                              </div>
                            ) : (
                              <div className="whitespace-pre-line break-words">{r.comment || ""}</div>
                            )}
                          </td>

                          <td className="p-2 whitespace-nowrap print:hidden">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <button className="rounded bg-black px-3 py-2 text-white" onClick={onSave}>
                                  Save
                                </button>
                                <button className="rounded border px-3 py-2" onClick={onCancel}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button className="rounded border px-3 py-2" onClick={() => onEdit(row)}>
                                  Edit
                                </button>
                                <button
                                  className="rounded border px-3 py-2 text-red-600"
                                  onClick={() => onDelete(row)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* No table footer total */}
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {rows.length === 0 ? (
                <div className="rounded-xl border bg-white p-3 text-gray-500">No submissions for this date.</div>
              ) : (
                rows.map((row) => {
                  const isEditing = row.id === editId;
                  const r = isEditing ? (draft as LunchRow) : row;
                  const A = r.adults_count ?? 0;
                  const C = r.children_count ?? 0;
                  const B = r.babies_count ?? 0;
                  const total = (A + C + B) || 0;
                  const compParts: string[] = [];
                  if (A > 0) compParts.push(`A${A}`);
                  if (C > 0) compParts.push(`C${C}`);
                  if (B > 0) compParts.push(`B${B}`);
                  const comp = compParts.join(" ");
                  const showComp = C > 0 || B > 0;

                  return (
                    <article key={row.id} className="rounded-xl border bg-white p-3 space-y-2">
                      {/* Room & total */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-medium">
                          Room{" "}
                          {isEditing ? (
                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="ml-1 w-20 rounded border px-2 py-1"
                              value={r.room_number ?? 0}
                              onChange={(e) => onChange("room_number", Number(e.currentTarget.value))}
                            />
                          ) : (
                            r.room_number ?? "—"
                          )}
                        </div>
                        <div className="text-right">
                          {isEditing ? (
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase tracking-wide text-gray-500">Adults</div>
                              <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 rounded border px-2 py-1"
                                value={A}
                                onChange={(e) => onChange("adults_count", Number(e.currentTarget.value))}
                                min={0}
                              />
                              <div className="text-[10px] uppercase tracking-wide text-gray-500">Children</div>
                              <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 rounded border px-2 py-1"
                                value={C}
                                onChange={(e) => onChange("children_count", Number(e.currentTarget.value))}
                                min={0}
                              />
                              <div className="text-[10px] uppercase tracking-wide text-gray-500">Babies</div>
                              <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 rounded border px-2 py-1"
                                value={B}
                                onChange={(e) => onChange("babies_count", Number(e.currentTarget.value))}
                                min={0}
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold">{total}</div>
                              {showComp && comp ? <em className="text-xs text-gray-600">({comp})</em> : null}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Names */}
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-gray-500">Names</div>
                        {isEditing ? (
                          <textarea
                            className="mt-1 w-full rounded border p-2"
                            rows={2}
                            value={(draft?.names || []).join(", ")}
                            onChange={(e) => {
                              const txt = e.currentTarget.value;
                              setNamesText(txt);
                              const arr = txt.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
                              onChange("names", arr);
                            }}
                            placeholder="Free text (comma or newline separated)"
                          />
                        ) : (
                          <div className="whitespace-pre-line break-words">{(r.names || []).join(", ") || "—"}</div>
                        )}
                      </div>

                      {/* Dietaries */}
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-gray-500">Dietaries</div>
                        {isEditing ? (
                          <textarea
                            className="mt-1 w-full rounded border p-2"
                            rows={2}
                            value={r.dietaries ?? ""}
                            onChange={(e) => onChange("dietaries", e.currentTarget.value)}
                          />
                        ) : (
                          <div className="whitespace-pre-line break-words">{r.dietaries ?? "—"}</div>
                        )}
                      </div>

                      {/* Comment */}
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-gray-500">Comments</div>
                        {isEditing ? (
                          <textarea
                            className="mt-1 w-full rounded border p-2"
                            rows={2}
                            value={r.comment ?? ""}
                            onChange={(e) => onChange("comment", e.currentTarget.value)}
                          />
                        ) : (
                          <div className="whitespace-pre-line break-words">{r.comment || "—"}</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        {isEditing ? (
                          <>
                            <button className="w-full rounded bg-black px-3 py-2 text-white" onClick={onSave}>
                              Save
                            </button>
                            <button className="w-full rounded border px-3 py-2" onClick={onCancel}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="w-full rounded border px-3 py-2" onClick={() => onEdit(row)}>
                              Edit
                            </button>
                            <button
                              className="w-full rounded border px-3 py-2 text-red-600"
                              onClick={() => onDelete(row)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Totals at the very bottom */}
            <div className="mt-3">
              {/* Desktop-only total */}
              <div className="hidden sm:block rounded-xl border bg-white p-3 font-semibold">
                Total: <span className="whitespace-nowrap">{formatGuestsTriple(totals.A, totals.C, totals.B) || "—"}</span>
              </div>
              {/* Mobile-only total */}
              <div className="sm:hidden rounded-xl border bg-white p-3 font-semibold">
                Total: <span className="whitespace-nowrap">{formatGuestsTriple(totals.A, totals.C, totals.B) || "—"}</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}