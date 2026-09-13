import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { SECTIONS } from '../../lib/sections';
import SectionNav from '../../components/SectionNav';
import SectionEditor from '../../components/SectionEditor';

export default function ReportEditor() {
  const router = useRouter();
  const { id } = router.query;

  const [report, setReport] = useState(null);
  const [activeKey, setActiveKey] = useState(SECTIONS[0].key);
  const [sectionsData, setSectionsData] = useState({}); // key -> content
  const [imagesData, setImagesData] = useState({}); // key -> [images]
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  async function loadAll() {
    setLoading(true);
    const [{ data: reportRow }, { data: sections }, { data: images }] = await Promise.all([
      supabase.from('reports').select('*').eq('id', id).single(),
      supabase.from('report_sections').select('*').eq('report_id', id),
      supabase.from('report_images').select('*').eq('report_id', id),
    ]);

    setReport(reportRow);

    const secMap = {};
    (sections || []).forEach((s) => (secMap[s.section_key] = s.content));
    setSectionsData(secMap);

    const imgMap = {};
    (images || []).forEach((img) => {
      imgMap[img.section_key] = [...(imgMap[img.section_key] || []), img];
    });
    setImagesData(imgMap);

    setLoading(false);
  }

  function markSaved(key, content) {
    setSectionsData((prev) => ({ ...prev, [key]: content }));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id }),
      });
      if (!res.ok) throw new Error('Export gagal');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.title || 'laporan-pkl'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  }

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center text-sm">
        Memuat laporan...
      </div>
    );
  }

  const activeSection = SECTIONS.find((s) => s.key === activeKey);
  const doneKeys = new Set(Object.keys(sectionsData).filter((k) => sectionsData[k]?.trim()));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      <div className="sticky top-0 bg-neutral-950/95 backdrop-blur border-b border-neutral-900 px-4 pt-4 pb-2 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-sm font-semibold truncate max-w-[220px]">{report.title}</h1>
            <p className="text-xs text-neutral-500">Kode: {report.share_code}</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-neutral-100 text-neutral-900 text-xs font-medium rounded-lg px-3 py-2 disabled:opacity-50"
          >
            {exporting ? 'Membuat file...' : 'Export .docx'}
          </button>
        </div>
        <SectionNav activeKey={activeKey} onSelect={setActiveKey} doneKeys={doneKeys} />
      </div>

      <div className="px-4 pt-4">
        <SectionEditor
          reportId={id}
          section={activeSection}
          initialContent={sectionsData[activeKey]}
          onSaved={(key) => markSaved(key, sectionsData[key])}
          images={imagesData[activeKey]}
          onImagesChange={(imgs) => setImagesData((prev) => ({ ...prev, [activeKey]: imgs }))}
        />
      </div>
    </div>
  );
}
