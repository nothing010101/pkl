import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState('Laporan Praktik Kerja Lapangan');
  const [placeName, setPlaceName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createReport(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('reports')
      .insert({ title, place_name: placeName, school_name: schoolName })
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/report/${data.id}`);
  }

  async function openByCode(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('reports')
      .select('id')
      .eq('share_code', code.trim())
      .single();
    setLoading(false);
    if (error || !data) {
      setError('Kode gak ketemu, cek lagi.');
      return;
    }
    router.push(`/report/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10">
      <div className="max-w-md mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-semibold">Laporan PKL Builder</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Isi laporan PKL langsung dari HP, tanpa laptop.
          </p>
        </div>

        <form onSubmit={createReport} className="space-y-3 bg-neutral-900 p-4 rounded-xl">
          <h2 className="font-medium">Buat laporan baru</h2>
          <input
            className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-500"
            placeholder="Judul laporan"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-500"
            placeholder="Nama tempat PKL"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
          />
          <input
            className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-500"
            placeholder="Nama sekolah"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
          <button
            disabled={loading}
            className="w-full bg-neutral-100 text-neutral-900 rounded-lg py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Membuat...' : 'Mulai isi laporan'}
          </button>
        </form>

        <form onSubmit={openByCode} className="space-y-3 bg-neutral-900 p-4 rounded-xl">
          <h2 className="font-medium">Lanjutin laporan (punya kode)</h2>
          <input
            className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-500"
            placeholder="Masukin share code, misal a1b2c3d4"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="w-full bg-neutral-800 rounded-lg py-2 text-sm font-medium">
            Buka laporan
          </button>
        </form>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}
