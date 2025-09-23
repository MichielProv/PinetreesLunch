// types/db.ts
export type SubmissionRow = {
  id: string;
  serve_date: string;
  room_number: string;
  nb_site_name: string | null;
  nb_booking_ids: number[];
  nb_excluded_guest_ids: number[];
  manual_guests: unknown | null;
  comment: string | null;
};
