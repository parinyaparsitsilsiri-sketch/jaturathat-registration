// admin.js — หลังบ้าน: Dashboard + รายชื่อ + Export Excel
const API = "";

function showMsg(text, type) {
  const msg = document.getElementById("listMsg");
  msg.textContent = text;
  msg.className = "status " + type;
}

// ===== สร้างกราฟแท่งแนวนอน =====
function renderBarChart(elId, data, labelKey, valueKey) {
  const el = document.getElementById(elId);
  if (!data || data.length === 0) {
    el.innerHTML = '<p style="color:#999;font-size:13px;">ยังไม่มีข้อมูล</p>';
    return;
  }
  const max = Math.max(...data.map(d => d[valueKey]));
  el.innerHTML = data.map(d => `
    <div class="bar-row">
      <span class="bar-label" title="${d[labelKey]}">${d[labelKey]}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.max((d[valueKey] / max) * 100, 4)}%"></div>
      </div>
      <span class="bar-val">${d[valueKey]}</span>
    </div>
  `).join("");
}

// ===== โหลด Dashboard =====
async function loadDashboard() {
  try {
    const res = await fetch(API + "/api/stats");
    const s = await res.json();
    if (s.result !== "ok") return;

    // การ์ดสรุป
    document.getElementById("statsBar").innerHTML = `
      <div class="stat-card"><div class="num">${s.total}</div><div class="lbl">ผู้ลงทะเบียนทั้งหมด</div></div>
      <div class="stat-card"><div class="num">${s.today}</div><div class="lbl">ลงทะเบียนวันนี้</div></div>
      <div class="stat-card"><div class="num">${s.consent}</div><div class="lbl">ยินยอม PDPA</div></div>
      <div class="stat-card"><div class="num">${s.noConsent}</div><div class="lbl">ไม่ยินยอม PDPA</div></div>
    `;

    // กราฟ
    renderBarChart("occChart", s.occupations, "occupation", "c");
    renderBarChart("genderChart", s.genders, "gender", "c");
    renderBarChart("ageChart", s.ageGroups, "grp", "c");
    renderBarChart("titleChart", s.titles, "title", "c");
    renderBarChart("dailyChart", s.daily, "d", "c");
  } catch (e) {
    console.error("Dashboard error:", e);
  }
}

// ===== โหลดรายชื่อ =====
async function loadList() {
  showMsg("⏳ กำลังโหลด...", "info");
  try {
    const res = await fetch(API + "/api/registrants");
    const result = await res.json();
    const tbody = document.querySelector("#regTable tbody");
    tbody.innerHTML = "";

    if (result.count === 0) {
      showMsg("ยังไม่มีผู้ลงทะเบียน", "info");
      return;
    }

    result.data.forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${r.title || "-"}</td>
        <td>${r.first_name} ${r.last_name}</td>
        <td>${r.gender || "-"}</td>
        <td>${r.age || "-"}</td>
        <td>${r.email || "-"}</td>
        <td>${r.line_id || "-"}</td>
        <td>${r.occupation || "-"}</td>
        <td>${r.pada_consent === "ยินยอม" ? "✅" : "❌"}</td>
        <td>${r.registered_at}</td>
      `;
      tbody.appendChild(tr);
    });

    showMsg(`✅ พบทั้งหมด ${result.count} คน`, "success");
  } catch (err) {
    showMsg("❌ โหลดรายชื่อไม่สำเร็จ", "error");
  }
}

// ===== Export Excel =====
async function exportExcel() {
  showMsg("⏳ กำลังสร้างไฟล์ Excel...", "info");
  try {
    const res = await fetch(API + "/api/export");
    const result = await res.json();

    if (result.result === "success") {
      showMsg(`✅ สร้างไฟล์ ${result.filename} (${result.count} คน) — กำลังดาวน์โหลด...`, "success");
      window.open(result.downloadUrl, "_blank");
    } else {
      showMsg("❌ " + result.message, "error");
    }
  } catch (err) {
    showMsg("❌ สร้างไฟล์ไม่สำเร็จ", "error");
  }
}

// โหลดอัตโนมัติเมื่อเปิดหน้า
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadList();
});
