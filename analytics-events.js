/* HERITZ TAILOR GA4: outbound contact intent events only.
 * Clicks do not prove a completed reservation or conversation.
 */
(() => {
  'use strict';
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || typeof window.gtag !== 'function') return;
    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    let eventName = '';
    if (url.hostname === 'pf.kakao.com') eventName = 'kakao_consult_click';
    else if (url.hostname === 'naver.me' || url.hostname === 'booking.naver.com' || url.hostname === 'm.booking.naver.com') eventName = 'naver_booking_click';
    else if (url.protocol === 'tel:') eventName = 'phone_click';
    if (!eventName) return;
    window.gtag('event', eventName, {
      link_location: url.protocol === 'tel:' ? 'telephone' : url.hostname,
      page_location: location.href,
      contact_source: 'website'
    });
  });
})();
