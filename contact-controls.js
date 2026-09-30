'use strict';
/* Public destination URLs only; never put an API key or account token in this file.
 * Exact Naver booking and TalkTalk links are awaiting confirmation from HERITZ.
 * Kakao channel identity verified at https://pf.kakao.com/_ljgUxj on 2026-09-30.
 * All navigation is initiated by an explicit click. No messages or bookings are submitted.
 */
(() => {
  const CONTACTS = Object.freeze({
    booking: { label: '네이버 예약', url: '', hosts: ['booking.naver.com','m.booking.naver.com','naver.me'] },
    talktalk: { label: '네이버 톡톡', url: '', hosts: ['talk.naver.com','naver.me'] },
    kakao: { label: '카카오톡', url: 'https://pf.kakao.com/_ljgUxj/chat', hosts: ['pf.kakao.com'] }
  });
  if (document.getElementById('contact-dock')) return;
  const dock = document.createElement('nav');
  dock.id = 'contact-dock';
  dock.className = 'contact-dock';
  dock.setAttribute('aria-label', '빠른 예약 및 상담');
  dock.innerHTML = `
    <button class="contact-action contact-action--booking" type="button" data-contact="booking" aria-label="네이버 예약하기">
      <span class="contact-icon contact-icon--naver" aria-hidden="true">N</span>
      <span class="contact-copy"><small>네이버</small><strong>예약하기</strong></span>
    </button>
    <button class="contact-action contact-action--talk" type="button" data-contact="talktalk" aria-label="네이버 톡톡 상담하기">
      <span class="contact-icon contact-icon--talk" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M25 4.5H7A4.5 4.5 0 0 0 2.5 9v11A4.5 4.5 0 0 0 7 24.5h3V29l6.3-4.5H25a4.5 4.5 0 0 0 4.5-4.5V9A4.5 4.5 0 0 0 25 4.5Z" fill="currentColor"/><circle cx="10" cy="14.5" r="1.5" fill="white"/><circle cx="16" cy="14.5" r="1.5" fill="white"/><circle cx="22" cy="14.5" r="1.5" fill="white"/></svg></span>
      <span class="contact-copy"><small>네이버 톡톡</small><strong>상담하기</strong></span>
    </button>
    <button class="contact-action contact-action--kakao" type="button" data-contact="kakao" aria-label="카카오톡 상담하기 (새 창)">
      <span class="contact-icon contact-icon--kakao" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 4C8.3 4 2 8.8 2 14.8c0 3.9 2.6 7.3 6.5 9.2l-1.3 4.8c-.1.4.3.7.6.5l5.5-3.7c.9.1 1.8.2 2.7.2 7.7 0 14-4.9 14-11S23.7 4 16 4Z" fill="currentColor"/><circle cx="10" cy="15" r="1.45" fill="#fee500"/><circle cx="16" cy="15" r="1.45" fill="#fee500"/><circle cx="22" cy="15" r="1.45" fill="#fee500"/></svg></span>
      <span class="contact-copy"><small>카카오톡</small><strong>상담하기</strong></span>
    </button>
    <button class="contact-review" type="button" data-feedback="overall" aria-label="예약·상담 버튼에 수정 의견 남기기">버튼 수정 의견</button>`;
  document.body.append(dock);

  const dialog = document.createElement('dialog');
  dialog.id = 'contact-pending-dialog';
  dialog.className = 'contact-dialog';
  dialog.setAttribute('aria-labelledby', 'contact-pending-title');
  dialog.setAttribute('aria-describedby', 'contact-pending-text');
  dialog.innerHTML = `<div class="contact-dialog-head"><h2 id="contact-pending-title"></h2><button class="contact-dialog-close" type="button" aria-label="안내 닫기">×</button></div><p id="contact-pending-text"></p><p class="contact-dialog-note">홈페이지 검토용 시안입니다. 이 버튼으로 예약이나 상담이 접수되지는 않습니다.</p><button class="contact-dialog-confirm" type="button">확인</button>`;
  document.body.append(dialog);
  let returnFocus = null;

  function safeUrl(contact) {
    if (!contact || !contact.url) return null;
    try {
      const u = new URL(contact.url);
      return u.protocol === 'https:' && !u.username && !u.password && contact.hosts.includes(u.hostname) ? u.href : null;
    } catch (_) { return null; }
  }
  function showPending(key, trigger) {
    const contact = CONTACTS[key];
    if (!contact) return;
    returnFocus = trigger;
    document.getElementById('contact-pending-title').textContent = contact.label + ' 연결 준비 중';
    document.getElementById('contact-pending-text').textContent = '헤리츠테일러의 정확한 ' + contact.label + ' 주소를 확인하고 있습니다. 주소 확인 후 해당 예약·상담 화면으로 바로 연결됩니다.';
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  dialog.querySelectorAll('.contact-dialog-close,.contact-dialog-confirm').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => {
    document.body.classList.toggle('modal-open', !!document.querySelector('dialog[open]'));
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });

  // The first hero no longer duplicates the persistent reservation control.
  document.querySelectorAll('.hero [data-info="맞춤예복 상담예약"]').forEach(button => button.remove());
  // Existing package / bottom reservation controls use the same destination.
  document.querySelectorAll('button[data-info="신랑 패키지 상담예약"],button[data-info="가족 패키지 상담예약"],button[data-info="방문 상담 예약"]').forEach(button => {
    button.removeAttribute('data-info');
    button.dataset.contact = 'booking';
  });
  document.querySelectorAll('[data-contact]').forEach(button => {
    const key = button.dataset.contact;
    const contact = CONTACTS[key];
    const url = safeUrl(contact);
    if (url) {
      const anchor = document.createElement('a');
      for (const attribute of button.attributes) if (attribute.name !== 'type') anchor.setAttribute(attribute.name, attribute.value);
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.title = '헤리츠테일러 ' + contact.label + ' (새 창)';
      anchor.dataset.linkState = 'ready';
      while (button.firstChild) anchor.append(button.firstChild);
      button.replaceWith(anchor);
    } else {
      button.dataset.linkState = 'pending';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'contact-pending-dialog');
      button.title = contact.label + ' 주소 확인 중';
      button.addEventListener('click', () => showPending(key, button));
    }
  });
  // Keep review mode independent from the customer-facing dock.
  dock.querySelector('.contact-review').addEventListener('click', () => {
    const summary = document.getElementById('review-summary');
    if (summary && !summary.value.trim()) summary.value = '우측 예약·상담 버튼 수정 제안';
  });
})();
