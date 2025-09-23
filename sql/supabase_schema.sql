create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  schema_json jsonb not null,
  created_at timestamptz default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  form_slug text not null,
  created_at timestamptz default now(),
  created_by uuid,
  data_json jsonb not null,
  room_number int,
  guests_count int,
  names text[],
  dietaries text
);

alter table submissions enable row level security;
create policy "anon-read-submissions" on submissions for select using (true);

revoke insert on submissions from anon;
