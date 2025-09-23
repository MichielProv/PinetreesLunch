/**
 * Browser Supabase client (safe):
 * - Uses NEXT_PUBLIC_* envs via dot notation so Next replaces them at build time.
 * - If missing in the client bundle, returns a no-op client so the page won't crash.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type NoopSubscription = { unsubscribe: () => void };
type NoopChannel = {
  on: (..._args: any[]) => NoopChannel;
  subscribe: (..._args: any[]) => NoopSubscription;
};
class NoopSupabase {
  channel(_name: string): NoopChannel {
    return {
      on: () => this.channel("noop"),
      subscribe: () => ({ unsubscribe: () => {} }),
    };
  }
  removeChannel(_chan: any) {}
}

export function supabaseBrowser(): SupabaseClient | NoopSupabase {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    if (typeof window !== "undefined") {
      console.warn(
        "[supabaseBrowser] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
          "Realtime disabled on this page."
      );
    }
    return new NoopSupabase() as any;
  }
  return createClient(url, anon, { auth: { persistSession: true } });
}
