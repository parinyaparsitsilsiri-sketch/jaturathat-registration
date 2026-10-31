/**
 * server.js — ลงทะเบียนจตุรธาตุ ๒๓–๒๔ ตุลาคม ๒๕๖๙ · อาศรมศรีมงคล
 * Node + Express + SQLite + ExcelJS · CORS เปิด · เสิร์ฟ front-end ด้วย (same-origin)
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 10000;
const DB_PATH = path.join(__dirname, 'data', 'jatu-oct23.db');
const EXCEL_DIR = path.join(__dirname, 'data', 'excel');
const FRONT_DIR = '/home/sirasit/jaturathat-registration/jatu-oct23';

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(EXCEL_DIR, { recursive: true });

// ══════ CORS ══════
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.static(FRONT_DIR));

// ══════ SQLite ══════
const db = new Database(DB_PATH);
db.exec(`
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT, title TEXT, firstName TEXT, lastName TEXT,
  gender TEXT, age INTEGER, email TEXT, phone TEXT, lineId TEXT,
  occupation TEXT, address TEXT, pdpaConsent TEXT,
  createdAt TEXT DEFAULT (datetime('now','+7 hours'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_email_event ON registrations(email, event);
`);

// ══════ One-time migration: แก้เวลา UTC → ไทย (+7) ══════
db.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT)");
(function () {
  const done = db.prepare("SELECT v FROM meta WHERE k = 'tz_fix_1031'").get();
  if (done) return;
  const r = db.prepare(
    "UPDATE registrations SET createdAt = datetime(createdAt, '+7 hours') " +
    "WHERE event = 'yamkang-oct31' AND createdAt < '2026-10-31 07:00'"
  ).run();
  db.prepare("INSERT OR REPLACE INTO meta (k, v) VALUES ('tz_fix_1031', ?)").run(String(r.changes));
  console.log('[migrate] tz_fix_1031: แก้เวลา ' + r.changes + ' แถว');
})();


// ══════ ตารางแบบสอบถาม ══════
db.exec(`
CREATE TABLE IF NOT EXISTS surveys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT, title TEXT, fullname TEXT, occupation TEXT,
  content INTEGER, speaker INTEGER, material INTEGER, venue INTEGER,
  duration INTEGER, benefit INTEGER, organize INTEGER, overall INTEGER,
  comment TEXT, nextCourse TEXT,
  createdAt TEXT DEFAULT (datetime('now','+7 hours'))
);
`);

// ══════ POST /api/register ══════
app.post('/api/register', (req, res) => {
  try {
    const b = req.body || {};
    const first = String(b.firstName || '').trim();
    const last = String(b.lastName || '').trim();
    if (!first || !last) return res.json({ result: 'error', message: 'กรุณากรอกชื่อ-นามสกุลให้ครบ' });
    const email = String(b.email || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.json({ result: 'error', message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    if (String(b.pdpaConsent || '') !== 'ยินยอม')
      return res.json({ result: 'error', message: 'กรุณายอมรับคำยินยอม PDPA' });

    const event = String(b.event || 'jatu-oct23');
    const dup = db.prepare('SELECT id FROM registrations WHERE email = ? AND event = ?').get(email, event);
    if (dup) return res.json({ result: 'error', message: 'อีเมลนี้ลงทะเบียนแล้ว (รหัส ' + dup.id + ')', duplicate: true, id: dup.id });

    const info = db.prepare(`INSERT INTO registrations
      (event,title,firstName,lastName,gender,age,email,phone,lineId,occupation,address,pdpaConsent,createdAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now','+7 hours'))`).run(
      event, String(b.title || ''), first, last, String(b.gender || ''),
      parseInt(b.age, 10) || null, email, String(b.phone || ''), String(b.lineId || ''),
      String(b.occupation || ''), String(b.address || ''), 'ยินยอม'
    );
    console.log('[register] id=' + info.lastInsertRowid + ' ' + first + ' ' + last);
    res.json({ result: 'success', id: info.lastInsertRowid, message: 'ลงทะเบียนสำเร็จ' });
  } catch (err) {
    console.error('[register] error:', err.message);
    res.json({ result: 'error', message: 'เกิดข้อผิดพลาด: ' + err.message });
  }
});

// ══════ GET /api/list ══════
app.get('/api/list', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM registrations ORDER BY id DESC').all();
    res.json({ result: 'success', count: rows.length, rows });
  } catch (e) { res.json({ result: 'error', message: e.message }); }
});

// ══════ GET /api/export ══════
app.get('/api/export', async (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM registrations ORDER BY id ASC').all();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('ลงทะเบียน');
    ws.columns = [
      { header: 'ลำดับ', key: 'id', width: 8 },
      { header: 'คำนำหน้า', key: 'title', width: 12 },
      { header: 'ชื่อ', key: 'firstName', width: 18 },
      { header: 'นามสกุล', key: 'lastName', width: 18 },
      { header: 'เพศ', key: 'gender', width: 10 },
      { header: 'อายุ', key: 'age', width: 8 },
      { header: 'อีเมล', key: 'email', width: 28 },
      { header: 'เบอร์โทรศัพท์', key: 'phone', width: 16 },
      { header: 'LINE ID', key: 'lineId', width: 16 },
      { header: 'อาชีพ', key: 'occupation', width: 26 },
      { header: 'ที่อยู่/จังหวัด', key: 'address', width: 26 },
      { header: 'PDPA', key: 'pdpaConsent', width: 10 },
      { header: 'วันเวลาลงทะเบียน', key: 'createdAt', width: 20 }
    ];
    ws.getRow(1).font = { bold: true, name: 'TH Sarabun New', size: 16 };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
    rows.forEach(r => ws.addRow(r));
    ws.eachRow(row => { row.font = row.font || {}; row.font = { name: 'TH Sarabun New', size: 16 }; });
    const file = path.join(EXCEL_DIR, 'jatu-oct23-' + Date.now() + '.xlsx');
    await wb.xlsx.writeFile(file);
    res.download(file, 'ลงทะเบียน-จตุรธาตุ-๒๓-๒๔-ตุลาคม-๒๕๖๙.xlsx');
  } catch (e) { res.status(500).json({ result: 'error', message: e.message }); }
});

// ══════ POST /api/survey ══════
app.post('/api/survey', (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.fullname || '').trim();   // ไม่บังคับ — แบบสอบถามไม่ระบุตัวตน
    const keys = ['content','speaker','material','venue','duration','benefit','organize','overall'];
    for (const k of keys) {
      const v = parseInt(b[k], 10);
      if (!(v >= 1 && v <= 5)) return res.json({ result: 'error', message: 'กรุณาตอบแบบประเมินให้ครบทุกข้อ' });
    }
    const info = db.prepare(`INSERT INTO surveys
      (event,title,fullname,occupation,content,speaker,material,venue,duration,benefit,organize,overall,comment,nextCourse,createdAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now','+7 hours'))`).run(
      String(b.event || 'jatu-oct23'), String(b.title || ''), name, String(b.occupation || ''),
      parseInt(b.content,10), parseInt(b.speaker,10), parseInt(b.material,10), parseInt(b.venue,10),
      parseInt(b.duration,10), parseInt(b.benefit,10), parseInt(b.organize,10), parseInt(b.overall,10),
      String(b.comment || ''), String(b.nextCourse || '')
    );
    console.log('[survey] id=' + info.lastInsertRowid + ' ' + name);
    res.json({ result: 'success', id: info.lastInsertRowid, message: 'ส่งแบบสอบถามสำเร็จ' });
  } catch (e) { res.json({ result: 'error', message: e.message }); }
});

// ══════ GET /api/survey-stats — สรุปผลแบบสอบถาม ══════
app.get('/api/survey-stats', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM surveys WHERE event = ? ORDER BY id").all('jatu-oct23');
    const Q = [
      ['content', 'เนื้อหาหลักสูตร'],
      ['speaker', 'วิทยากร'],
      ['material', 'เอกสาร/สื่อ'],
      ['venue', 'สถานที่'],
      ['duration', 'ระยะเวลา'],
      ['benefit', 'นำไปใช้ประโยชน์'],
      ['organize', 'ประชาสัมพันธ์'],
      ['overall', 'ความพึงพอใจรวม']
    ];
    const items = Q.map(([k, label]) => {
      const vals = rows.map(r => r[k]).filter(v => v >= 1 && v <= 5);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { key: k, label, avg: +avg.toFixed(2), pct: +((avg / 5) * 100).toFixed(1), n: vals.length };
    });
    const all = [];
    rows.forEach(r => Q.forEach(([k]) => { if (r[k] >= 1 && r[k] <= 5) all.push(r[k]); }));
    const gAvg = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;
    const dist = [5, 4, 3, 2, 1].map(n => ({ star: n, count: rows.filter(r => r.overall === n).length }));
    const total = db.prepare("SELECT COUNT(*) c FROM registrations WHERE event = ?").get('jatu-oct23').c;
    res.json({
      result: 'success',
      responses: rows.length,
      registrants: total,
      responseRate: total ? +((rows.length / total) * 100).toFixed(1) : 0,
      avg: +gAvg.toFixed(2),
      pct: +((gAvg / 5) * 100).toFixed(1),
      items,
      distribution: dist,
      comments: rows.filter(r => (r.comment || '').trim()).map(r => r.comment.trim()),
      nextCourses: rows.filter(r => (r.nextCourse || '').trim()).map(r => r.nextCourse.trim()),
      updatedAt: new Date().toISOString()
    });
  } catch (e) { res.json({ result: 'error', message: e.message }); }
});

// ══════ GET /api/cert?no=69090080 — ตรวจใบประกาศ ══════
app.get('/api/cert', (req, res) => {
  try {
    const no = String(req.query.no || '').trim();
    if (!no) return res.json({ result: 'notfound', message: 'ไม่ระบุหมายเลข' });
    const r = db.prepare('SELECT cert_no,title,firstName,lastName,occupation FROM registrations WHERE cert_no = ?').get(no);
    if (!r) return res.json({ result: 'notfound', message: 'ไม่พบหมายเลขนี้ในระบบ' });
    res.json({
      result: 'found',
      no: r.cert_no,
      title: r.title || '',
      fullname: ((r.firstName || '') + ' ' + (r.lastName || '')).trim(),
      course: 'จตุรธาตุ',
      date: '๒๓-๒๔ ตุลาคม ๒๕๖๙',
      place: 'ศูนย์การเรียนรู้อาศรมศรีมงคล สาขาลาดบัวหลวง จังหวัดพระนครศรีอยุธยา'
    });
  } catch (e) { res.json({ result: 'error', message: e.message }); }
});

app.get('/api/health', (req, res) => {
  const c = db.prepare('SELECT COUNT(*) n FROM registrations').get().n;
  res.json({ result: 'ok', service: 'jatu-oct23', count: c, time: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ jatu-oct23 register on http://0.0.0.0:' + PORT);
  console.log('   front-end: ' + FRONT_DIR);
  console.log('   DB: ' + DB_PATH);
});
