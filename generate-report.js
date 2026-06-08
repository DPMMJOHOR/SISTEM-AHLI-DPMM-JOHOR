const pptx = require('pptxgenjs');

const prs = new pptx();
const SH = prs.ShapeType;

// ── THEME ─────────────────────────────────────────────────────────────────
const C = {
  purple:     '3D0066',
  purpleMid:  '6A0DAD',
  purpleLt:   'EDE7F6',
  gold:       'C9A63C',
  goldLt:     'FFF8E1',
  white:      'FFFFFF',
  dark:       '1A1032',
  text:       '2D2D2D',
  muted:      '777777',
  green:      '2E7D32',
  greenLt:    'E8F5E9',
  blueLt:     'E3F2FD',
  blue:       '1565C0',
  orangeLt:   'FFF3E0',
  orange:     'E65100',
};

const FONT_HEAD  = 'Georgia';
const FONT_BODY  = 'Calibri';
const W = 10, H = 7.5;

// ── HELPER: section label ─────────────────────────────────────────────────
function sectionLabel(slide, text, x, y) {
  slide.addText(text, {
    x, y, w: 3, h: 0.22,
    fontSize: 7, bold: true, color: C.gold,
    fontFace: FONT_BODY, charSpacing: 3,
    align: 'left',
  });
}

// ── HELPER: badge ─────────────────────────────────────────────────────────
function badge(slide, text, x, y, bg, fg) {
  slide.addShape(SH.roundRect, {
    x, y, w: 1.4, h: 0.28, rectRadius: 0.1,
    fill: { color: bg }, line: { color: bg },
  });
  slide.addText(text, {
    x, y, w: 1.4, h: 0.28,
    fontSize: 8, bold: true, color: fg,
    fontFace: FONT_BODY, align: 'center', valign: 'middle',
  });
}

