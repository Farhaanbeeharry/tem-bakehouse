-- Hosted projects no longer grant new tables to the API roles automatically.
-- Row-level security still decides which rows each user can touch.

grant usage on schema public to anon, authenticated;

grant select, update on public.profiles to authenticated;

grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;

grant select on public.product_state to anon, authenticated;
grant insert, update on public.product_state to authenticated;

grant select, insert, update, delete on public.orders to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
