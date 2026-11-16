const CHAPTERS = [
  ['moments', 'HERITZ MOMENTS'], ['rental', 'RENTAL COLLECTION'],
  ['experience', 'THE PROCESS'], ['store', 'VISIT HERITZ'], ['booking', 'BOOK YOUR FITTING']
];
const clamp = value => Math.max(0, Math.min(1, value));
export function chapterFrame(rects, viewport) {
  let index = -1;
  rects.forEach((rect, i) => { if (rect.top <= viewport * .45) index = i; });
  return { index, progress: index < 0 ? 0 : clamp((viewport * .45 - rects[index].top) / rects[index].height) };
}

export function mountHomeScroll() {
  const main = document.querySelector('.home-main');
  if (!main) return;
  const sections = CHAPTERS.map(([id]) => main.querySelector('#' + id));
  const moments = sections[0], track = moments?.querySelector('.moment-grid');
  if (sections.some(section => !section) || !track?.children.length) return;
  const slides = [...track.children], reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.createElement('nav');
  nav.className = 'chapter-rail';
  nav.setAttribute('aria-label', '메인 페이지 섹션 이동');
  nav.innerHTML = CHAPTERS.map(([id, label], i) => `<button type="button" data-chapter="${i}" aria-label="${label} 이동" aria-controls="${id}"><span class="chapter-tick" aria-hidden="true"></span><span class="chapter-label">${label}</span></button>`).join('');
  main.append(nav);
  const chapterButtons = [...nav.children], gallery = document.createElement('div');
  gallery.className = 'moments-gallery';
  gallery.innerHTML = '<div class="moments-viewport" tabindex="0" role="region" aria-label="고객 사진 · 좌우로 넘겨 보기"></div><div class="moments-controls"></div>';
  const viewport = gallery.querySelector('.moments-viewport'), controls = gallery.querySelector('.moments-controls');
  controls.innerHTML = `<div class="moments-navigation"><button type="button" data-photo-direction="-1" aria-label="이전 고객 사진">←</button><span class="moments-counter" aria-live="polite" aria-atomic="true"></span><button type="button" data-photo-direction="1" aria-label="다음 고객 사진">→</button></div><div class="moments-dots" role="group" aria-label="사진 선택">${slides.map((_, i) => `<button type="button" data-photo-index="${i}" aria-label="${i + 1}번째 사진 보기"><span></span></button>`).join('')}</div>`;
  const dots = [...controls.querySelectorAll('[data-photo-index]')], arrows = [...controls.querySelectorAll('[data-photo-direction]')];
  const focused = track.contains(document.activeElement) ? document.activeElement : null;
  track.before(gallery);
  viewport.append(track);
  focused?.focus({ preventScroll: true });
  main.classList.add('home-scroll', 'scroll-motion');
  moments.classList.add('moments-cinema', 'moments-swipe');
  let frame = 0, disposed = false, index = 0, paintedIndex = -1, gesture = null, suppressClick = false;
  let paintedChapter, paintedRailColor;
  const paintedChapterProgress = [];
  const bounded = value => Math.max(0, Math.min(slides.length - 1, value));

  function moveTo(next, behavior = reduced.matches ? 'instant' : 'smooth') {
    viewport.scrollTo({ left: bounded(next) * viewport.clientWidth, behavior });
    queue();
  }
  function selectPhoto(event) {
    const dot = event.target.closest('[data-photo-index]'), arrow = event.target.closest('[data-photo-direction]');
    if (dots.includes(dot)) moveTo(Number(dot.dataset.photoIndex));
    else if (arrows.includes(arrow) && !arrow.disabled) moveTo(index + Number(arrow.dataset.photoDirection));
  }
  function galleryKey(event) {
    if (event.target !== viewport || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    moveTo(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : index + (event.key === 'ArrowLeft' ? -1 : 1));
  }
  function finish() {
    const current = gesture;
    gesture = null;
    viewport.classList.remove('moments-dragging');
    if (current && viewport.hasPointerCapture?.(current.id)) viewport.releasePointerCapture(current.id);
    if (current?.dragging && !disposed) moveTo(Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth)));
  }
  function down(event) {
    suppressClick = false;
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.isPrimary === false) return;
    finish();
    gesture = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft, dragging: false };
  }
  function move(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const delta = event.clientX - gesture.x;
    if (!gesture.dragging && Math.abs(delta) <= 6) return;
    if (!gesture.dragging) {
      gesture.dragging = true;
      suppressClick = true;
      viewport.classList.add('moments-dragging');
      viewport.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    viewport.scrollLeft = Math.max(0, Math.min((slides.length - 1) * viewport.clientWidth, gesture.left - delta));
    queue();
  }
  function end(event) { if (gesture?.id === event.pointerId) finish(); }
  function click(event) {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }
  function preventNativeDrag(event) { event.preventDefault(); }
  function selectChapter(event) {
    const button = event.target.closest('[data-chapter]');
    if (chapterButtons.includes(button)) sections[Number(button.dataset.chapter)].scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  }
  function paint() {
    frame = 0;
    if (disposed) return;
    index = bounded(Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth)));
    if (index !== paintedIndex) {
      paintedIndex = index;
      dots.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      arrows.forEach(button => { button.disabled = Number(button.dataset.photoDirection) < 0 ? index === 0 : index === slides.length - 1; });
      controls.querySelector('.moments-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }
    const chapter = chapterFrame(sections.map(section => section.getBoundingClientRect()), window.innerHeight);
    const railColor = chapter.index === 2 || chapter.index === 4 || (chapter.index < 0 && window.scrollY < window.innerHeight * .2) ? '#000' : '#fff';
    if (railColor !== paintedRailColor) nav.style.setProperty('--rail-active', railColor);
    paintedRailColor = railColor;
    chapterButtons.forEach((button, i) => {
      if (chapter.index !== paintedChapter) {
        if (i === chapter.index) button.setAttribute('aria-current', 'location');
        else button.removeAttribute('aria-current');
      }
      const progress = i < chapter.index ? 1 : i === chapter.index ? chapter.progress : 0;
      if (progress !== paintedChapterProgress[i]) button.style.setProperty('--chapter-progress', progress);
      paintedChapterProgress[i] = progress;
    });
    paintedChapter = chapter.index;
  }
  function queue() { if (!disposed && !frame) frame = requestAnimationFrame(paint); }
  function resize() { finish(); moveTo(index, 'instant'); }
  nav.addEventListener('click', selectChapter);
  controls.addEventListener('click', selectPhoto);
  viewport.addEventListener('scroll', queue, { passive: true });
  viewport.addEventListener('keydown', galleryKey);
  viewport.addEventListener('pointerdown', down);
  viewport.addEventListener('lostpointercapture', end);
  viewport.addEventListener('click', click, true);
  viewport.addEventListener('dragstart', preventNativeDrag);
  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', resize);
  queue();
  return () => {
    if (disposed) return;
    disposed = true;
    finish();
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', queue);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    nav.removeEventListener('click', selectChapter);
    controls.removeEventListener('click', selectPhoto);
    viewport.removeEventListener('scroll', queue);
    viewport.removeEventListener('keydown', galleryKey);
    viewport.removeEventListener('pointerdown', down);
    viewport.removeEventListener('lostpointercapture', end);
    viewport.removeEventListener('click', click, true);
    viewport.removeEventListener('dragstart', preventNativeDrag);
    const active = track.contains(document.activeElement) ? document.activeElement : gallery.contains(document.activeElement) ? slides[index] : null;
    gallery.replaceWith(track);
    active?.focus({ preventScroll: true });
    nav.remove();
    moments.classList.remove('moments-cinema', 'moments-swipe');
    main.classList.remove('home-scroll', 'scroll-motion');
  };
}
