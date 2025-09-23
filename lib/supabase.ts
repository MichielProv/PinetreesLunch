import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;

export const supabaseService = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export const supabaseAnon = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});
