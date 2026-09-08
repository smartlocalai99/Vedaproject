-- Apply this only after reviewing current members-table policies in the Supabase SQL editor.
-- It adds a narrowly scoped read policy; it does not alter existing policies or columns.
-- The role must be stored in auth.users app_metadata as: {"role":"QR_PRINTER_PARTNER"}.

create policy "QR Printer Partners can read print-ready members"
on public.members
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'QR_PRINTER_PARTNER'
  and card_number is not null
);
