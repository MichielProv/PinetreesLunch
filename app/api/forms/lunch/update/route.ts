// app/api/forms/lunch/update/route.ts
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
  id: string;
  room_number?: number;
  adults_count?: number;
  children_count?: number;
  babies_count?: number;
  names?: string[] | string;
  dietaries?: string;
  comment?: string;
};

function normalizeNames(input: Body["names"]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return input
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (!body.id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const payload = {
    room_number: body.room_number ?? null,
    adults_count: body.adults_count ?? 0,
    children_count: body.children_count ?? 0,
    babies_count: body.babies_count ?? 0,
    names: normalizeNames(body.names),
    dietaries: body.dietaries ?? "",
    comment: body.comment ?? "",
  };

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("submissions")
    .update(payload)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ data });
}
