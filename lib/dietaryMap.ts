// lib/dietaryMap.ts
import { listDietaries } from './newbookClient';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

let inFlight: Promise<Record<string,string>> | null = null;

export async function fetchDietaryMapAlwaysFresh(): Promise<Record<string,string>> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const items = await listDietaries();
      const map: Record<string,string> = {};
      items.forEach(x => map[x.id] = x.name);
      persist(map).catch(() => {});
      return map;
    } catch {
      return readFallback();
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

async function persist(map: Record<string,string>) {
  const rows = Object.entries(map).map(([id, label]) => ({ id, label, updated_at: new Date().toISOString() }));
  await supabase.from('newbook_dietaries').upsert(rows, { onConflict: 'id' });
}
async function readFallback() {
  const { data } = await supabase.from('newbook_dietaries').select('id,label');
  return Object.fromEntries((data||[]).map((r:any) => [r.id, r.label]));
}
