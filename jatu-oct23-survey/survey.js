/* survey.js — แบบสอบถามความพึงพอใจ จตุรธาตุ ๒๓–๒๔ ต.ค. ๒๕๖๙ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var API = (window.API_BASE || '').replace(/\/+$/, '');

  var QUESTIONS = [
    { key: 'content', text: 'เนื้อหาหลักสูตรตรงกับความคาดหวัง' },
    { key: 'speaker', text: 'วิทยากรถ่ายทอดเข้าใจง่าย ตอบข้อซักถามได้ชัดเจน' },
    { key: 'material', text: 'เอกสาร / สื่อประกอบการอบรมมีความเหมาะสม' },
    { key: 'venue', text: 'สถานที่จัดอบรม สะอาด สะดวก และเหมาะสม' },
    { key: 'duration', text: 'ระยะเวลาการอบรมมีความเหมาะสม' },
    { key: 'benefit', text: 'สามารถนำความรู้ไปใช้ประโยชน์ได้จริง' },
    { key: 'organize', text: 'การประชาสัมพันธ์และการประสานงานก่อนอบรม' },
    { key: 'overall', text: 'ความพึงพอใจโดยรวมต่อการอบรมครั้งนี้' }
  ];
  var LABELS = { 1: 'น้อยที่สุด', 2: 'น้อย', 3: 'ปานกลาง', 4: 'มาก', 5: 'มากที่สุด' };

  var area = $('qArea');
  if (area) {
    area.innerHTML = QUESTIONS.map(function (q, i) {
      var stars = [1, 2, 3, 4, 5].map(function (n) {
        return '<label><input type="radio" name="' + q.key + '" value="' + n + '">' +
          '<span class="n">' + n + '</span><span class="lbl">' + LABELS[n] + '</span></label>';
      }).join('');
      return '<div class="q"><div class="t">' + (i + 1) + '. ' + q.text + ' <span style="color:#C62828">*</span></div>' +
        '<div class="stars">' + stars + '</div></div>';
    }).join('');
  }

  function showMsg(txt, kind) {
    var m = $('statusMsg'); if (!m) return;
    m.textContent = txt; m.className = 'msg ' + (kind === 'ok' ? 'ok' : 'err');
  }

  var form = $('surveyForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var missing = [];
    QUESTIONS.forEach(function (q, i) {
      var el = form.querySelector('input[name="' + q.key + '"]:checked');
      if (!el) missing.push(i + 1);
    });
    if (missing.length) {
      showMsg('⚠️ กรุณาตอบข้อ ' + missing.join(', ') + ' ให้ครบ', 'err');
      var first = form.querySelector('input[name="' + QUESTIONS[missing[0] - 1].key + '"]');
      if (first && first.closest('.q')) first.closest('.q').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var payload = {
      event: 'jatu-oct23',
      title: '',
      fullname: '',
      occupation: '',
      comment: $('comment').value.trim(),
      nextCourse: $('nextCourse').value.trim()
    };
    QUESTIONS.forEach(function (q) {
      payload[q.key] = parseInt(form.querySelector('input[name="' + q.key + '"]:checked').value, 10);
    });

    var btn = $('btnSend');
    btn.disabled = true; btn.textContent = '⏳ กำลังส่ง...';

    fetch(API + '/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.result === 'success') {
        $('formArea').classList.add('hide');
        $('doneArea').classList.remove('hide');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showMsg('⚠️ ' + ((j && j.message) || 'ส่งไม่สำเร็จ'), 'err');
        btn.disabled = false; btn.textContent = '📤 ส่งแบบสอบถาม';
      }
    }).catch(function () {
      showMsg('❌ ไม่สามารถเชื่อมต่อ server ได้ กรุณาลองใหม่', 'err');
      btn.disabled = false; btn.textContent = '📤 ส่งแบบสอบถาม';
    });
  });
})();
