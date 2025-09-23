// app/api/debug/region/route.ts
import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = headers().get("x-vercel-id") || "";
  // Example format: "syd1::abcde-12345-..."
  return Response.json({ vercelId: id });
}
