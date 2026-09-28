begin;

-- Phase 2 used relationship words as visible item names. Ownership was already
-- mapped to a real user id; use that profile to replace only known legacy labels.
update public.budget_items bi
set name=p.display_name
from public.profiles p
where bi.owner_user_id=p.id
  and lower(trim(bi.name)) in ('wife','husband','spouse','partner');

update public.income_sources source
set name=p.display_name||substring(source.name from char_length(split_part(source.name,' ',1))+1)
from public.profiles p
where source.owner_user_id=p.id
  and lower(split_part(trim(source.name),' ',1)) in ('wife','husband','spouse','partner');

commit;
