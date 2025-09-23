import { z } from "zod";


export const LunchPrefillQuery = z.object({
room: z.coerce.number().int().positive(),
});


export const LunchSubmission = z.object({
roomNumber: z.coerce.number().int().positive(),
// Allow empty or free‑text derived names (we'll split on submit)
names: z.array(z.string()).default([]),
guests: z.coerce.number().int().positive(),
dietaries: z.string().optional().default(""),
comment: z.string().max(1000).optional().default(""),
});


export type TLunchSubmission = z.infer<typeof LunchSubmission>;


export type NewbookGuest = {
first_name: string;
last_name?: string;
dietary_requirements?: string | null;
};


export type NewbookRoomLookup = {
room_number: number;
guests: NewbookGuest[];
};


// Update schema for editing a saved submission
export const LunchUpdate = z.object({
id: z.string().uuid(),
room_number: z.coerce.number().int().positive(),
guests_count: z.coerce.number().int().min(0),
names: z.array(z.string()).default([]),
dietaries: z.string().optional().default(""),
comment: z.string().optional().default(""),
});
export type TLunchUpdate = z.infer<typeof LunchUpdate>;