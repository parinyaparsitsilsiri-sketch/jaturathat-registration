// ===== แบบสอบถามความพึงพอใจ — อาศรมศรีมงคล =====

// ⚠️ สำคัญ: ใส่ URL Web App ของพี่ (ตัวเดียวกับฟอร์มลงทะเบียน) ตรงนี้
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw8zKWzS8QbafSZLJvpR65zbuczENhmBxk7V1iyhGeCFdaiErwnsuDyEor7rUwdQUPv/exec";

// คำถามความพึงพอใจ (ระดับ 1-5)
const QUESTIONS = [
    "ความพึงพอใจด้านเนื้อหาการเรียนย่ำข่าง",
    "ความพึงพอใจด้านวิทยากร / ผู้ถ่ายทอดความรู้",
    "ความพึงพอใจด้านเอกสารและสื่อประกอบการเรียน",
    "ความพึงพอใจด้านสถานที่และสิ่งอำนวยความสะดวก",
    "ความพึงพอใจด้านระยะเวลาและการจัดการอบรม",
    "ความพึงพอใจด้านอาหารและเครื่องดื่ม",
    "ความพึงพอใจด้านผู้ช่วยวิทยากร / ทีมงาน",
    "ความพึงพอใจด้านการนำความรู้ไปใช้ประโยชน์",
    "ความพึงพอใจโดยรวมต่อการอบรมครั้งนี้"
];

const SCALE_LABELS = ["น้อยที่สุด", "น้อย", "ปานกลาง", "มาก", "มากที่สุด"];

// สร้างคำถามลงในฟอร์ม
function buildQuestions() {
    const container = document.getElementById("surveyQuestions");
    QUESTIONS.forEach((q, i) => {
        const div = document.createElement("div");
        div.className = "survey-question";

        const qText = document.createElement("div");
        qText.className = "q-text";
        qText.textContent = `${i + 1}. ${q}`;
        div.appendChild(qText);

        const row = document.createElement("div");
        row.className = "rating-row";

        const options = document.createElement("div");
        options.className = "rating-options";

        SCALE_LABELS.forEach((label, score) => {
            const lbl = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `q${i + 1}`;
            input.value = score + 1;
            input.required = true;

            const num = document.createElement("span");
            num.className = "rating-num";
            num.textContent = score + 1;

            const caption = document.createElement("span");
            caption.className = "rating-label";
            caption.textContent = label;

            lbl.appendChild(input);
            lbl.appendChild(num);
            lbl.appendChild(caption);
            options.appendChild(lbl);
        });

        const scale = document.createElement("span");
        scale.className = "rating-scale";
        scale.textContent = "1 = น้อยที่สุด → 5 = มากที่สุด";

        row.appendChild(options);
        row.appendChild(scale);
        div.appendChild(row);
        container.appendChild(div);
    });
}

// แสดง/ซ่อนช่องกรอกเมื่อเลือก "อื่น ๆ"
function setupOtherTitle() {
    const select = document.getElementById("title");
    const box = document.getElementById("otherTitleBox");
    const input = document.getElementById("title_other");

    const toggle = () => {
        const isOther = select.value === "อื่นๆ";
        box.style.display = isOther ? "block" : "none";
        input.required = isOther; // บังคับกรอกเมื่อเลือกอื่น ๆ
        if (!isOther) input.value = ""; // เคลียร์เมื่อไม่เลือก
    };

    select.addEventListener("change", toggle);
    toggle(); // เรียกครั้งแรก (ซ่อนไว้)
}

// คืนค่าคำนำหน้า (รวมกรณีเลือก "อื่น ๆ" → "อื่น ๆ: [ที่กรอก]")
function getSelectedTitle() {
    const select = document.getElementById("title");
    if (select.value === "อื่นๆ") {
        const custom = document.getElementById("title_other").value.trim();
        return custom ? `อื่น ๆ: ${custom}` : "";
    }
    return select.value;
}

// แสดงข้อความ
function showMessage(text, type) {
    const msg = document.getElementById("formMessage");
    msg.textContent = text;
    msg.className = "form-message " + type;
}

function setLoading(loading) {
    const btn = document.getElementById("submitBtn");
    btn.disabled = loading;
    btn.textContent = loading ? "⏳ กำลังส่ง..." : "📤 ส่งแบบสอบถาม";
}

// เก็บคะแนนจากทุกคำถาม
function collectRatings() {
    const ratings = {};
    QUESTIONS.forEach((_, i) => {
        const selected = document.querySelector(`input[name="q${i + 1}"]:checked`);
        ratings[`q${i + 1}`] = selected ? selected.value : "";
    });
    return ratings;
}

// ส่งข้อมูล
async function submitForm(e) {
    e.preventDefault();
    const form = document.getElementById("surveyForm");

    // ตรวจสอบ HTML5 validation
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // ตรวจสอบว่าตอบครบทุกข้อ
    const ratings = collectRatings();
    const unanswered = Object.values(ratings).filter(v => v === "").length;
    if (unanswered > 0) {
        showMessage(`❌ กรุณาให้คะแนนครบทุกข้อ (ยังขาด ${unanswered} ข้อ)`, "error");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    setLoading(true);
    showMessage("", "");

    const data = {
        formType: "survey",
        title: getSelectedTitle(),
        firstname: document.getElementById("firstname").value.trim(),
        lastname: document.getElementById("lastname").value.trim(),
        email: document.getElementById("email").value.trim(),
        ...ratings,
        suggestions: document.getElementById("suggestions").value.trim(),
        timestamp: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
    };

    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(data)
        });
        showMessage(
            "✅ ส่งแบบสอบถามสำเร็จ! ขอบคุณสำหรับความร่วมมือ 🙏\nประกาศนียบัตรจะถูกส่งไปยังอีเมลของท่าน",
            "success"
        );
        form.reset();
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
        console.error("ส่งไม่สำเร็จ:", err);
        showMessage(
            "❌ เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง หรือติดต่อผ่าน Facebook",
            "error"
        );
    } finally {
        setLoading(false);
    }
}

// เริ่มต้น
document.addEventListener("DOMContentLoaded", () => {
    buildQuestions();
    setupOtherTitle();
    document.getElementById("surveyForm").addEventListener("submit", submitForm);
});
