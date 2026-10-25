/* app.js — ลงทะเบียนจตุรธาตุ ๒๓–๒๔ ต.ค. ๒๕๖๙ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var API = (window.API_BASE || '').replace(/\/+$/, '');

  function showMsg(txt, kind) {
    var m = $('statusMsg'); if (!m) return;
    m.textContent = txt; m.className = 'msg ' + (kind === 'ok' ? 'ok' : 'err');
  }
  function clearMsg() { var m = $('statusMsg'); if (m) { m.textContent = ''; m.className = 'msg'; } }

  /* ── PDPA: แตะได้ทั้งกล่อง ── */
  var box = $('pdpaBox'), cb = $('pdpaConsent');
  if (box && cb) {
    box.addEventListener('click', function (ev) {
      if (ev.target === cb) return;                       // กดที่ตัว checkbox เอง
      ev.preventDefault();
      cb.checked = !cb.checked;
      clearMsg();
      if (cb.checked) showMsg('✅ ยอมรับคำยินยอม PDPA แล้ว', 'ok');
    });
    cb.addEventListener('change', function () { clearMsg(); });
  }

  /* ── modal อ่านฉบับเต็ม ── */
  var PDPA_TEXT = [
    'ข้าพเจ้ายินยอมให้อาศรมศรีมงคล เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า',
    '๑. ข้อมูลที่เก็บ: ชื่อ-นามสกุล คำนำหน้า เพศ อายุ อาชีพ ที่อยู่ติดต่อ อีเมล เบอร์โทรศัพท์ LINE ID สถานภาพสมาชิก รวมถึงภาพถ่ายและบันทึกวิดีโอในระหว่างการอบรม',
    '๒. วัตถุประสงค์: เพื่อการลงทะเบียนเข้าอบรม ออกประกาศนียบัตร ติดต่อประสานงาน และประชาสัมพันธ์กิจกรรมของอาศรมศรีมงคล',
    '๓. ระยะเวลาเก็บ: เท่าที่จำเป็นตามวัตถุประสงค์ หรือตามที่กฎหมายกำหนด',
    '๔. การเปิดเผย: อาจเปิดเผยต่อหน่วยงานที่เกี่ยวข้องเพื่อการออกประกาศนียบัตร หรือเมื่อได้รับความยินยอม',
    '๕. สิทธิของเจ้าของข้อมูล: ข้าพเจ้ามีสิทธิขอเข้าถึง ขอสำเนา ขอแก้ไข ขอลบ ขอระงับการใช้ และถอนความยินยอมได้ โดยติดต่ออาศรมศรีมงคล',
    '๖. การถอนความยินยอม: ข้าพเจ้าสามารถถอนความยินยอมได้ตลอดเวลา การถอนจะไม่กระทบการประมวลผลที่ได้ทำไปแล้วโดยชอบ',
    '๗. ข้าพเจ้าได้อ่านและเข้าใจข้อความข้างต้นแล้ว จึงให้ความยินยอมด้วยความสมัครใจ',
    '๘. ผู้ควบคุมข้อมูล: อาศรมศรีมงคล — ติดต่อได้ตามช่องทางที่ประกาศไว้ในกิจกรรม'
  ].join('\n\n');
  var modal = $('pdpaModal'), body = $('pdpaBody');
  if (body) { body.innerHTML = PDPA_TEXT.split('\n\n').map(function (p) { return '<p>' + p + '</p>'; }).join(''); }
  function openModal() { if (modal) modal.classList.add('on'); }
  function closeModal() { if (modal) modal.classList.remove('on'); }
  if ($('btnRead')) $('btnRead').addEventListener('click', openModal);
  if ($('btnClose')) $('btnClose').addEventListener('click', closeModal);
  if ($('btnAgree')) $('btnAgree').addEventListener('click', function () {
    if (cb) { cb.checked = true; showMsg('✅ ยอมรับคำยินยอม PDPA แล้ว', 'ok'); }
    closeModal();
  });
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  /* ── อาชีพ "อื่นๆ" ── */
  if ($('occupation')) $('occupation').addEventListener('change', function () {
    var o = $('occOther'); if (!o) return;
    if (this.value === 'อื่นๆ') o.classList.remove('hide'); else { o.classList.add('hide'); o.value = ''; }
  });

  /* ── ส่งฟอร์ม ── */
  var form = $('regForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearMsg();
    var need = [['title', 'คำนำหน้า'], ['firstName', 'ชื่อ'], ['lastName', 'นามสกุล'],
                ['gender', 'เพศ'], ['age', 'อายุ'], ['email', 'อีเมล'], ['occupation', 'อาชีพ']];
    for (var i = 0; i < need.length; i++) {
      var el = $(need[i][0]);
      if (!el) continue;
      if (!String(el.value || '').trim()) {
        showMsg('⚠️ กรุณากรอก "' + need[i][1] + '"', 'err');
        el.focus();
        if (el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    var em = $('email');
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) {
      showMsg('⚠️ รูปแบบอีเมลไม่ถูกต้อง', 'err'); em.focus(); return;
    }
    if (!cb || !cb.checked) {
      showMsg('⚠️ กรุณาติ๊กยอมรับคำยินยอม PDPA (แตะที่กล่องสีเขียว)', 'err');
      if (box && box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var occ = $('occupation').value;
    var occupation = occ === 'อื่นๆ' ? ('อื่นๆ: ' + ($('occOther').value || '').trim()) : occ;
    var payload = {
      event: 'yamkang-oct31',
      title: $('title').value,
      firstName: $('firstName').value.trim(),
      lastName: $('lastName').value.trim(),
      gender: $('gender').value,
      age: $('age').value,
      email: $('email').value.trim(),
      phone: ($('phone') || {}).value || '',
      lineId: ($('lineId') || {}).value || '',
      occupation: occupation,
      address: ($('address') || {}).value || '',
      pdpaConsent: 'ยินยอม'
    };
    var btn = $('btnSend');
    btn.disabled = true; btn.textContent = '⏳ กำลังส่ง...';
    fetch(API + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.result === 'success') {
        showMsg('✅ ลงทะเบียนสำเร็จ', 'ok');
        window.location.href = 'success.html';
      } else {
        showMsg('⚠️ ' + ((j && j.message) || 'ลงทะเบียนไม่สำเร็จ'), 'err');
        btn.disabled = false; btn.textContent = '📤 ส่งข้อมูลลงทะเบียน';
      }
    }).catch(function () {
      showMsg('❌ ไม่สามารถเชื่อมต่อ server ได้ กรุณาลองใหม่', 'err');
      btn.disabled = false; btn.textContent = '📤 ส่งข้อมูลลงทะเบียน';
    });
  });
})();
