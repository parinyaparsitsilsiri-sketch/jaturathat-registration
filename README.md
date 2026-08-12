# 🌿 ระบบฟอร์มออนไลน์ อาศรมศรีมงคล — แยกโมดูล 2 ตัว

เว็บฟอร์ม 2 ตัว แยก URL + แยก Apps Script project อย่างชัดเจน

## 📝 โมดูล 1: ฟอร์มลงทะเบียน (จตุรธาตุ/ย่ำข่าง)

| รายการ | ค่า |
|--------|-----|
| เว็บฟอร์ม | [`/`](https://parinyaparsitsilsiri-sketch.github.io/jaturathat-registration/) |
| สคริปต์เว็บ | `script.js` |
| โค้ด Apps Script | **`Code-register.gs`** |
| ข้อมูล | แท็บ "ลงทะเบียน" ใน Sheets |

## 📋 โมดูล 2: แบบสอบถามความพึงพอใจ (25-26 ก.ค. 2569)

| รายการ | ค่า |
|--------|-----|
| เว็บฟอร์ม | [`/satisfaction-survey/`](https://parinyaparsitsilsiri-sketch.github.io/jaturathat-registration/satisfaction-survey/) |
| สคริปต์เว็บ | `satisfaction-survey/script.js` |
| โค้ด Apps Script | **`Code-survey.gs`** (ใช้ `openById` — project ใหม่แยกได้) |
| ข้อมูล | แท็บ "ความพึงพอใจ" ใน Sheets เดียวกัน |

## 🚀 วิธีติดตั้ง — โมดูล 1 (ลงทะเบียน, project เดิมที่ใช้อยู่)

1. เปิดชีต → **ส่วนขยาย (Extensions)** → **Apps Script**
2. ลบโค้ดเดิม → วาง **`Code-register.gs`** ทั้งไฟล์
3. บันทึก → **ปรับใช้** → **จัดการการปรับใช้** → **✏️ แก้ไข** → **เวอร์ชัน: ใหม่** → **บันทึก**
4. URL `/exec` เดิมใช้ได้ (หรือคัดลอกใหม่ถ้าต้องการ)

## 🚀 วิธีติดตั้ง — โมดูล 2 (แบบสอบถาม, สร้าง project ใหม่)

1. ไปที่ **https://script.google.com** → กด **+ โปรเจกต์ใหม่ (New project)**
2. ตั้งชื่อโปรเจกต์ เช่น "แบบสอบถามความพึงพอใจ"
3. ลบโค้ดใน `Code.gs` → วาง **`Code-survey.gs`** ทั้งไฟล์
   (ตรวจ `SPREADSHEET_ID` ตรงกับชีตพี่แล้ว: `1WCFIQ3L1wpmBmYFE8eUEf2TkJl_ye4ZRV5Wfxd42M_M`)
4. บันทึก → **ปรับใช้** → **นวัตกรรมการปรับใช้แบบใหม่ (New deployment)**
   - ประเภท: **Web app** / ดำเนินการเป็น: **ฉัน** / เข้าถึงได้: **ทุกคน (Anyone)**
5. กด **ปรับใช้** → **อนุญาตสิทธิ์** → อนุญาต → คัดลอก URL `/exec`
6. นำ URL นั้นไปใส่ใน `satisfaction-survey/script.js` (ตัวแปร `WEB_APP_URL`)

## 📁 ไฟล์ในโปรเจกต์

| ไฟล์ | หน้าที่ |
|------|--------|
| `index.html` | ฟอร์มลงทะเบียน (หน้าแรก) |
| `style.css` | การออกแบบฟอร์มลงทะเบียน |
| `script.js` | ส่งข้อมูลลงทะเบียน (ใช้ URL ของโมดูล 1) |
| `Code-register.gs` | Apps Script โมดูลลงทะเบียน |
| `Code-survey.gs` | Apps Script โมดูลแบบสอบถาม (project แยก) |
| `satisfaction-survey/` | ฟอร์มแบบสอบถามทั้งชุด (index/style/script) |
| `assets/` | โลโก้ + QR code |

## 📍 สถานที่อบรม

- **ศูนย์การเรียนรู้อาศรมศรีมงคล สาขาลาดบัวหลวง**
- ต.คลองพระยาบันลือ อ.ลาดบัวหลวง จ.พระนครศรีอยุธยา 13230
- [เปิดแผนที่ Google Maps](https://maps.app.goo.gl/zPrbzCbEiQ8i5KKB6)

---

*สร้างโดยโทรุ (Hermes Agent) — DeepSeek V4 Flash (free)*
*© อ.พท.ศิริมงคล — อาศรมศรีมงคล*
