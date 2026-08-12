/**
 * Code.gs — สคริปต์สำหรับ Google Sheets
 * รับข้อมูลจากฟอร์มลงทะเบียน + แบบสอบถามความพึงพอใจ → เขียนลงชีตอัตโนมัติ
 *
 * วิธีติดตั้ง:
 * 1. เปิด Google Sheets ใหม่ → ส่วนขยาย (Extensions) > Apps Script
 * 2. ลบโค้ดเดิม แล้ววางโค้ดนี้ทั้งหมด
 * 3. กด บันทึก (Save) → กด ปรับใช้ (Deploy) > นวัตกรรมการปรับใช้แบบใหม่
 *    - ประเภท: เว็บแอป (Web app)
 *    - ดำเนินการเป็น: ฉัน
 *    - ผู้ที่เข้าถึงได้: ทุกคน (Anyone)
 *    - กด ปรับใช้ → อนุญาตสิทธิ์ → ได้ URL /exec
 * 4. เอา URL นั้นไปใส่ใน script.js (ตัวแปร WEB_APP_URL)
 */

// ชื่อชีตปลายทาง (สร้างให้อัตโนมัติถ้ายังไม่มี)
const SHEET_REGISTER = "ลงทะเบียน";
const SHEET_SURVEY = "ความพึงพอใจ";

/**
 * แปลงเวลาเป็น พ.ศ. ไทย (เช่น 12 สิงหาคม 2569 11:25 น.)
 */
function formatThaiDate(d) {
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const thaiYear = d.getFullYear() + 543; // ค.ศ. → พ.ศ.
  return `${d.getDate()} ${months[d.getMonth()]} ${thaiYear} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")} น.`;
}

/**
 * หาชีตปลายทาง + เขียนหัวตารางถ้ายังไม่มี
 */
function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#1b5e20")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * doPost — รับข้อมูลจากฟอร์ม (JSON) แล้วบันทึกลง Google Sheets
 * รองรับ 2 ฟอร์ม: formType = "register" (ลงทะเบียน) / "survey" (ความพึงพอใจ)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.formType === "survey") {
      // ===== แบบสอบถามความพึงพอใจ =====
      const sheet = getSheet(SHEET_SURVEY, [
        "วันที่-เวลา", "คำนำหน้า/ยศ", "ชื่อ", "สกุล", "อีเมล",
        "Q1 เนื้อหา", "Q2 วิทยากร", "Q3 เอกสาร/สื่อ", "Q4 สถานที่",
        "Q5 ระยะเวลา/การจัดการ", "Q6 การนำไปใช้", "Q7 โดยรวม",
        "ข้อเสนอแนะ"
      ]);
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
        data.suggestions || ""
      ]);
      sheet.autoResizeColumns(1, 13);
    } else {
      // ===== ฟอร์มลงทะเบียน (ค่าเริ่มต้น) =====
      const sheet = getSheet(SHEET_REGISTER, [
        "วันที่-เวลา", "หัวข้อที่สนใจ", "สถานะผู้สมัคร",
        "ชื่อ-นามสกุล", "เบอร์โทร", "อีเมล", "LINE ID", "Facebook", "ข้อความ"
      ]);
      sheet.appendRow([
        formatThaiDate(new Date()),
        data.topic || "",
        data.status || "",
        data.fullname || "",
        data.phone || "",
        data.email || "",
        data.line || "",
        data.facebook || "",
        data.message || ""
      ]);
      sheet.autoResizeColumns(1, 9);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * doGet — ไว้ทดสอบว่า Web App ทำงาน (เปิด URL ในเบราว์เซอร์)
 */
function doGet() {
  return ContentService.createTextOutput(
    "✅ Web App ของอาศรมศรีมงคลทำงานปกติ — รอรับข้อมูลจากฟอร์ม"
  );
}

/**
 * เมนูใน Google Sheets — กดเพื่อดูข้อมูลล่าสุด
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📋 ระบบลงทะเบียน")
    .addItem("รีเฟรชข้อมูล", "refreshData")
    .addToUi();
}

function refreshData() {
  SpreadsheetApp.getActiveSheet().autoResizeColumns(1, 10);
  SpreadsheetApp.getUi().alert("✅ อัปเดตข้อมูลเรียบร้อย");
}
