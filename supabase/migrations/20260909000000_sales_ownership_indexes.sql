-- Existing ownership columns are sales_id on both tables.
-- These indexes support the ownership-scoped dashboard and list queries.
create index if not exists members_sales_id_created_at_idx
  on public.members (sales_id, created_at desc);

create index if not exists vendors_sales_id_created_at_idx
  on public.vendors (sales_id, created_at desc);
