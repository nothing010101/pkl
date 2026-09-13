import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { getSupabaseServer } from '../../lib/supabaseServer';
import { SECTIONS } from '../../lib/sections';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reportId } = req.body;
  if (!reportId) return res.status(400).json({ error: 'reportId wajib diisi' });

  const supabase = getSupabaseServer();

  const [{ data: report }, { data: members }, { data: sections }, { data: signers }, { data: logs }] =
    await Promise.all([
      supabase.from('reports').select('*').eq('id', reportId).single(),
      supabase.from('report_members').select('*').eq('report_id', reportId).order('sort_order'),
      supabase.from('report_sections').select('*').eq('report_id', reportId),
      supabase.from('approval_signers').select('*').eq('report_id', reportId).order('sort_order'),
      supabase.from('daily_logs').select('*').eq('report_id', reportId).order('log_date'),
    ]);

  if (!report) return res.status(404).json({ error: 'Laporan gak ketemu' });

  const sectionMap = {};
  (sections || []).forEach((s) => (sectionMap[s.section_key] = s.content));

  const children = [];

  // ---------- COVER ----------
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 400 },
      children: [
        new TextRun({ text: (report.title || '').toUpperCase(), bold: true, size: 32 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: `Di ${report.place_name || '-'}`, bold: true, size: 26 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
      children: [new TextRun({ text: 'Disusun oleh:', size: 24 })],
    })
  );

  (members || []).forEach((m) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `${m.full_name}   ${m.student_number || ''}`, size: 24 })],
      })
    );
  });

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 },
      children: [new TextRun({ text: (report.major || '').toUpperCase(), bold: true, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: (report.school_name || '').toUpperCase(), bold: true, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: String(report.year || ''), bold: true, size: 24 })],
    }),
    new Paragraph({ pageBreakBefore: true, children: [] })
  );

  // ---------- LEMBAR PENGESAHAN ----------
  ['industri', 'sekolah'].forEach((side) => {
    const rows = (signers || []).filter((s) => s.side === side);
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: `LEMBAR PENGESAHAN PIHAK ${side.toUpperCase()}`,
          }),
        ],
      })
    );
    rows.forEach((s) => {
      children.push(
        new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: s.role_label, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: '\n\n' })] }),
        new Paragraph({ children: [new TextRun({ text: s.person_name || '..............................', bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: s.person_number ? `NUP. ${s.person_number}` : '' })] })
      );
    });
    children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
  });

  // ---------- SECTIONS (Kata Pengantar, BAB I-IV, dst) ----------
  let lastGroup = null;
  SECTIONS.forEach((sec) => {
    const content = sectionMap[sec.key] || '';
    if (sec.group !== lastGroup) {
      lastGroup = sec.group;
    }
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text: sec.heading })],
      })
    );
    const paragraphs = content.split('\n\n').filter(Boolean);
    if (paragraphs.length === 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: '(belum diisi)', italics: true, color: '999999' })] }));
    }
    paragraphs.forEach((p) => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200, line: 360 },
          indent: { firstLine: 720 },
          children: [new TextRun({ text: p, size: 24 })],
        })
      );
    });
  });

  // ---------- LAMPIRAN: JURNAL KEGIATAN HARIAN ----------
  if ((members || []).length > 0) {
    children.push(
      new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'LAMPIRAN' })] })
    );

    members.forEach((m) => {
      const memberLogs = (logs || []).filter((l) => l.member_id === m.id);
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          children: [new TextRun({ text: `Jurnal Kegiatan PKL — ${m.full_name}` })],
        })
      );

      const headerRow = new TableRow({
        children: ['No', 'Hari/Tanggal', 'Kegiatan'].map(
          (h) =>
            new TableCell({
              width: { size: h === 'Kegiatan' ? 60 : 20, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
            })
        ),
      });

      const dataRows = (memberLogs.length ? memberLogs : [null]).map(
        (log, i) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(log ? String(i + 1) : '')] }),
              new TableCell({ children: [new Paragraph(log ? String(log.log_date) : '')] }),
              new TableCell({ children: [new Paragraph(log ? log.activity : '')] }),
            ],
          })
      );

      children.push(
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }),
        new Paragraph({ children: [] })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 in twips
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 }, // 4-3-3-3 cm ala skripsi
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 }, // 12pt
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${(report.title || 'laporan').replace(/\s+/g, '_')}.docx"`);
  res.send(buffer);
}
