// app/api/forms/lunch/list/route.ts
import { supabaseAdmin } from "@/lib/supabase-admin";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // In Node.js runtime, req.url can be a relative path.
    // Build an absolute URL using request headers.
    const h = headers();
    const proto = h.get("x-forwarded-proto") || "https";
    const host = h.get("host") || "localhost:3000";
    const url = new URL(req.url, `${proto}://${host}`);

    const date = url.searchParams.get("date");

    const supabase = supabaseAdmin();
    let query = supabase
      .from("submissions")
      .select(
        [
          "id",
          "form_slug",
          "serve_date",
          "room_number",
          "adults_count",
          "children_count",
          "babies_count",
          "names",
          "dietaries",
          "comment",
        ].join(",")
      )
      .eq("form_slug", "lunch");

    if (date) {
      query = query.eq("serve_date", date);
    }

    const { data, error } = await query;
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ data });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Unexpected server error" }, { status: 500 });
  }
}
