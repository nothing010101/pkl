import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SAVE_DELAY = 900; // ms, autosave debounce

export default function SectionEditor({ reportId, section, initialContent, onSaved, images, onImagesChange }) {
  const [text, setText] = useState(initialContent || '');
  const [status, setStatus] = useState('idle'); // idle | saving | saved
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setText(initialContent || '');
  }, [section.key]);

  function handleChange(e) {
    const value = e.target.value;
    setText(value);
    setStatus('saving');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(value), SAVE_DELAY);
  }

  async function save(value) {
    const { error } = await supabase
      .from('report_sections')
      .upsert(
        {
          report_id: reportId,
          section_key: section.key,
          heading: section.heading,
          content: value,
        },
        { onConflict: 'report_id,section_key' }
      );
    if (!error) {
      setStatus('saved');
      onSaved && onSaved(section.key);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const path = `${reportId}/${section.key}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(path, file);
    if (uploadError) {
      alert('Upload gagal: ' + uploadError.message);
      return;
    }
    const { data, error } = await supabase
      .from('report_images')
      .insert({ report_id: reportId, section_key: section.key, storage_path: path, caption: '' })
      .select()
      .single();
    if (!error) {
      onImagesChange([...(images || []), data]);
    }
    e.target.value = '';
  }

  async function updateCaption(imageId, caption) {
    await supabase.from('report_images').update({ caption }).eq('id', imageId);
    onImagesChange(images.map((img) => (img.id === imageId ? { ...img, caption } : img)));
  }

  async function removeImage(imageId, storagePath) {
    await supabase.storage.from('report-images').remove([storagePath]);
    await supabase.from('report_images').delete().eq('id', imageId);
    onImagesChange(images.filter((img) => img.id !== imageId));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-sm text-neutral-200">{section.heading}</h2>
        <span className="text-xs text-neutral-500">
          {status === 'saving' ? 'Menyimpan...' : status === 'saved' ? 'Tersimpan' : ''}
        </span>
      </div>

      <textarea
        className="w-full min-h-[220px] bg-neutral-900 rounded-xl px-3 py-3 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-neutral-600 resize-y"
        placeholder={section.placeholder}
        value={text}
        onChange={handleChange}
      />

      {section.allowImages && (
        <div className="space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs bg-neutral-800 rounded-lg px-3 py-2 font-medium"
          >
            + Tambah foto (kamera/galeri)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleUpload}
          />

          {(images || []).map((img) => (
            <div key={img.id} className="flex items-center gap-2 bg-neutral-900 rounded-lg p-2">
              <img
                src={supabase.storage.from('report-images').getPublicUrl(img.storage_path).data.publicUrl}
                className="w-14 h-14 object-cover rounded-md shrink-0"
                alt=""
              />
              <input
                className="flex-1 bg-neutral-800 rounded-md px-2 py-1 text-xs outline-none"
                placeholder="Keterangan gambar"
                defaultValue={img.caption}
                onBlur={(e) => updateCaption(img.id, e.target.value)}
              />
              <button
                onClick={() => removeImage(img.id, img.storage_path)}
                className="text-xs text-red-400 shrink-0"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
