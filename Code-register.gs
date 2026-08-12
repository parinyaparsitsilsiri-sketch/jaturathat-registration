/**
 * Code.gs — ฟอร์มลงทะเบียน (โมดูลแยกจากแบบสอบถาม)
 * รับข้อมูลจากฟอร์มลงทะเบียนจตุรธาตุ/ย่ำข่าง → เขียนลงแท็บ "ลงทะเบียน"
 *
 * วิธีติดตั้ง (project ที่ใช้อยู่เดิม):
 * 1. เปิด Google Sheets → ส่วนขยาย (Extensions) > Apps Script
 * 2. ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดนี้
 * 3. บันทึก → ปรับใช้ > จัดการการปรับใช้ > ✏️ แก้ไข > เวอร์ชัน: ใหม่ > บันทึก
 */

const SHEET_NAME = "ลงทะเบียน";

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
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "วันที่-เวลา", "หัวข้อที่สนใจ", "สถานะผู้สมัคร",
        "ชื่อ-นามสกุล", "เบอร์โทร", "อีเมล", "LINE ID", "Facebook", "ข้อความ"
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight("bold")
        .setBackground("#1b5e20").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
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
    "✅ ระบบลงทะเบียนอาศรมศรีมงคลทำงานปกติ"
  );
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📋 ระบบลงทะเบียน")
    .addItem("รีเฟรชข้อมูล", "refreshData")
    .addToUi();
}

function refreshData() {
  SpreadsheetApp.getActiveSheet().autoResizeColumns(1, 9);
  SpreadsheetApp.getUi().alert("✅ อัปเดตข้อมูลเรียบร้อย");
}