-- 002_newbook_core.sql
create table if not exists public.newbook_dietaries (
  id text primary key,
  label text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.newbook_day_guests (
  serve_date date not null,
  booking_id bigint not null,
  site_name text not null,
  guest_id bigint not null,
  firstname text,
  dietaries text[] default '{}',
  adults_count int default 0,
  children_count int default 0,
  infants_count int default 0,
  booking_modified timestamptz,
  primary key (serve_date, site_name, guest_id)
);
create index if not exists idx_ndg_date_room on public.newbook_day_guests(serve_date, site_name);

-- Optional: effective roster view
drop view if exists public.v_effective_roster;
create or replace view public.v_effective_roster as
with excluded as (
  select
    s.serve_date,
    coalesce(nullif(s.nb_site_name, ''), s.room_number) as site_name,
    unnest(coalesce(s.nb_excluded_guest_ids, '{}')) as guest_id
  from public.submissions s
),
ndg as (
  select g.*
  from public.newbook_day_guests g
  left join excluded e
    on e.serve_date = g.serve_date
   and e.site_name = g.site_name
   and e.guest_id = g.guest_id
  where e.guest_id is null
),
manual as (
  select
    s.serve_date,
    coalesce(nullif(s.nb_site_name, ''), s.room_number) as site_name,
    ('manual-' || (row_number() over (order by s.serve_date, s.room_number)))::text as guest_key,
    (mg->>'name')::text as firstname,
    coalesce(array(select jsonb_array_elements_text(mg->'dietaries')), '{}')::text[] as dietaries
  from public.submissions s
  cross join lateral coalesce(
    case when jsonb_typeof(s.manual_guests) = 'array' then s.manual_guests else '[]'::jsonb end, '[]'::jsonb
  ) as mg
)
select
  serve_date,
  site_name,
  guest_id::text as guest_key,
  firstname,
  dietaries,
  true  as is_from_newbook,
  false as is_manual
from ndg
union all
select
  serve_date,
  site_name,
  guest_key,
  firstname,
  dietaries,
  false as is_from_newbook,
  true  as is_manual
from manual;
