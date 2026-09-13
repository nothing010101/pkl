-- ============================================================
-- SKEMA DATABASE: PKL Report Builder
-- Jalankan file ini di Supabase Dashboard > SQL Editor > New Query
-- Klik "Run" sekali, semua tabel + RLS langsung kebuat.
-- ============================================================

-- 1. Tabel utama laporan
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  share_code text unique not null default substr(md5(random()::text), 1, 8),
  title text not null default 'Laporan Praktik Kerja Lapangan',
  place_name text,               -- nama tempat PKL, misal "BTN Syariah KCS Tegal"
  school_name text,               -- nama sekolah
  major text,                     -- jurusan, misal "Akuntansi Keuangan Lembaga"
  foundation_name text,           -- nama yayasan (opsional)
  year int default extract(year from now()),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Anggota tim penyusun laporan (bisa lebih dari 1 siswa)
create table if not exists report_members (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  full_name text not null,
  student_number text,            -- NIS/NISN
  sort_order int default 0
);

-- 3. Isi tiap section (Kata Pengantar, BAB I - IV, Daftar Pustaka, dst)
-- section_key = slug tetap, misal: 'kata_pengantar', 'bab1_latar_belakang', dst
create table if not exists report_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  section_key text not null,
  heading text,                   -- judul tampil, misal "BAB I PENDAHULUAN"
  content text default '',        -- isi teks (plain text, paragraf dipisah \n\n)
  sort_order int default 0,
  unique (report_id, section_key)
);

-- 4. Gambar yang diupload (logo, foto kantor, dokumentasi, dll)
create table if not exists report_images (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  section_key text not null,      -- section tempat gambar ini nempel
  storage_path text not null,     -- path di Supabase Storage bucket 'report-images'
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 5. Jurnal kegiatan harian per anggota (lampiran)
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  member_id uuid references report_members(id) on delete cascade,
  log_date date not null,
  activity text not null,
  sort_order int default 0
);

-- 6. Lembar pengesahan: tanda tangan pihak industri & sekolah
create table if not exists approval_signers (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  side text not null check (side in ('industri', 'sekolah')),
  role_label text not null,       -- misal "Pimpinan DU/DI", "Kepala Sekolah"
  person_name text,
  person_number text,             -- NUP/NIP kalau ada
  sort_order int default 0
);

-- ============================================================
-- Trigger: auto update updated_at
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reports_updated on reports;
create trigger trg_reports_updated
before update on reports
for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- Model akses: pemilik (owner_id) BEBAS akses.
-- Siapapun yang tau share_code bisa akses report itu juga (buat kerja tim tanpa login ribet)
-- Ini disengaja sesuai kebutuhan: gampang share ke temen kerja tim.
-- Kalau mau lebih ketat nanti, tinggal ubah policy report_images/report_sections dst
-- supaya cek report_id in (select id from reports where owner_id = auth.uid())
-- ============================================================

alter table reports enable row level security;
alter table report_members enable row level security;
alter table report_sections enable row level security;
alter table report_images enable row level security;
alter table daily_logs enable row level security;
alter table approval_signers enable row level security;

-- reports: siapa aja bisa insert (buat laporan baru tanpa wajib login dulu),
-- select/update/delete hanya kalau punya, atau anonim (owner_id null, mode "no-login")
create policy "reports_select" on reports for select using (true);
create policy "reports_insert" on reports for insert with check (true);
create policy "reports_update" on reports for update using (true);
create policy "reports_delete" on reports for delete using (true);

create policy "members_all" on report_members for all using (true) with check (true);
create policy "sections_all" on report_sections for all using (true) with check (true);
create policy "images_all" on report_images for all using (true) with check (true);
create policy "logs_all" on daily_logs for all using (true) with check (true);
create policy "signers_all" on approval_signers for all using (true) with check (true);

-- ============================================================
-- Storage bucket untuk gambar laporan
-- ============================================================
insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

create policy "public read report images"
on storage.objects for select
using (bucket_id = 'report-images');

create policy "anyone upload report images"
on storage.objects for insert
with check (bucket_id = 'report-images');

-- ============================================================
-- SELESAI. Lanjut ke README.md untuk setup .env
-- ============================================================
