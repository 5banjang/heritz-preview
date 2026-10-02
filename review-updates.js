'use strict';
/* GitHub review #1–#6, 2026-10-02. Additive integration for the original review app.
 * Booking URL is the exact "예약 문의" link published by
 * https://heritztailor.com/cheongdam (checked 2026-10-02).
 * No reservation, payment or message is submitted by this script.
 */
(() => {
  const VERSION = 'v2 · 2026-10-02';
  const BOOKING_URL = 'https://naver.me/G7ZOAG1j';
  const eventsView = document.getElementById('events-view');
  if (!eventsView) return;

  // Keep existing #groom / #family review permalinks working in the EVENT view.
  const previousParseRoute = parseRoute;
  parseRoute = function () {
    const path = location.hash.slice(1).split('?')[0];
    if (['events', 'events/groom', 'events/family', 'groom', 'family'].includes(path)) {
      const selected = path === 'events' ? 'all' : path.split('/').pop();
      return {page: 'events', section: selected === 'all' ? 'events' : selected, filter: selected, photo: null};
    }
    return previousParseRoute();
  };
  const previousRenderRoute = renderRoute;
  renderRoute = function (initial = false) {
    const next = parseRoute();
    const capture = document.getElementById('capture-dialog');
    if (capture && capture.open) capture.close();
    if (next.page !== 'events') {
      eventsView.hidden = true;
      return previousRenderRoute(initial);
    }
    route = next;
    document.getElementById('home-view').hidden = true;
    document.getElementById('gallery-view').hidden = true;
    eventsView.hidden = false;
    for (const id of ['groom', 'family']) {
      document.getElementById(id).hidden = next.filter !== 'all' && next.filter !== id;
    }
    document.querySelectorAll('[data-event-tab]').forEach(link => {
      if (link.dataset.eventTab === next.filter) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.getElementById('site-footer').classList.remove('gallery-footer');
    document.getElementById('mobile-nav').hidden = true;
    const menu = document.getElementById('menu-toggle');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', '전체 메뉴 열기');
    const photoDialog = document.getElementById('photo-dialog');
    if (photoDialog.open) closeDialog(photoDialog);
    currentPhoto = null;
    document.title = '이벤트 | 헤리츠 홈페이지 시안 검토';
    requestAnimationFrame(() => window.scrollTo({top: 0, behavior: 'instant'}));
  };
  const previousContextFor = contextFor;
  contextFor = function (id, point = null) {
    const context = previousContextFor(id, point);
    if (id === 'groom' || id === 'family') context.url = shareUrl('#events/' + id);
    if (id === 'events') context.url = shareUrl('#events');
    return context;
  };
  const previousContextUI = updateContextUI;
  updateContextUI = function () {
    previousContextUI();
    const label = document.getElementById('review-context-meta');
    label.textContent = label.textContent.replace(CONFIG.version, VERSION);
  };
  const previousIssueBody = issueBody;
  issueBody = function () {
    return previousIssueBody().replace('- 시안: ' + CONFIG.version, '- 시안: ' + VERSION);
  };
  const previousShowInfo = showInfo;
  showInfo = function (title) {
    if (title !== '시안 안내') return previousShowInfo(title);
    document.getElementById('info-title').textContent = title;
    document.getElementById('info-description').textContent =
      '메인·고객 갤러리·이벤트를 함께 검토하는 시안입니다.\n\n' +
      '고객 사진은 첫 화면 바로 아래에 배치했습니다. 신랑·가족 패키지는 EVENT 메뉴에서만 볼 수 있습니다. 매장 사진은 맞춤센터와 렌탈센터로 구분하며, 실제 후기는 캡처 이미지로 등록할 자리를 마련했습니다.\n\n' +
      '실제 사진은 아직 등록 전입니다. 가격·한정 인원·무료주차권 제공 조건은 정식 공개 전 클라이언트 확인이 필요합니다. 네이버 예약 버튼은 공식 청담본점 사이트의 예약 문의 링크로 이동하며, 클릭만으로 예약이나 주차권 발급이 완료되지는 않습니다.\n\n' +
      '수정 의견은 GitHub 이슈에 공개됩니다. 검색 제외 요청(noindex)은 비공개 접근 제어가 아닙니다.';
    openDialog(document.getElementById('info-dialog'));
  };

  // Upgrade only unresolved booking controls. Preserve any later confirmed URL.
  document.querySelectorAll('[data-contact="booking"]').forEach(button => {
    if (button.dataset.linkState === 'ready') return;
    const anchor = document.createElement('a');
    for (const attr of button.attributes) {
      if (!['type', 'aria-haspopup', 'aria-controls', 'title'].includes(attr.name)) {
        anchor.setAttribute(attr.name, attr.value);
      }
    }
    anchor.href = BOOKING_URL;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.dataset.linkState = 'ready';
    anchor.title = '헤리츠테일러 청담본점 네이버 예약 문의 (새 창)';
    anchor.setAttribute('aria-label', (button.getAttribute('aria-label') || button.textContent.trim()) + ' (새 창)');
    while (button.firstChild) anchor.append(button.firstChild);
    button.replaceWith(anchor);
  });

  // Add actual captures by setting data-image-src on a review-capture figure.
  // Empty slots stay labelled; screenshots are never invented or cropped.
  const captureDialog = document.getElementById('capture-dialog');
  let captureTrigger = null;
  document.getElementById('close-capture').addEventListener('click', () => captureDialog.close());
  captureDialog.addEventListener('close', () => {
    setBodyLock();
    if (captureTrigger && captureTrigger.isConnected) captureTrigger.focus({preventScroll: true});
  });
  document.querySelectorAll('[data-review-capture]').forEach(figure => {
    const source = (figure.dataset.imageSrc || '').trim();
    if (!source) return;
    let url;
    try {
      url = new URL(source, location.href);
      if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
    } catch (_) { return; }
    const button = figure.querySelector('.review-capture-preview');
    const placeholder = button.firstElementChild;
    const title = figure.querySelector('figcaption > span').textContent;
    const status = figure.querySelector('.capture-status');
    const image = document.createElement('img');
    image.alt = title + ' 실제 후기 캡처';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.hidden = true;
    image.addEventListener('load', () => {
      image.hidden = false;
      placeholder.hidden = true;
      button.disabled = false;
      button.setAttribute('aria-label', title + ' 원본 크게 보기');
      status.textContent = '원본 보기 ↗';
    });
    image.addEventListener('error', () => {
      image.hidden = true;
      placeholder.hidden = false;
      button.disabled = true;
      status.textContent = '이미지 확인 필요';
    });
    button.append(image);
    image.src = url.href;
    button.addEventListener('click', () => {
      if (!image.complete || !image.naturalWidth) return;
      captureTrigger = button;
      document.getElementById('capture-title').textContent = title + ' 원본';
      const full = document.createElement('img');
      full.src = url.href;
      full.alt = image.alt;
      document.getElementById('capture-original').replaceChildren(full);
      openDialog(captureDialog);
    });
  });
  renderRoute(true);
})();
