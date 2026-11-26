-- Free-tier projects are paused after a week without activity. Once a day, call the keep-alive Edge
-- Function through the public API gateway; the function also reads the database.
-- The URL is the hosted project's, so a local stack started with `supabase start` pings it too (harmless).
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- 06:17 UTC = 10:17 in Mauritius. cron.schedule replaces an existing job of the same name.
select cron.schedule(
  'keep-alive-daily',
  '17 6 * * *',
  $$select net.http_get(url := 'https://sdrkbzhvjrderynwulmb.supabase.co/functions/v1/keep-alive', timeout_milliseconds := 10000)$$
);
