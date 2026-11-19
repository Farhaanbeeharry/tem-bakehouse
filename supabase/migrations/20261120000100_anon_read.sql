-- Signed-out visitors query orders and profiles on every page load (and subscribe
-- to order changes). No policy targets anon on these tables, so they get no rows
-- instead of a "permission denied" error.
grant select on public.orders to anon;
grant select on public.profiles to anon;
