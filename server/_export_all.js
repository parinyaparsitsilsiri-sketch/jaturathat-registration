const D = require("better-sqlite3");
const ExcelJS = require("exceljs");

(async () => {
  const db = new D("/home/sirasit/jaturathat-registration/server/data/jatu-oct23.db");
  const rows = db.prepare("SELECT * FROM registrations ORDER BY id").all();
  const wb = new ExcelJS.Workbook();

  const COLS = [
    { header: "ลำดับ", key: "id", width: 8 },
    { header: "คำนำหน้า", key: "title", width: 12 },
    { header: "ชื่อ", key: "firstName", width: 20 },
    { header: "นามสกุล", key: "lastName", width: 22 },
    { header: "เพศ", key: "gender", width: 9 },
    { header: "อายุ", key: "age", width: 7 },
    { header: "อาชีพ", key: "occupation", width: 26 },
    { header: "อีเมล", key: "email", width: 30 },
    { header: "เบอร์โทรศัพท์", key: "phone", width: 15 },
    { header: "LINE ID", key: "lineId", width: 14 },
    { header: "PDPA", key: "pdpaConsent", width: 9 },
    { header: "วันเวลาลงทะเบียน", key: "createdAt", width: 20 }
  ];

  function buildSheet(name, data) {
    const ws = wb.addWorksheet(name);
    ws.columns = COLS;
    data.forEach(r => ws.addRow(r));
    const hdr = ws.getRow(1);
    hdr.height = 28;
    hdr.eachCell(c => {
      c.font = { bold: true, name: "TH Sarabun New", size: 15, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E7D32" } };
      c.alignment = { vertical: "middle", horizontal: "center" };
      c.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });
    ws.eachRow((row, i) => {
      if (i === 1) return;
      row.height = 22;
      row.eachCell(c => {
        c.font = { name: "TH Sarabun New", size: 14 };
        c.border = {
          top: { style: "thin", color: { argb: "FFDDE7DD" } },
          bottom: { style: "thin", color: { argb: "FFDDE7DD" } },
          left: { style: "thin", color: { argb: "FFDDE7DD" } },
          right: { style: "thin", color: { argb: "FFDDE7DD" } }
        };
      });
      if (i % 2 === 0) row.eachCell(c => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F9F3" } }; });
    });
    ws.autoFilter = { from: "A1", to: "L1" };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    return ws;
  }

  const yk = rows.filter(r => r.event === "yamkang-oct31");
  const jt = rows.filter(r => r.event === "jatu-oct23" || !r.event);

  buildSheet("ย่ำข่าง 31 ต.ค.-1 พ.ย.", yk);
  buildSheet("จตุรธาตุ 23-24 ต.ค.", jt);

  // ชีตสรุป
  const s = wb.addWorksheet("สรุป");
  s.columns = [{ header: "รายการ", key: "k", width: 32 }, { header: "จำนวน (คน)", key: "v", width: 14 }];
  s.addRow({ k: "ย่ำข่าง ๓๑ ต.ค. – ๑ พ.ย. ๒๕๖๙", v: yk.length });
  s.addRow({ k: "จตุรธาตุ ๒๓–๒๔ ต.ค. ๒๕๖๙", v: jt.length });
  s.addRow({ k: "รวมทั้งหมด", v: rows.length });
  const h = s.getRow(1);
  h.eachCell(c => {
    c.font = { bold: true, name: "TH Sarabun New", size: 15, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E7D32" } };
  });
  s.eachRow((r, i) => { if (i > 1) r.font = { name: "TH Sarabun New", size: 14 }; });

  const out = "/home/sirasit/shots/ทะเบียนผู้เข้าอบรม-ทั้งหมด.xlsx";
  await wb.xlsx.writeFile(out);
  console.log("OK " + out);
  console.log("ย่ำข่าง " + yk.length + " คน · จตุรธาตุ " + jt.length + " คน · รวม " + rows.length);
})();
