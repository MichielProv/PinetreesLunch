// app/api/newbook/prefill/route.ts
// Stubbed: Newbook prefill is currently disabled by request.
// Keeping a no-op route prevents build-time errors and documents intent.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  return Response.json({ ok: false, reason: "Newbook prefill temporarily disabled" }, { status: 501 });
}
