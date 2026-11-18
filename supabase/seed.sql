-- Local development data only. Never run against the client's hosted project.
--   admin@tem.local   / admin12345    (back office, /admin)
--   you@example.mu    / customer123   (customer account)

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
   'admin@tem.local', extensions.crypt('admin12345', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"name":"TEM Admin"}', now(), now(),
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
   'you@example.mu', extensions.crypt('customer123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"name":"Demo Customer","phone":"+230 5700 0000"}', now(), now(),
   '', '', '', '', '', '', '', '');

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email',
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       now(), now(), now()
from auth.users u
where u.id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

update public.profiles set is_admin = true where id = '11111111-1111-1111-1111-111111111111';

insert into public.settings (id, data) values (1, '{
  "depositPct": 50,
  "leadDays": 2,
  "dailyCapacity": 8,
  "closedWeekdays": [1],
  "collection": true,
  "delivery": false,
  "slots": ["10:00–12:00", "12:00–14:00", "14:00–16:00", "16:00–18:00"],
  "holidays": [],
  "payment": "Bank transfer — account details to be supplied by TEM Bakehouse. Use your order reference as the payment reference."
}');

insert into public.orders (ref, customer_id, created, date, slot, location, status, items, notes, estimate, total, deposit_paid, balance_paid, log, contact_name, phone, email)
values
  ('TEM-0001-001', '22222222-2222-2222-2222-222222222222', current_date - 2, current_date + 4, '14:00–16:00', 'Terre Rouge', 'pending_review',
   '[{"key":"s1","pid":"round-choco-chips","name":"Choco Chips","flavour":"choco-chips","pack":"Box of 4","packId":"p4","qty":2,"diet":"regular","unit":380},
     {"key":"s2","pid":"round-pistachio","name":"Pistachio","flavour":"pistachio","pack":"Box of 4","packId":"p4","qty":1,"diet":"regular","unit":380}]',
   'For a team morning tea.', 1140, null, 0, 0,
   jsonb_build_array(jsonb_build_object('s', 'pending_review', 't', to_char(current_date - 2, 'YYYY-MM-DD'))),
   'Demo Customer', '+230 5700 0000', 'you@example.mu'),
  ('TEM-0001-002', '22222222-2222-2222-2222-222222222222', current_date - 5, current_date + 3, '10:00–12:00', 'Port Louis', 'deposit_required',
   '[{"key":"s3","pid":"cookie-cake","name":"Cookie Cake — Choco Chips","flavour":"choco-chips","pack":"20 cm","packId":"l","qty":1,"diet":"regular","unit":1200,"custom":{"occasion":"Birthday","message":"Joyeux anniversaire Léa","instructions":""}}]',
   '', 1200, 1200, 0, 0,
   jsonb_build_array(
     jsonb_build_object('s', 'pending_review', 't', to_char(current_date - 5, 'YYYY-MM-DD')),
     jsonb_build_object('s', 'deposit_required', 't', to_char(current_date - 4, 'YYYY-MM-DD'))),
   'Demo Customer', '+230 5700 0000', 'you@example.mu'),
  ('TEM-0001-003', null, current_date - 3, current_date + 2, '12:00–14:00', 'Terre Rouge', 'deposit_submitted',
   '[{"key":"s4","pid":"round-red-velvet","name":"Red Velvet","flavour":"red-velvet","pack":"Box of 4","packId":"p4","qty":1,"diet":"regular","unit":380}]',
   '', 380, 380, 0, 0,
   jsonb_build_array(
     jsonb_build_object('s', 'pending_review', 't', to_char(current_date - 3, 'YYYY-MM-DD')),
     jsonb_build_object('s', 'deposit_required', 't', to_char(current_date - 2, 'YYYY-MM-DD')),
     jsonb_build_object('s', 'deposit_submitted', 't', to_char(current_date - 1, 'YYYY-MM-DD'))),
   'Guest Shopper', '+230 5711 1111', 'guest@example.mu');
