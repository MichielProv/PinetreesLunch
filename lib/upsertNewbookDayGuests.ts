// lib/upsertNewbookDayGuests.ts
import { createClient } from '@supabase/supabase-js';
import type { NBBooking } from '@/types/newbook';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function upsertDayGuests(date: string, bookings: NBBooking[], dietMap: Record<string,string>) {
  const rows = bookings.flatMap(b => {
    const adults   = Number(b.booking_adults ?? 0);
    const children = Number(b.booking_children ?? 0);
    const infants  = Number(b.booking_infants ?? 0);
    const guests = (b.guests || []).map(g => ({
      serve_date: date,
      booking_id: Number(b.booking_id),
      site_name: String(b.site_name),
      guest_id: Number(g.guest_id),
      firstname: g.firstname ?? null,
      dietaries: (g.dietary_requirements || []).map((id: string) => dietMap[id] ?? id),
      adults_count: adults,
      children_count: children,
      infants_count: infants,
      booking_modified: b.booking_modified ? new Date(b.booking_modified) : null
    }));
    return guests;
  });
  if (!rows.length) return;
  await supabase.from('newbook_day_guests').upsert(rows, { onConflict: 'serve_date,site_name,guest_id' });
}
