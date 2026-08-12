/**
 * Code.gs — สคริปต์สำหรับ Google Sheets
 * รับข้อมูลจากแบบฟอร์มลงทะเบียน → เขียนลงชีตอัตโนมัติ
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

// ชื่อชีตที่ต้องการให้ข้อมูลเข้า (ตั้งชื่อชีตให้ตรง)
const SHEET_NAME = "ลงทะเบียน";

/**
 * doPost — รับข้อมูลจากฟอร์ม (JSON) แล้วบันทึกลง Google Sheets
 */
function doPost(e) {
  try {
    // 1. อ่านข้อมูล JSON ที่ส่งมาจากฟอร์ม
    const data = JSON.parse(e.postData.contents);

    // 2. หาชีตปลายทาง (สร้างให้ถ้ายังไม่มี)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // 3. ถ้าเป็นแถวแรก (เพิ่งสร้างชีต) ให้เขียนหัวตาราง
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "วันที่-เวลา", "หัวข้อที่สนใจ", "สถานะผู้สมัคร",
        "ชื่อ-นามสกุล", "เบอร์โทร", "อีเมล", "Facebook", "ข้อความ"
      ]);
      // ตกแต่งหัวตาราง
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold")
        .setBackground("#1b5e20").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    // 4. เขียนข้อมูลผู้ลงทะเบียน (เรียงตามหัวตาราง)
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("th-TH"),
      data.topic || "",
      data.status || "",
      data.fullname || "",
      data.phone || "",
      data.email || "",
      data.facebook || "",
      data.message || ""
    ]);

    // 5. กว้างคอลัมน์ให้พอดี (เพื่อความสวยงาม)
    sheet.autoResizeColumns(1, 8);

    // 6. ตอบกลับสำเร็จ (รูปแบบ JSON — โปรแกรมอ่านได้)
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // ตอบกลับเมื่อมีข้อผิดพลาด
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
  SpreadsheetApp.getActiveSheet().autoResizeColumns(1, 8);
  SpreadsheetApp.getUi().alert("✅ อัปเดตข้อมูลเรียบร้อย");
}