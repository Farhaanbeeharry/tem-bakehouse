-- Back-office catalogue editing: names, descriptions, ingredients, pack prices, photos and
-- products added by the owner live in product_state.edit (see applyCatalog in src/data/catalog.ts).
alter table public.product_state add column edit jsonb;

-- Products added in the back office can be deleted there.
grant delete on public.product_state to authenticated;

-- Photos uploaded in the back office. Anyone can view them; only admins can change them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', true, 8388608, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "catalog photos: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'catalog' and public.is_admin());
create policy "catalog photos: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'catalog' and public.is_admin());
create policy "catalog photos: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'catalog' and public.is_admin());
