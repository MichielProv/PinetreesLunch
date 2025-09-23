// types/lunch.ts
export type ManualGuest = { name?: string; dietaries?: string[] };

export type LunchSubmitBody = {
  serve_date: string;
  room_number: string;
  nb_site_name?: string;
  nb_booking_ids?: number[];
  nb_excluded_guest_ids?: number[];
  manual_guests?: ManualGuest[] | null;
  comment?: string | null;
};

export type EffectiveGuest = { id: string; name?: string; dietaries: string[] };
export type EffectiveRoom = {
  room: string;
  count: number;
  adults: number;
  children: number;
  infants: number;
  guests: EffectiveGuest[];
};

export type DashboardPayload = {
  date: string;
  rooms: EffectiveRoom[];
  totals: { guests: number; adults: number; children: number; infants: number };
};
