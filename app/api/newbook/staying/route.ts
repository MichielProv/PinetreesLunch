// app/api/newbook/staying/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listBookingsStaying } from '@/lib/newbookClient';
import { fetchDietaryMapAlwaysFresh } from '@/lib/dietaryMap';
import { upsertDayGuests } from '@/lib/upsertNewbookDayGuests';
import type { NBBooking } from '@/types/newbook';

export async function GET(req: NextRequest) {
  const date = new URL(req.url).searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });
  const period_from = `${date} 00:00:00`;
  const period_to   = `${date} 23:59:59`;

  try {
    const [dietMap, bookings] = await Promise.all([
      fetchDietaryMapAlwaysFresh(),
      listBookingsStaying(period_from, period_to)
    ]);
    const typed = (bookings || []) as NBBooking[];
    await upsertDayGuests(date, typed, dietMap);
    return NextResponse.json({ ok: true, date, count: typed.length });
  } catch (e:any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
