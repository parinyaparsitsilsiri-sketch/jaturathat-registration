/**
 * Code-survey.gs — แบบสอบถามความพึงพอใจ (โมดูลแยกจากลงทะเบียน)
 * รับข้อมูลจากแบบสอบถาม → เขียนลงแท็บ "ความพึงพอใจ" ใน Google Sheets
 *
 * สำคัญ: ใช้ SpreadsheetApp.openById() — ใช้ได้กับทั้ง standalone script
 * และ container-bound script (ไม่ต้องเปิดจากชีต)
 *
 * วิธีติดตั้ง (สร้าง PROJECT ใหม่ แยกจาก project ลงทะเบียน):
 * 1. ไปที่ https://script.google.com → + โปรเจกต์ใหม่ (New project)
 * 2. ตั้งชื่อโปรเจกต์: "แบบสอบถามความพึงพอใจ"
 * 3. ลบโค้ดใน Code.gs แล้ววางโค้ดนี้ทั้งหมด
 * 4. แก้ SPREADSHEET_ID ด้านล่างเป็น ID ของชีตพี่:
 *    (ใน URL ชีต: docs.google.com/spreadsheets/d/<ตรงนี้คือ ID>/edit)
 * 5. บันทึก → ปรับใช้ > นวัตกรรมการปรับใช้แบบใหม่
 *    - ประเภท: เว็บแอป (Web app) / ดำเนินการเป็น: ฉัน / เข้าถึงได้: ทุกคน (Anyone)
 * 6. กด ปรับใช้ → อนุญาตสิทธิ์ → คัดลอก URL /exec → ไปใส่ใน
 *    satisfaction-survey/script.js (ตัวแปร WEB_APP_URL)
 */

// ===== แก้ตรงนี้: ID ของ Google Sheets (ดูจาก URL ชีต) =====
const SPREADSHEET_ID = "1WCFIQ3L1wpmBmYFE8eUEf2TkJl_ye4ZRV5Wfxd42M_M";

const SHEET_NAME = "ความพึงพอใจ";

// แปลงเวลาเป็น พ.ศ. ไทย (เช่น 12 สิงหาคม 2569 11:25 น.)
function formatThaiDate(d) {
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const thaiYear = d.getFullYear() + 543;
  return `${d.getDate()} ${months[d.getMonth()]} ${thaiYear} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")} น.`;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "วันที่-เวลา", "คำนำหน้า/ยศ", "ชื่อ", "สกุล", "อีเมล",
        "Q1 เนื้อหา", "Q2 วิทยากร", "Q3 เอกสาร/สื่อ", "Q4 สถานที่",
        "Q5 ระยะเวลา/การจัดการ", "Q6 อาหาร/เครื่องดื่ม", "Q7 ผู้ช่วยวิทยากร/ทีมงาน",
        "Q8 การนำไปใช้", "Q9 โดยรวม", "ข้อเสนอแนะ"
      ]);
      sheet.getRange(1, 1, 1, 15).setFontWeight("bold")
        .setBackground("#1b5e20").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      formatThaiDate(new Date()),
      data.title || "",
      data.firstname || "",
      data.lastname || "",
      data.email || "",
      data.q1 || "",
      data.q2 || "",
      data.q3 || "",
      data.q4 || "",
      data.q5 || "",
      data.q6 || "",
      data.q7 || "",
      data.q8 || "",
      data.q9 || "",
      data.suggestions || ""
    ]);
    sheet.autoResizeColumns(1, 15);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    "✅ แบบสอบถามความพึงพอใจอาศรมศรีมงคลทำงานปกติ"
  );
}