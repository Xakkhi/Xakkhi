-- ============================================================================
-- Xakkhi সাক্ষী — Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
--
-- This file mirrors the live database structure. The 22 wards / officials the
-- app actually renders are sourced from data/wards.js at runtime — the `wards`
-- table below is legacy and not read by the app (kept for completeness).
-- ============================================================================

-- ─── Reports table ──────────────────────────────────────────────────────────

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  photo_url text,
  before_photo_url text,
  after_photo_url text,
  category text not null check (category in ('garbage', 'pothole', 'drainage', 'streetlight', 'flooding', 'riverbank')),
  sub_category text,
  severity text not null check (severity in ('minor', 'moderate', 'severe', 'critical')),
  description text,
  lat float not null,
  lng float not null,
  ward_number integer not null,
  status text not null default 'unresolved' check (status in ('unresolved', 'resolved')),
  resolved_at timestamptz,
  resolved_by_citizen boolean default false,
  seen_count integer default 0,
  report_id_short text unique,
  -- Moderation / lifecycle fields (added in the Phase B review-queue work)
  clean_days integer,
  cleanup_status text,
  flag_status text,
  flag_reason text,
  flag_photo_url text,
  verification_photo_url text,
  citizen_count integer default 1,
  is_removed boolean not null default false
);

-- Auto-generate short IDs like XK-2026-0001
create or replace function generate_report_id_short()
returns trigger as $$
declare
  yr text;
  seq int;
begin
  yr := to_char(now(), 'YYYY');
  -- Use max existing sequence (+1), not count, so deletions never cause
  -- duplicate-key collisions on report_id_short.
  select coalesce(max(substring(report_id_short from 9)::int), 0) + 1 into seq
    from reports
    where report_id_short like 'XK-' || yr || '-%';
  new.report_id_short := 'XK-' || yr || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_report_id_short
  before insert on reports
  for each row
  when (new.report_id_short is null)
  execute function generate_report_id_short();

-- Auto-update updated_at on change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_reports_updated_at
  before update on reports
  for each row
  execute function update_updated_at();

-- ─── Report actions (citizen suggestions: cleanups & flags) ─────────────────
-- Citizens insert "pending" suggestions; only admins can read/approve them via
-- the /review queue. Approving a cleanup resolves the report; approving a flag
-- soft-removes it (reports.is_removed = true).

create table if not exists report_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  action_type text not null check (action_type in ('cleanup', 'flag')),
  photo_url text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ─── Wards table (legacy — app reads data/wards.js, not this) ────────────────

create table if not exists wards (
  ward_number integer primary key,
  area_name text not null,
  area_name_local text,
  commissioner_name text,
  commissioner_phone text,
  commissioner_photo_url text,
  commissioner_party text,
  commissioner_position text,
  center_lat float not null,
  center_lng float not null,
  mla_name text default 'Prasanta Phukan',
  mla_party text default 'BJP',
  mla_constituency text default 'Dibrugarh',
  mp_name text default 'Sarbananda Sonowal',
  mp_party text default 'BJP'
);

-- ─── Report seen table (for "I've seen this" dedup) ─────────────────────────

create table if not exists report_seen (
  report_id uuid references reports(id) on delete cascade,
  device_fingerprint text not null,
  created_at timestamptz default now(),
  primary key (report_id, device_fingerprint)
);

-- ─── Admin allow-list ───────────────────────────────────────────────────────
-- Mirrors the client allow-list in data/admins.js. Used by RLS policies to gate
-- moderation. Keep both lists in sync.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'xakkhi.official@gmail.com',
    'royannwesha01@gmail.com'
  );
$$;

-- ─── Row Level Security ─────────────────────────────────────────────────────

alter table reports enable row level security;
alter table report_actions enable row level security;
alter table wards enable row level security;
alter table report_seen enable row level security;

-- reports: anyone reads; anyone inserts a *fresh* report (forge-able fields
-- pinned to their defaults); only service_role / admins update; only service_role deletes.
create policy "Public read reports" on reports for select using (true);

create policy "Public insert reports" on reports for insert
  with check (
    status = 'unresolved'
    and coalesce(is_removed, false) = false
    and resolved_at is null
    and after_photo_url is null
    and coalesce(resolved_by_citizen, false) = false
    and coalesce(seen_count, 0) = 0
  );

create policy "Service update reports" on reports for update using (auth.role() = 'service_role');
create policy "reports update admin" on reports for update to authenticated using (is_admin()) with check (is_admin());
create policy "Service delete reports" on reports for delete using (auth.role() = 'service_role');

