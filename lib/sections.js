// Daftar section laporan PKL, urut sesuai struktur baku.
// Tambah/kurang section di sini otomatis kepake di wizard form & export docx.

export const SECTIONS = [
  {
    key: 'kata_pengantar',
    heading: 'KATA PENGANTAR',
    placeholder: 'Puji syukur kami panjatkan kepada Tuhan Yang Maha Esa atas rahmat dan karunia-Nya...',
    group: 'Pembuka',
  },
  {
    key: 'bab1_latar_belakang',
    heading: 'BAB I PENDAHULUAN — Latar Belakang',
    placeholder: 'Jelaskan alasan/tujuan sekolah mengadakan program PKL, kenapa dilaksanakan di tempat ini...',
    group: 'BAB I',
  },
  {
    key: 'bab1_tujuan',
    heading: 'BAB I PENDAHULUAN — Tujuan PKL',
    placeholder: 'a. ...\nb. Meningkatkan keterampilan teknis dalam pencatatan, jurnal, neraca...',
    group: 'BAB I',
  },
  {
    key: 'bab1_manfaat',
    heading: 'BAB I PENDAHULUAN — Manfaat PKL',
    placeholder: 'Manfaat bagi siswa, sekolah, dan perusahaan...',
    group: 'BAB I',
  },
  {
    key: 'bab2_profil',
    heading: 'BAB II GAMBARAN UMUM — Profil Perusahaan/Instansi',
    placeholder: 'Sejarah singkat, lokasi, bidang usaha tempat PKL...',
    group: 'BAB II',
    allowImages: true,
  },
  {
    key: 'bab2_visi_misi',
    heading: 'BAB II GAMBARAN UMUM — Visi & Misi',
    placeholder: 'Visi:\n...\n\nMisi:\n...',
    group: 'BAB II',
  },
  {
    key: 'bab2_struktur_organisasi',
    heading: 'BAB II GAMBARAN UMUM — Struktur Organisasi',
    placeholder: 'Jelaskan struktur organisasi tempat PKL (bisa upload gambar bagan di bawah)...',
    group: 'BAB II',
    allowImages: true,
  },
  {
    key: 'bab3_pelaksanaan',
    heading: 'BAB III PELAKSANAAN KEGIATAN PRAKTIK',
    placeholder: 'Ceritakan kegiatan yang dilakukan selama PKL, bidang kerja, tugas harian, kendala dan solusi...',
    group: 'BAB III',
    allowImages: true,
  },
  {
    key: 'bab4_kesimpulan',
    heading: 'BAB IV PENUTUP — Kesimpulan',
    placeholder: 'Rangkuman hasil PKL secara keseluruhan...',
    group: 'BAB IV',
  },
  {
    key: 'bab4_saran',
    heading: 'BAB IV PENUTUP — Saran',
    placeholder: 'Saran untuk sekolah, untuk tempat PKL, untuk siswa angkatan selanjutnya...',
    group: 'BAB IV',
  },
  {
    key: 'daftar_pustaka',
    heading: 'DAFTAR PUSTAKA',
    placeholder: 'Sumber 1 - format bebas dulu, tiap sumber baris baru\nSumber 2 - ...',
    group: 'Penutup',
  },
];

export const GROUPS = ['Pembuka', 'BAB I', 'BAB II', 'BAB III', 'BAB IV', 'Penutup'];
