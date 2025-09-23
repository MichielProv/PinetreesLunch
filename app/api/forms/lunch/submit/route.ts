// app/api/forms/lunch/submit/route.ts
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
  serve_date?: string | null;  // "YYYY-MM-DD"
  room_number?: number | null;
  adults_count?: number | null;
  children_count?: number | null;
  babies_count?: number | null;
  names?: string[] | string | null;
  dietaries?: string | null;
  comment?: string | null;
};

function normalizeNames(input: Body["names"]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean) as string[];
  return input
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function todayInSydney(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find(p => p.type === "year")?.value ?? "1970";
  const m = parts.find(p => p.type === "month")?.value ?? "01";
  const d = parts.find(p => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch (e: any) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Prefer explicit serve_date from client; otherwise default to today (Australia/Sydney).
  let serve_date = (body.serve_date ?? "").toString().trim();
  if (!serve_date) {
    serve_date = todayInSydney();
  }

  const payload = {
    form_slug: "lunch",
    serve_date,
    room_number: body.room_number ?? null,
    adults_count: Number(body.adults_count ?? 0),
    children_count: Number(body.children_count ?? 0),
    babies_count: Number(body.babies_count ?? 0),
    names: normalizeNames(body.names),
    dietaries: body.dietaries ?? "",
    comment: body.comment ?? "",
  };

  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.from("submissions").insert(payload).select().single();
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ data });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Unexpected server error" }, { status: 500 });
  }
}
