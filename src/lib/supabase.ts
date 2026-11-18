import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** Null when no Supabase project is configured: the app then runs in browser-only demo mode. */
export const supabase = url && key ? createClient(url, key) : null;