// ── HELPER: info card ─────────────────────────────────────────────────────
function card(slide, icon, title, lines, x, y, w, h, bgColor) {
  slide.addShape(SH.roundRect, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: bgColor || C.purpleLt },
    line: { color: 'E0D0F0', size: 1 },
  });
  slide.addText(icon, {
    x: x + 0.15, y: y + 0.1, w: 0.45, h: 0.45,
    fontSize: 20, align: 'center', valign: 'middle',
  });
  slide.addText(title, {
    x: x + 0.65, y: y + 0.1, w: w - 0.8, h: 0.3,
    fontSize: 10, bold: true, color: C.purple, fontFace: FONT_HEAD,
  });
  slide.addText(lines.join('\n'), {
    x: x + 0.65, y: y + 0.38, w: w - 0.8, h: h - 0.5,
    fontSize: 8.5, color: C.text, fontFace: FONT_BODY,
    align: 'left', valign: 'top', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// SLIDE 1 — COVER
// ─────────────────────────────────────────────────────────────────────────
{
  const s = prs.addSlide();

  // full background
  s.addShape(SH.rect, { x:0, y:0, w:W, h:H, fill:{ color: C.dark }, line:{ color: C.dark } });

  // decorative arc/stripe left
  s.addShape(SH.rect, { x:0, y:0, w:0.55, h:H, fill:{ color: C.purple }, line:{ color: C.purple } });

  // gold accent bar
  s.addShape(SH.rect, { x:0.55, y:2.6, w:8.6, h:0.06, fill:{ color: C.gold }, line:{ color: C.gold } });

  // top label
  s.addText('DPMM NEGERI JOHOR', {
    x:0.85, y:1.7, w:8, h:0.35,
    fontSize: 10, bold: true, color: C.gold,
    fontFace: FONT_BODY, charSpacing: 5, align: 'left',
  });

  // main title
  s.addText('Laporan Sistem Digital', {
    x:0.85, y:2.05, w:8.2, h:0.8,
    fontSize: 40, bold: true, color: C.white,
    fontFace: FONT_HEAD, align: 'left',
  });

  // subtitle
  s.addText('Gambaran Keseluruhan Platform Pengurusan Ahli & Mesyuarat', {
    x:0.85, y:2.82, w:8, h:0.45,
    fontSize: 13, color: 'BBAADD',
    fontFace: FONT_BODY, align: 'left',
  });

  // three system pills
  const pills = [
    { t: 'Borang Permohonan DPMM', bg: C.purpleMid },
    { t: 'Sistem Ahli DPMM', bg: C.purpleMid },
    { t: 'Sistem Mesyuarat', bg: '4A2060' },
  ];
  pills.forEach((p, i) => {
    const px = 0.85 + i * 2.7;
    s.addShape(SH.roundRect, {
      x: px, y: 3.5, w: 2.5, h: 0.38, rectRadius: 0.19,
      fill: { color: p.bg }, line: { color: C.gold, size: 1 },
    });
    s.addText(p.t, {
      x: px, y: 3.5, w: 2.5, h: 0.38,
      fontSize: 9.5, bold: true, color: C.white,
      fontFace: FONT_BODY, align: 'center', valign: 'middle',
    });
  });

  // bottom date + org
  s.addShape(SH.rect, { x:0.55, y:6.5, w:9.45, h:1.0, fill:{ color: C.purple }, line:{ color: C.purple } });
  s.addText('Dewan Perniagaan Melayu Malaysia Negeri Johor  |  Jun 2026', {
    x:0.85, y:6.62, w:8.6, h:0.35,
    fontSize: 10, color: C.gold, fontFace: FONT_BODY, align: 'center',
  });
  s.addText('SULIT — Dokumen Dalaman Sahaja', {
    x:0.85, y:6.95, w:8.6, h:0.28,
    fontSize: 8, color: 'BBAADD', fontFace: FONT_BODY, align: 'center',
  });

  // decorative dots
  for(let i=0;i<6;i++){
    s.addShape(SH.ellipse, {
      x: 8.0 + (i%3)*0.35, y: 1.0 + Math.floor(i/3)*0.35, w:0.18, h:0.18,
      fill:{ color: i<3 ? C.gold : '5A3080' }, line:{ color: i<3 ? C.gold : '5A3080' }
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SLIDE 2 — borang.html
// ─────────────────────────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  s.addShape(SH.rect, { x:0,y:0,w:W,h:H, fill:{color:C.white}, line:{color:C.white} });

  // left sidebar
  s.addShape(SH.rect, { x:0,y:0,w:0.55,h:H, fill:{color:C.purple}, line:{color:C.purple} });

  // header band
  s.addShape(SH.rect, { x:0.55,y:0,w:9.45,h:1.35, fill:{color:C.purpleLt}, line:{color:C.purpleLt} });
  s.addShape(SH.rect, { x:0.55,y:1.32,w:9.45,h:0.05, fill:{color:C.gold}, line:{color:C.gold} });

  sectionLabel(s, 'MUKA SURAT 2 DARIPADA 5', 0.75, 0.1);
  s.addText('Borang Permohonan DPMM', { x:0.75,y:0.28,w:7,h:0.55, fontSize:28, bold:true, color:C.purple, fontFace:FONT_HEAD });
  s.addText('Borang Permohonan Keahlian — Akses Awam Tanpa Login', { x:0.75,y:0.82,w:7,h:0.35, fontSize:12, color:C.muted, fontFace:FONT_BODY });
  badge(s, '✅ OPERASI', 7.8, 0.5, C.green, C.white);

  // URL
  s.addText('🌐  https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html', {
    x:0.75, y:1.45, w:9, h:0.28, fontSize:8.5, color:C.blue, fontFace:FONT_BODY, align:'left',
  });

  // LEFT COLUMN — steps
  s.addText('ALIRAN 7 LANGKAH PERMOHONAN', {
    x:0.75, y:1.85, w:4.5, h:0.28, fontSize:8, bold:true, color:C.purple, fontFace:FONT_BODY, charSpacing:2,
  });

  const steps = [
    ['1', 'Jenis Keahlian & Fasal', 'Pilih ENT / SB dan fasal berkaitan (6.2.1–6.2.5)'],
    ['2', 'Maklumat Entiti', 'Nama syarikat, SSM, alamat, sektor perniagaan'],
    ['3', 'Jualan Tahunan', 'Data jualan 4 tahun, modal berbayar & pusingan'],
    ['4', 'Pemegang Saham', 'Sehingga 5 pemegang saham & ahli lembaga'],
    ['5', 'Muat Naik Dokumen', 'IC, SSM, Borang 9/24/49, Sijil, Bukti bayaran'],
    ['6', 'Bayaran & Akuan', 'Fi daftar + yuran tahunan, kaedah bayaran, PDPA'],
    ['7', 'Semak & Hantar', 'Ringkasan penuh, jana Ref DPMMJHR/BARU/...'],
  ];
  steps.forEach((st, i) => {
    const sy = 2.18 + i * 0.63;
    s.addShape(SH.ellipse, { x:0.75,y:sy,w:0.35,h:0.35, fill:{color:C.purple}, line:{color:C.purple} });
    s.addText(st[0], { x:0.75,y:sy,w:0.35,h:0.35, fontSize:9, bold:true, color:C.white, fontFace:FONT_BODY, align:'center', valign:'middle' });
    s.addText(st[1], { x:1.18,y:sy,w:3.4,h:0.2, fontSize:9.5, bold:true, color:C.text, fontFace:FONT_BODY });
    s.addText(st[2], { x:1.18,y:sy+0.2,w:3.4,h:0.22, fontSize:7.5, color:C.muted, fontFace:FONT_BODY });
  });

  // RIGHT COLUMN — integrations
  const cards2 = [
    { icon:'🗄️', t:'Supabase Database', lines:['Jadual: PERMOHONAN_AHLI','40+ medan data permohonan','RLS + anon INSERT policy'], bg:C.purpleLt },
    { icon:'📁', t:'Supabase Storage', lines:['Bucket: permohonan-dokumen','15+ jenis dokumen, max 10MB','Retry logic + fallback URL'], bg:C.purpleLt },
    { icon:'✉️', t:'EmailJS Notifikasi', lines:['Admin: dpmmnj.pengurusan@gmail.com','Pemohon: emel entiti / proksi','Ref, jenis, jumlah, timestamp'], bg: C.purpleLt },
    { icon:'🤖', t:'AI Chatbot (Groq)', lines:['Ciri "Isi Pintar" — bantu isi borang','Auto-fill daripada dokumen SSM','API: Groq (model llama)'], bg: C.purpleLt },
  ];
  cards2.forEach((c, i) => {
    const row = Math.floor(i/2), col = i%2;
    card(s, c.icon, c.t, c.lines, 5.15 + col*2.35, 1.85 + row*1.65, 2.25, 1.52, c.bg);
  });
}

// ─────────────────────────────────────────────────────────────────────────
// SLIDE 3 — index.html (SISTEM-AHLI)
// ─────────────────────────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  s.addShape(SH.rect, { x:0,y:0,w:W,h:H, fill:{color:C.white}, line:{color:C.white} });
  s.addShape(SH.rect, { x:0,y:0,w:0.55,h:H, fill:{color:C.purple}, line:{color:C.purple} });
  s.addShape(SH.rect, { x:0.55,y:0,w:9.45,h:1.35, fill:{color:C.purpleLt}, line:{color:C.purpleLt} });
  s.addShape(SH.rect, { x:0.55,y:1.32,w:9.45,h:0.05, fill:{color:C.gold}, line:{color:C.gold} });

  sectionLabel(s, 'MUKA SURAT 3 DARIPADA 5', 0.75, 0.1);
  s.addText('Sistem Ahli DPMM', { x:0.75,y:0.28,w:7,h:0.55, fontSize:28, bold:true, color:C.purple, fontFace:FONT_HEAD });
  s.addText('Panel Pengurusan Pentadbir — Login Diperlukan', { x:0.75,y:0.82,w:8,h:0.35, fontSize:12, color:C.muted, fontFace:FONT_BODY });
  badge(s, '✅ OPERASI', 7.8, 0.5, C.green, C.white);

  s.addText('🌐  https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/', {
    x:0.75, y:1.45, w:9, h:0.28, fontSize:8.5, color:C.blue, fontFace:FONT_BODY,
  });

  // module grid — 2 rows x 4 cols
  const modules = [
    { icon:'📊', t:'Dashboard', d:'KPI ringkasan: jumlah ahli, yuran, SSM, tindakan susulan aktif' },
    { icon:'👥', t:'Senarai Ahli', d:'Cari, tapis, edit ahli. Eksport CSV. Susun mengikut daerah.' },
    { icon:'📋', t:'Permohonan Baru', d:'Semak permohonan status BARU. Ubah status, cetak rekod.' },
    { icon:'💰', t:'Yuran Tracker', d:'Penjejak yuran tahunan mengikut ahli & tahun semasa.' },
    { icon:'🏢', t:'SSM Tracker', d:'Semak tarikh luput SSM, hantar peringatan automatik.' },
    { icon:'📞', t:'Follow Up', d:'Senarai tindakan susulan tertunggak dengan status terkini.' },
    { icon:'📝', t:'Template Mesej', d:'CRUD templat WhatsApp/Email (jadual DPMM_TEMPLATES).' },
    { icon:'📄', t:'Dokumen', d:'Editor teks kaya, 7 kategori, simpan ke DPMM_DOKUMEN.' },
  ];
  modules.forEach((m, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const mx = 0.72 + col * 2.33, my = 1.82 + row * 1.55;
    s.addShape(SH.roundRect, {
      x:mx, y:my, w:2.22, h:1.42, rectRadius:0.1,
      fill:{ color: C.purpleLt }, line:{ color: 'D8C8F0', size: 1 },
    });
    s.addText(m.icon, { x:mx+0.08, y:my+0.08, w:0.45,h:0.45, fontSize:18, align:'center', valign:'middle' });
    s.addText(m.t, { x:mx+0.58,y:my+0.1,w:1.55,h:0.3, fontSize:10, bold:true, color:C.purple, fontFace:FONT_HEAD });
    s.addText(m.d, { x:mx+0.08,y:my+0.5,w:2.05,h:0.85, fontSize:7.8, color:C.text, fontFace:FONT_BODY, wrap:true, valign:'top' });
  });
}

// ─────────────────────────────────────────────────────────────────────────
// SLIDE 4 — SISTEM-MESYUARAT
// ─────────────────────────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  s.addShape(SH.rect, { x:0,y:0,w:W,h:H, fill:{color:C.white}, line:{color:C.white} });
  s.addShape(SH.rect, { x:0,y:0,w:0.55,h:H, fill:{color:C.purple}, line:{color:C.purple} });
  s.addShape(SH.rect, { x:0.55,y:0,w:9.45,h:1.35, fill:{color:C.goldLt}, line:{color:C.goldLt} });
  s.addShape(SH.rect, { x:0.55,y:1.32,w:9.45,h:0.05, fill:{color:C.gold}, line:{color:C.gold} });

  sectionLabel(s, 'MUKA SURAT 4 DARIPADA 5', 0.75, 0.1);
  s.addText('SISTEM-MESYUARAT', { x:0.75,y:0.28,w:7.5,h:0.55, fontSize:28, bold:true, color:C.purple, fontFace:FONT_HEAD });
  s.addText('Sistem Pengurusan Mesyuarat DPMM Negeri Johor', { x:0.75,y:0.82,w:7.5,h:0.35, fontSize:12, color:C.muted, fontFace:FONT_BODY });
  badge(s, '🔧 DIRANCANG', 7.6, 0.5, C.orange, C.white);

  // description
  s.addText('Sistem ini akan menguruskan keseluruhan kitaran mesyuarat — daripada penjadualan, penghantaran notis, penjejakan kehadiran hingga penyimpanan minit mesyuarat.', {
    x:0.75, y:1.48, w:9, h:0.45, fontSize:9.5, color:C.text, fontFace:FONT_BODY, wrap:true,
  });

  // features in 3 cols
  const feats = [
    {
      icon:'📅', title:'Jadual Mesyuarat',
      items:['Cipta & urus jadual mesyuarat','Set tarikh, masa & lokasi','Jenis: JKN / JKP / Agung Tahunan'],
      bg: C.purpleLt,
    },
    {
      icon:'📢', title:'Notis & Undangan',
      items:['Blast ke kumpulan yang betul','JKN → ahli JKN sahaja','JKP → ahli JKP sahaja','Agung → semua ahli','Via WhatsApp + Email'],
      bg: C.purpleLt,
    },
    {
      icon:'✅', title:'Kehadiran',
      items:['Rekod 4 status kehadiran','Hadir / Tidak Hadir','Belum Dihubungi / Lain-lain','Laporan kehadiran PDF'],
      bg: C.purpleLt,
    },
    {
      icon:'📝', title:'Minit Mesyuarat',
      items:['Editor minit mesyuarat','Simpan ke pangkalan data','Integrasi Google Drive','Akses semula bila-bila masa'],
      bg: C.purpleLt,
    },
    {
      icon:'👥', title:'Kumpulan Penerima',
      items:['Ahli Biasa (semua ahli)','Jawatankuasa Negeri (JKN)','Jawatankuasa Pengurusan (JKP)','Auto-detect daripada rekod ahli'],
      bg: C.purpleLt,
    },
    {
      icon:'💾', title:'Pangkalan Data',
      items:['DPMM_MESYUARAT (jadual)','DPMM_KEHADIRAN (rekod)','Integrasi Supabase sedia ada','Akses melalui panel admin'],
      bg: C.purpleLt,
    },
  ];
  feats.forEach((f, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const fx = 0.72 + col * 3.1, fy = 2.05 + row * 2.3;
    s.addShape(SH.roundRect, {
      x:fx, y:fy, w:2.95, h:2.1, rectRadius:0.12,
      fill:{ color: f.bg }, line:{ color: 'D8C8F0', size:1 },
    });
    s.addText(f.icon, { x:fx+0.12,y:fy+0.1,w:0.5,h:0.5, fontSize:20, align:'center',valign:'middle' });
    s.addText(f.title, { x:fx+0.68,y:fy+0.12,w:2.15,h:0.32, fontSize:10.5, bold:true, color:C.purple, fontFace:FONT_HEAD });
    f.items.forEach((it, j) => {
      s.addText('• ' + it, {
        x:fx+0.15, y:fy+0.55+j*0.3, w:2.65, h:0.28,
        fontSize:8, color:C.text, fontFace:FONT_BODY,
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────
// SLIDE 5 — TECHNICAL ARCHITECTURE SUMMARY
// ─────────────────────────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  s.addShape(SH.rect, { x:0,y:0,w:W,h:H, fill:{color:C.dark}, line:{color:C.dark} });
  s.addShape(SH.rect, { x:0,y:0,w:0.55,h:H, fill:{color:C.purple}, line:{color:C.purple} });

  // header
  s.addShape(SH.rect, { x:0.55,y:0,w:9.45,h:1.35, fill:{color:'2A1048'}, line:{color:'2A1048'} });
  s.addShape(SH.rect, { x:0.55,y:1.32,w:9.45,h:0.05, fill:{color:C.gold}, line:{color:C.gold} });
  sectionLabel(s, 'MUKA SURAT 5 DARIPADA 5', 0.75, 0.1);
  s.addText('Senibina Teknikal', { x:0.75,y:0.28,w:8,h:0.55, fontSize:28, bold:true, color:C.white, fontFace:FONT_HEAD });
  s.addText('Stack Teknologi & Pangkalan Data', { x:0.75,y:0.82,w:8,h:0.35, fontSize:12, color:'BBAADD', fontFace:FONT_BODY });

  // col 1: tech stack
  s.addText('STACK TEKNOLOGI', {
    x:0.75,y:1.5,w:4,h:0.28, fontSize:8, bold:true, color:C.gold, fontFace:FONT_BODY, charSpacing:3,
  });
  const techItems = [
    { icon:'⚡', t:'Frontend', d:'HTML / CSS / JavaScript — fail tunggal, tiada build tool' },
    { icon:'🗄️', t:'Supabase', d:'PostgreSQL + RLS + Storage — hosting pangkalan data' },
    { icon:'✉️', t:'EmailJS', d:'Notifikasi e-mel — service_a3kt2zm / template_553fkme' },
    { icon:'📄', t:'jsPDF', d:'Jana PDF A4 landscape — eksport ahli & permohonan' },
    { icon:'🌐', t:'GitHub Pages', d:'Hosting percuma — github.io/DPMMJOHOR/SISTEM-AHLI-DPMM-JOHOR' },
    { icon:'🤖', t:'Groq AI', d:'Bantuan borang pintar — model llama via API' },
  ];
  techItems.forEach((ti, i) => {
    const ty = 1.88 + i * 0.72;
    s.addShape(SH.roundRect, {
      x:0.75,y:ty,w:4.15,h:0.62, rectRadius:0.08,
      fill:{color:'2A1048'}, line:{color:'4A2068', size:1},
    });
    s.addText(ti.icon, { x:0.85,y:ty+0.08,w:0.5,h:0.45, fontSize:16, align:'center',valign:'middle' });
    s.addText(ti.t, { x:1.42,y:ty+0.06,w:3.35,h:0.22, fontSize:9.5, bold:true, color:C.gold, fontFace:FONT_BODY });
    s.addText(ti.d, { x:1.42,y:ty+0.3,w:3.35,h:0.22, fontSize:7.8, color:'CCBBEE', fontFace:FONT_BODY });
  });

  // col 2: supabase tables + security
  s.addText('JADUAL SUPABASE', {
    x:5.2,y:1.5,w:4.4,h:0.28, fontSize:8, bold:true, color:C.gold, fontFace:FONT_BODY, charSpacing:3,
  });
  const tables = [
    ['AHLI DPMM JOHOR',     'Data rekod ahli utama'],
    ['PERMOHONAN_AHLI',      'Permohonan daripada borang.html'],
    ['DPMM_TEMPLATES',       'Templat mesej WhatsApp/Email'],
    ['DPMM_DOKUMEN',         'Dokumen organisasi (7 kategori)'],
    ['DPMM_MESYUARAT',       'Jadual & rekod mesyuarat'],
    ['DPMM_KEHADIRAN',       'Kehadiran mesyuarat ahli'],
  ];
  tables.forEach((tb, i) => {
    const ty = 1.88 + i * 0.62;
    s.addShape(SH.roundRect, {
      x:5.2,y:ty,w:4.35,h:0.52, rectRadius:0.08,
      fill:{color:'2A1048'}, line:{color:'4A2068', size:1},
    });
    s.addText('🗃️', { x:5.3,y:ty+0.08,w:0.4,h:0.35, fontSize:13, align:'center',valign:'middle' });
    s.addText(tb[0], { x:5.76,y:ty+0.06,w:3.65,h:0.2, fontSize:9, bold:true, color:C.gold, fontFace:FONT_BODY });
    s.addText(tb[1], { x:5.76,y:ty+0.26,w:3.65,h:0.2, fontSize:7.8, color:'CCBBEE', fontFace:FONT_BODY });
  });

  // bottom bar — security notes
  s.addShape(SH.rect, { x:0.55,y:6.5,w:9.45,h:1.0, fill:{color:C.purple}, line:{color:C.purple} });
  s.addText('🔐  Keselamatan: RLS diaktifkan · Kunci API disimpan dalam config-local.js (gitignored) · Login diperlukan untuk akses admin · PDPA compliant', {
    x:0.75,y:6.6,w:9,h:0.35, fontSize:8.5, color:C.white, fontFace:FONT_BODY, align:'left',
  });
  s.addText('Versi Sistem: Jun 2026  ·  Disiapkan oleh: Setiausaha Kehormat DPMM Negeri Johor', {
    x:0.75,y:6.92,w:9,h:0.28, fontSize:8, color:C.gold, fontFace:FONT_BODY, align:'left',
  });
}

// ── SAVE ──────────────────────────────────────────────────────────────────
prs.writeFile({ fileName: 'LAPORAN-SISTEM-DPMM-JOHOR.pptx' })
  .then(() => console.log('✅  LAPORAN-SISTEM-DPMM-JOHOR.pptx created successfully.'))
  .catch(e => { console.error('❌  Error:', e); process.exit(1); });
