// app.js — ระบบลงทะเบียนจตุรธาตุ อาศรมศรีมงคล
const API = "https://welcome-domain-char-kingston.trycloudflare.com";// relative — port 4575 // relative — เรียก server เดียวกัน

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

  // ── ตรวจฟิลด์จำเป็น (แทน HTML5 validation ที่บล็อกเงียบ) ──
  const need = [
    ['title','คำนำหน้า'], ['firstName','ชื่อ'], ['lastName','นามสกุล'],
    ['email','อีเมล'], ['gender','เพศ'], ['age','อายุ'], ['occupation','อาชีพ'],
  ];
  for (const [id, label] of need) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (!String(el.value || '').trim()) {
      showMsg('⚠️ กรุณากรอก "' + label + '"', 'error');
      el.focus();
      if (el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }
  const _em = document.getElementById('email');
  if (_em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_em.value.trim())) {
    showMsg('⚠️ รูปแบบอีเมลไม่ถูกต้อง', 'error'); _em.focus(); return;
  }
  const consent = document.getElementById("padaConsent");
  if (!consent.checked) {
    showMsg("⚠️ กรุณากดยอมรับการถ่ายภาพ/บันทึกวิดีโอ (PDPA) ก่อนส่งข้อมูล", "error");
    return;
  }

  // ผู้ใช้สั่ง: ติ๊กยอมรับแล้วส่งได้เลย — ไม่บังคับเปิดอ่าน modal ก่อน
  // (ปุ่มอ่านฉบับเต็มยังอยู่ ถ้าต้องการอ่าน)
  if (!pdpaRead) pdpaRead = true;   // ถือว่ายอมรับเมื่อติ๊กถูก

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
      window.location.href = "success.html";
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