-- report_actions: anyone files a pending cleanup/flag; only admins read & decide.
create policy "report_actions insert anon" on report_actions for insert to anon, authenticated
  with check (status = 'pending' and action_type in ('cleanup', 'flag'));
create policy "report_actions read admin" on report_actions for select to authenticated using (is_admin());
create policy "report_actions update admin" on report_actions for update to authenticated using (is_admin()) with check (is_admin());

-- wards: public read.
create policy "Public read wards" on wards for select using (true);

-- report_seen: public read + insert (dedup only, no sensitive data).
create policy "Public read report_seen" on report_seen for select using (true);
create policy "Public insert report_seen" on report_seen for insert with check (true);

-- ─── Seed all 22 wards ──────────────────────────────────────────────────────

insert into wards (ward_number, area_name, area_name_local, commissioner_name, commissioner_phone, commissioner_position, center_lat, center_lng) values
  (1,  'East Barbari',              'পূব বাৰবাৰী',              'Gautam Dutta',                '7896009989', 'Member',         27.4887, 94.9341),
  (2,  'Nizkadamani',               'নিজকদমনি',                 'Darshan Das',                 '8638149615', 'Member',         27.4744, 94.9350),
  (3,  'Kadamoni',                  'কদমনি',                    null,                          null,         'Vacant',         27.4724, 94.9244),
  (4,  'Central Chowkidinghee',     'মধ্য চৌকিডিঙি',            'Pranab Kalita',               '9085789411', 'Member',         27.4703, 94.9170),
  (5,  'Milan Nagar',               'মিলন নগৰ',                 'Dibyajyoti Hazarika',         '6002380649', 'Member',         27.4595, 94.9086),
  (6,  'Mancotta',                  'মানকটা',                   'Hemlata Saikia',              '9854305567', 'Member',         27.4699, 94.9026),
  (7,  'South Amolapatty',          'দক্ষিণ আমলাপট্টি',         'Binuma Das',                  '6001637472', 'Member',         27.4747, 94.8909),
  (8,  'Chapori / Santipara',       'চাপৰি / শান্তিপাৰা',       'Ratan Paul',                  '9401102045', 'Member',         27.4744, 94.8985),
  (9,  'Ubi / Sadar Thana',         'উবি / চাদৰ থানা',          'Sraban Kumar Das',            '9954732909', 'Member',         27.4802, 94.8981),
  (10, 'North Amolapatty',          'উত্তৰ আমলাপট্টি',          'Samsun Nahar Hussain Ahmed',  '9954567151', 'Member',         27.4824, 94.8997),
  (11, 'Jail Area',                 'জেল এলেকা',                'Ujjal Phukan',                '9954388449', 'Vice Chairman',  27.4822, 94.9028),
  (12, 'West Santipara',            'পশ্চিম শান্তিপাৰা',        'Pompi Roy Chowdhury',         '9435636369', 'Member',         27.4733, 94.9032),
  (13, 'West Chowkidinghee',        'পশ্চিম চৌকিডিঙি',          'Topa Dey',                    '9101283921', 'Member',         27.4736, 94.9054),
  (14, 'East Chowkidinghee',        'পূব চৌকিডিঙি',             'Dr. Saikat Patra',            '7002184138', 'Chairman',       27.4740, 94.9084),
  (15, 'Khalihamari',               'খলিহামাৰী',                'Sikha Chowdhury',             '7002847427', 'Member',         27.4811, 94.9117),
  (16, 'Police Reserve',            'পুলিচ ৰিজাৰ্ভ',            'Mamun Gogoi Mitra',           '8638159194', 'Member',         27.4836, 94.9091),
  (17, 'Graham Bazar',              'গ্ৰেহাম বজাৰ',             'Nirupa Dutta',                '9706172642', 'Member',         27.4885, 94.9154),
  (18, 'Gabharupathar',             'গভৰুপথাৰ',                 'Simanta Baruah',              '9401512129', 'Member',         27.4832, 94.9201),
  (19, 'Railway Colony / Nalipool', 'ৰেলৱে কলনী / নলীপুল',      'Moonmoon Das',                '8486717137', 'Member',         27.4841, 94.9292),
  (20, 'Barbari',                   'বাৰবাৰী',                  'Dipali Dey',                  '9101893837', 'Member',         27.4867, 94.9252),
  (21, 'Jyotinagar',                'জ্যোতিনগৰ',               'Bratish Kanti Das',           '6001575981', 'Member',         27.4886, 94.9259),
  (22, 'Paltan Bazar',              'পল্টন বজাৰ',               'Sima Das',                    '9707256139', 'Member',         27.4935, 94.9255)
on conflict (ward_number) do nothing;
