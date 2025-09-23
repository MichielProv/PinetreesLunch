// lib/newbookClient.ts
const NB_URL = 'https://api.newbook.cloud/rest';
const REGION = process.env.NEWBOOK_REGION!;
const API_KEY = process.env.NEWBOOK_API_KEY!;

type NBResp<T> = { data?: T; status?: string; message?: string };

async function nbPost<T=any>(path: string, body: Record<string, any>): Promise<T> {
  const res = await fetch(`${NB_URL}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region: REGION, api_key: API_KEY, ...body }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Newbook ${path} ${res.status}: ${txt}`);
  }
  const json = await res.json() as NBResp<T>;
  if (!json || json.data === undefined) throw new Error(`Newbook ${path} malformed`);
  return json.data as T;
}

export async function listDietaries(): Promise<Array<{id: string, name: string}>> {
  const data = await nbPost<any[]>('dietary_requirements_list', {});
  return (data || []).map((d: any) => ({ id: String(d.id), name: String(d.name ?? d.label ?? d.id) }));
}

export async function listBookingsStaying(period_from: string, period_to: string) {
  return nbPost<any[]>('bookings_list', { list_type: 'staying', period_from, period_to });
}
