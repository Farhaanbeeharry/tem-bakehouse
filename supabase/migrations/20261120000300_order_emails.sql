-- When the "we received your request" email went out (set by the order-email
-- function), so each order is emailed once.
alter table public.orders add column confirmation_sent_at timestamptz;

-- Same guard as before, with the new column locked for customers.
create or replace function public.guard_order_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  approving boolean := old.status = 'awaiting_approval' and new.status = 'deposit_required';
begin
  new.updated_at := now();
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status and not (
    (old.status in ('deposit_required', 'payment_failed') and new.status = 'deposit_submitted')
    or approving
    or (old.status in ('pending_review', 'changes_requested', 'awaiting_approval', 'deposit_required', 'payment_failed') and new.status = 'cancelled')
  ) then
    raise exception 'Order % cannot move from % to %', old.ref, old.status, new.status
      using errcode = '42501';
  end if;

  new.ref := old.ref;
  new.customer_id := old.customer_id;
  new.created := old.created;
  new.slot := old.slot;
  new.method := old.method;
  new.location := old.location;
  new.items := old.items;
  new.notes := old.notes;
  new.estimate := old.estimate;
  new.deposit_paid := old.deposit_paid;
  new.balance_paid := old.balance_paid;
  new.internal := old.internal;
  new.contact_name := old.contact_name;
  new.phone := old.phone;
  new.email := old.email;
  new.media_consent := old.media_consent;
  new.proposal := old.proposal;
  new.fail_note := old.fail_note;
  new.created_at := old.created_at;
  new.confirmation_sent_at := old.confirmation_sent_at;
  if not approving then
    new.date := old.date;
    new.total := old.total;
  end if;
  if new.status is distinct from 'deposit_submitted' then
    new.proof := old.proof;
    new.pay_ref := old.pay_ref;
    new.pay_method := old.pay_method;
    new.pay_date := old.pay_date;
  end if;
  return new;
end;
$$;
