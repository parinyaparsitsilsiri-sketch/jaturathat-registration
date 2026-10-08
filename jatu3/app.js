// app.js — ระบบลงทะเบียนจตุรธาตุ อาศรมศรีมงคล
const API = "https://pursue-uploaded-difficulty-quiz.trycloudflare.com";// relative — port 4575 // relative — เรียก server เดียวกัน

function toggleOccOther() {
  const val = document.getElementById("occupation").value;
  const box = document.getElementById("occOtherBox");
  box.style.display = val === "อื่นๆ" ? "block" : "none";
}

function toggleTitleOther() {
  const val = document.getElementById("title").value;
  const box = document.getElementById("titleOtherBox");
  box.style.display = val === "อื่นๆ" ? "block" : "none";
}

function showMsg(text, type) {
  const msg = document.getElementById("statusMsg");
  msg.textContent = text;
  msg.className = "status " + type;
}

// ===== PDPA Modal =====
let pdpaRead = false; // บันทึกว่าผู้ใช้เปิดอ่านคำยินยอมแล้วหรือยัง

function openPDPA() {
  pdpaRead = true; // เปิดอ่านแล้ว
  document.getElementById("pdpaModal").style.display = "flex";
}

function closePDPA() {
  document.getElementById("pdpaModal").style.display = "none";
}

function agreePDPA() {
  document.getElementById("padaConsent").checked = true;
  closePDPA();
  showMsg("✅ ท่านยินยอมให้ถ่ายภาพ/บันทึกวิดีโอแล้ว", "success");
}

// ===== ส่งฟอร์มลงทะเบียน =====
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const consent = document.getElementById("padaConsent");
  if (!consent.checked) {
    showMsg("⚠️ กรุณากดยอมรับการถ่ายภาพ/บันทึกวิดีโอ (PDPA) ก่อนส่งข้อมูล", "error");
    return;
  }

  if (!pdpaRead) {
    showMsg("⚠️ กรุณาคลิกอ่านคำยินยอม PDPA ฉบับเต็มก่อนส่งข้อมูล (คลิกปุ่ม \"📄 คลิกอ่านคำยินยอมฉบับเต็ม\")", "error");
    openPDPA(); // เปิด modal ให้อ่านทันที
    return;
  }

  const occ = document.getElementById("occupation").value;
  const occupation = occ === "อื่นๆ"
    ? "อื่นๆ: " + document.getElementById("occOther").value.trim()
    : occ;

  const ttl = document.getElementById("title").value;
  const title = ttl === "อื่นๆ"
    ? "อื่นๆ: " + document.getElementById("titleOther").value.trim()
    : ttl;

  const data = {
    title,
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    lineId: document.getElementById("lineId").value.trim(),
    gender: document.getElementById("gender").value,
    age: parseInt(document.getElementById("age").value, 10) || null,
    occupation,
    padaConsent: "ยินยอม" // ยอมรับถ่ายภาพ/วิดีโอ ตาม PDPA
  };

  const btn = document.querySelector(".submit-btn");
  btn.disabled = true;
  btn.textContent = "⏳ กำลังส่ง...";
  showMsg("", "");

  try {
    const res = await fetch(API + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.result === "success") {
      // ไปหน้าลงทะเบียนสำเร็จ
      window.location.href = "/success.html";
    } else if (result.result === "duplicate") {
      showMsg("⚠️ " + result.message, "error");
    } else {
      showMsg("❌ " + (result.message || "เกิดข้อผิดพลาด"), "error");
    }
  } catch (err) {
    showMsg("❌ ไม่สามารถเชื่อมต่อ server ได้ กรุณาลองใหม่", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "📤 ส่งข้อมูลลงทะเบียน";
  }
});

