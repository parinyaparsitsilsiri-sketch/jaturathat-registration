/* ============================================
   script.js — ส่งข้อมูลฟอร์มไป Google Sheets
   ผ่าน Google Apps Script Web App (doPost)
   ============================================ */

// ⚠️ สำคัญ: เปลี่ยน URL นี้เป็น Web App URL ของพี่
// หลัง Deploy ใน Apps Script (ดูคู่มือ README.md)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw4rAr_V4t3sOAJ5b9aLa5pgWqqDLhrxBX_HrCvYppVKV4LGzxAiDXg6IsYmqxq8dNyaw/exec";

const form = document.getElementById("registrationForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.querySelector(".btn-text");
const btnSpinner = document.querySelector(".btn-spinner");
const formMessage = document.getElementById("formMessage");

// แสดง/ซ่อนข้อความสถานะ
function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = "form-message " + type;
}

function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.classList.toggle("hidden", loading);
    btnSpinner.classList.toggle("hidden", !loading);
}

// เมื่อกดส่งฟอร์ม
form.addEventListener("submit", async function (e) {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า

    // ตรวจสอบความถูกต้องของฟอร์ม (HTML5 validation)
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    setLoading(true);
    showMessage("", "");

    // เก็บข้อมูลเป็น object
    const data = {
        topic: form.querySelector('input[name="topic"]:checked').value,
        status: document.getElementById("status").value,
        fullname: document.getElementById("fullname").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        facebook: document.getElementById("facebook").value.trim(),
        message: document.getElementById("message").value.trim(),
        timestamp: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors", // จำเป็นสำหรับ Apps Script Web App
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(data)
        });

        // ด้วย mode no-cors เราไม่อ่าน response ได้โดยตรง
        // จึงถือว่าสำเร็จเมื่อส่งไปถึง (ไม่มี exception)
        showMessage(
            "✅ ลงทะเบียนสำเร็จ! ข้อมูลของท่านถูกบันทึกแล้ว\nเจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด 🙏",
            "success"
        );
        form.reset();
    } catch (err) {
        console.error("ส่งข้อมูลไม่สำเร็จ:", err);
        showMessage(
            "❌ เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง หรือติดต่อผ่าน Facebook",
            "error"
        );
    } finally {
        setLoading(false);
    }
});