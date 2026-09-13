# PKL Report Builder

Web buat anak PKL isi laporan formal (cover, lembar pengesahan, BAB I-IV, jurnal
harian) langsung dari HP, lalu export ke `.docx`.

## 1. Setup Supabase (gratis)

1. Buka https://supabase.com → Sign up / login → **New Project**
2. Kasih nama project bebas, catat **Database Password** yang digenerate
   (gak dipakai langsung di sini, tapi simpan buat jaga-jaga)
3. Tunggu project selesai provisioning (~2 menit)

## 2. Jalanin SQL schema

1. Di dashboard project, buka menu **SQL Editor** (ikon di sidebar kiri)
2. Klik **New query**
3. Buka file `supabase/schema.sql` di project ini, copy semua isinya
4. Paste ke SQL Editor, klik **Run** (atau Ctrl+Enter)
5. Kalau muncul "Success. No rows returned" — berarti semua tabel, RLS
   policy, dan storage bucket udah kebuat. Cek di menu **Table Editor**,
   harus muncul tabel: `reports`, `report_members`, `report_sections`,
   `report_images`, `daily_logs`, `approval_signers`

Kalau nanti mau ubah skema (nambah kolom dll), edit `schema.sql`, lalu
jalanin lagi query yang berubah aja di SQL Editor (jangan run ulang semua,
karena `create table if not exists` gak akan re-create tabel yang udah ada —
kalau mau ubah struktur tabel yang sudah ada, pakai `alter table ...`).

## 3. Ambil API keys

1. Di dashboard, buka **Project Settings** (ikon gear) → **API**
2. Copy tiga hal ini:
   - **Project URL** → jadi `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → jadi `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (klik "Reveal") → jadi `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **service_role key JANGAN pernah dipakai di kode yang jalan di browser.**
Di project ini dia cuma dipake di `pages/api/export-docx.js` (server-side),
aman.

## 4. Isi environment variables

Lokal (buat testing di laptop/HP sendiri dulu sebelum deploy):

```bash
cp .env.local.example .env.local
# lalu edit .env.local, isi 3 value di atas
```

Di Vercel (buat production):

1. Push project ini ke GitHub
2. Import repo di https://vercel.com/new
3. Sebelum klik Deploy, buka **Environment Variables**, isi 3 variable
   yang sama kayak di `.env.local`
4. Deploy

## 5. Jalanin lokal (opsional, buat ngetes dulu)

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`

## Cara pakai

1. Buka web → isi judul laporan, tempat PKL, nama sekolah → "Mulai isi laporan"
2. Dapet **share code** (misal `a1b2c3d4`) — kasih ke temen tim kalau mau
   isi bareng dari HP masing-masing (buka web → "Lanjutin laporan" → masukin
   kode)
3. Isi tiap BAB lewat tab section di atas, autosave jalan sendiri
4. Upload foto langsung dari kamera HP di section yang butuh gambar
5. Kalau udah, klik **Export .docx** → file kebuka di Word buat finishing
   (kasih ke pembimbing buat direvisi, dll)

## Yang masih perlu ditambahin (belum ada di versi ini)

- Form input anggota tim (`report_members`), lembar pengesahan
  (`approval_signers`), dan jurnal harian (`daily_logs`) — skema database +
  generator docx-nya udah ada, tinggal bikin form UI-nya (belum dibikin di
  versi awal ini biar scope-nya kekejar)
- Export ke PDF (saat ini baru .docx)
- Auto Daftar Isi / Daftar Gambar di file docx (saat ini heading udah pakai
  Heading Style jadi TOC BISA di-generate otomatis di Word dengan
  References > Table of Contents, tapi belum auto-insert dari kode)
- Login akun asli (saat ini akses cuma pakai share_code, siapa aja yang
  punya kode bisa edit — cukup buat kerja tim internal, tapi bukan proteksi
  kuat)
