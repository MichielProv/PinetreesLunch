// app/api/dashboard/lunch/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const date = new URL(req.url).searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('v_effective_roster')
    .select('serve_date, site_name, guest_key, firstname, dietaries, is_from_newbook, is_manual')
    .eq('serve_date', date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byRoom = new Map<string, any[]>();
  for (const r of data || []) {
    if (!byRoom.has(r.site_name)) byRoom.set(r.site_name, []);
    byRoom.get(r.site_name)!.push(r);
  }
  const rooms = Array.from(byRoom.entries()).map(([room, rows]) => ({
    room,
    count: rows.length,
    adults: 0, children: 0, infants: 0,
    guests: rows.map(r => ({ id: r.guest_key, name: r.firstname ?? undefined, dietaries: r.dietaries || [] }))
  }));
  const totals = { guests: rooms.reduce((a, r) => a + r.count, 0), adults: 0, children: 0, infants: 0 };

  return NextResponse.json({ date, rooms, totals });
}
