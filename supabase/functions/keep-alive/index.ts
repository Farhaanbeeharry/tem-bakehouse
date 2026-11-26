// Called once a day by the keep-alive-daily cron job (see the keep_alive migration), so the free-tier
// project always has API and database activity and is never paused for inactivity.
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

Deno.serve(async () => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { error } = await db.from('settings').select('id').limit(1);
  if (error) console.error(`[keep-alive] database read failed: ${error.message}`);
  return new Response(JSON.stringify({ ok: !error, at: new Date().toISOString() }), { status: error ? 500 : 200, headers: { 'Content-Type': 'application/json' } });
});
