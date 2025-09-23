// types/newbook.ts
export type NBGuest = {
  guest_id: number;
  firstname?: string;
  dietary_requirements?: string[];
};

export type NBBooking = {
  booking_id: number;
  site_name: string;
  site_id?: number;
  booking_adults?: number;
  booking_children?: number;
  booking_infants?: number;
  booking_modified?: string;
  guests?: NBGuest[];
};
