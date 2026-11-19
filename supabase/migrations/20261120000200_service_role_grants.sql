-- The server-side secret key (service_role) needs table access too, for admin
-- scripts and future server functions such as order-status emails.
grant usage on schema public to service_role;
grant all on public.profiles, public.settings, public.product_state, public.orders to service_role;
grant execute on all functions in schema public to service_role;
