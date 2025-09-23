// app/api/newbook/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchDietaryMapAlwaysFresh } from '@/lib/dietaryMap';
import { upsertDayGuests } from '@/lib/upsertNewbookDayGuests';
import type { NBBooking } from '@/types/newbook';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret') || '';
  if (!process.env.NEWBOOK_WEBHOOK_SECRET || secret !== process.env.NEWBOOK_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const bookings: NBBooking[] = Array.isArray(body?.data) ? body.data : [body?.data ?? body].filter(Boolean);
    if (!bookings.length) return NextResponse.json({ ok: true, received: 0 });
    const dietMap = await fetchDietaryMapAlwaysFresh();
    const date = new Date().toISOString().slice(0,10);
    await upsertDayGuests(date, bookings, dietMap);
    return NextResponse.json({ ok: true, received: bookings.length });
  } catch (e:any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
