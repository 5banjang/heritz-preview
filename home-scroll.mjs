const CHAPTERS = [
  ['moments', 'HERITZ MOMENTS'], ['rental', 'RENTAL COLLECTION'],
  ['experience', 'THE PROCESS'], ['store', 'VISIT HERITZ'], ['booking', 'BOOK YOUR FITTING']
];

const clamp = value => Math.max(0, Math.min(1, value));
export function galleryFrame(progress, count) {
  const position = clamp((progress - .08) / .84) * Math.max(0, count - 1);
  return { position, index: Math.round(position) };
}
export function backgroundPose(offset) {
  const distance = Math.min(Math.abs(offset), 1);
  return {
    x: Math.sign(offset) * distance * 2,
    scale: 1 + .04 * distance,
    opacity: 1 - distance,
  };
}
export function backgroundProgress(rect, viewport) {
  return rect.height > viewport ? clamp(-rect.top / (rect.height - viewport)) : 0;
}
export function passageProgress(rect, viewport) {
  return clamp((.8 * viewport - (rect.top + rect.height / 2)) / (.6 * viewport));
}
export function anchoredPosition(progress, count, anchor) {
  const canonical = galleryFrame(progress, count).position;
  return anchor ? Math.max(0, Math.min(count - 1, anchor.position + canonical - galleryFrame(anchor.progress, count).position)) : canonical;
}
export function chapterFrame(rects, viewport) {
  let index = -1;
  rects.forEach((rect, i) => { if (rect.top <= viewport * .45) index = i; });
  return { index, progress: index < 0 ? 0 : clamp((viewport * .45 - rects[index].top) / rects[index].height) };
}

export function mountHomeScroll() {
  const main = document.querySelector('.home-main');
  if (!main) return;
  const sections = CHAPTERS.map(([id]) => main.querySelector('#' + id));
  const moments = sections[0];
  const track = moments?.querySelector('.moment-grid');
  if (sections.some(section => !section) || !track?.children.length) return;
  const slides = [...track.children];
  const compactMotion = matchMedia('(prefers-reduced-motion: reduce), (max-height: 600px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.createElement('nav');
  nav.className = 'chapter-rail';
  nav.setAttribute('aria-label', '메인 페이지 섹션 이동');
  nav.innerHTML = CHAPTERS.map(([id, label], i) => `<button type="button" data-chapter="${i}" aria-label="${label} 이동" aria-controls="${id}"><span class="chapter-tick" aria-hidden="true"></span><span class="chapter-label">${label}</span></button>`).join('');
  main.append(nav);
  const chapterButtons = [...nav.children];
  let gallery, viewport, controls, dots = [], frame = 0, disposed = false;
  let position = 0, anchor, focused = false, resized = false, lastY = window.scrollY;
  let paintedPosition, paintedIndex;
  let paintedChapter, paintedRailColor;
  const paintedChapterProgress = [];
  const paintedOffsets = new Map();
  main.classList.add('home-scroll');
  const progressNow = () => backgroundProgress(moments.getBoundingClientRect(), window.innerHeight);
  function restoreGrid() {
    paintedPosition = paintedIndex = undefined;
    paintedOffsets.clear();
    slides.forEach(slide => {
      slide.inert = false; slide.removeAttribute('aria-hidden');
      for (const key of ['transform', 'transform-origin', 'filter', 'opacity', 'z-index']) slide.style.removeProperty(key);
    });
    if (gallery) {
      const active = track.contains(document.activeElement) ? document.activeElement : controls.contains(document.activeElement) ? slides[Math.round(position)] : null;
      controls.removeEventListener('click', selectPhoto);
      gallery.replaceWith(track);
      gallery = viewport = controls = undefined;
      active?.focus({ preventScroll: true });
    }
    track.style.removeProperty('transform');
    track.style.removeProperty('--film-duration');
    moments.classList.remove('moments-cinema');
  }
  function configure() {
    restoreGrid();
    anchor = undefined;
    resized = false;
    focused = slides.some(slide => slide.contains(document.activeElement));
    main.classList.toggle('scroll-motion', !compactMotion.matches);
    if (!compactMotion.matches) {
      gallery = document.createElement('div');
      gallery.className = 'moments-gallery';
      gallery.innerHTML = `<div class="moments-viewport"></div><div class="moments-controls"></div>`;
      viewport = gallery.querySelector('.moments-viewport');
      controls = gallery.querySelector('.moments-controls');
      controls.innerHTML = `<span class="moments-counter" aria-hidden="true"></span><div class="moments-dots" role="group" aria-label="사진 선택">${slides.map((_, i) => `<button type="button" data-photo-index="${i}" aria-label="${i + 1}번째 사진 보기"><span></span></button>`).join('')}</div>`;
      dots = [...controls.querySelectorAll('button')];
      const active = focused ? document.activeElement : null;
      track.before(gallery);
      viewport.append(track);
      active?.focus({ preventScroll: true });
      controls.addEventListener('click', selectPhoto);
      moments.classList.add('moments-cinema');
      if (focused) {
        const focusedIndex = slides.findIndex(slide => slide.contains(document.activeElement));
        if (focusedIndex !== Math.round(position)) position = focusedIndex;
        anchor = { progress: progressNow(), position };
      }
    }
    lastY = window.scrollY;
    queue();
  }
  function selectPhoto(event) {
    const button = event.target.closest('[data-photo-index]');
    if (!button) return;
    // A pointer activation can leave focus on the old link in some browsers.
    if (track.contains(document.activeElement)) button.focus({ preventScroll: true });
    position = Number(button.dataset.photoIndex);
    track.style.setProperty('--film-duration', '550ms');
    anchor = { progress: progressNow(), position };
    lastY = window.scrollY;
    queue();
  }
  function focusIn() {
    if (!gallery) return;
    focused = true;
    anchor = { progress: progressNow(), position };
    lastY = window.scrollY;
  }
  function focusOut(event) {
    if (!gallery || track.contains(event.relatedTarget)) return;
    focused = false;
    // Rebase on blur: accumulated scrolling while focused must never catch up.
    anchor = { progress: progressNow(), position };
    lastY = window.scrollY;
    queue();
  }
  function selectChapter(event) {
    const button = event.target.closest('[data-chapter]');
    if (button) sections[Number(button.dataset.chapter)].scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  }
  function paint() {
    frame = 0;
    if (disposed) return;
    const rects = sections.map(section => section.getBoundingClientRect());
    const screen = viewport;
    const chapter = chapterFrame(rects, window.innerHeight);
    const scrolled = window.scrollY !== lastY;
    if (scrolled || resized) track.style.setProperty('--film-duration', '0ms');
    lastY = window.scrollY;
    if (screen) {
      const progress = backgroundProgress(rects[0], window.innerHeight);
      if (resized) anchor = { progress, position };
      if (!focused && (rects[0].top >= window.innerHeight || rects[0].top + rects[0].height <= 0)) anchor = undefined;
      if (!focused && !resized && (scrolled || !anchor)) position = anchoredPosition(progress, slides.length, anchor);
    }
    resized = false;
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
    if (screen && position !== paintedPosition) {
      paintedPosition = position;
      const index = Math.round(position);
      slides.forEach((slide, i) => {
        const offset = Math.max(-1, Math.min(1, i - position));
        if (paintedOffsets.get(slide) !== offset) {
          paintedOffsets.set(slide, offset);
          const pose = backgroundPose(offset);
          slide.style.transform = `translate3d(${pose.x}%,0,0) scale(${pose.scale})`;
          slide.style.opacity = String(pose.opacity);
        }
        if (paintedIndex !== index) {
          slide.style.setProperty('z-index', String(slides.length - Math.abs(i - index)));
          const hidden = i !== index && !slide.contains(document.activeElement);
          slide.inert = hidden;
          slide.setAttribute('aria-hidden', String(hidden));
        }
      });
      if (paintedIndex !== index) {
        paintedIndex = index;
        dots.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
        controls.querySelector('.moments-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      }
    }
  }
  function queue() { if (!disposed && !frame) frame = requestAnimationFrame(paint); }
  function resize() { resized = true; queue(); }
  nav.addEventListener('click', selectChapter);
  track.addEventListener('focusin', focusIn);
  track.addEventListener('focusout', focusOut);
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', resize);
  compactMotion.addEventListener('change', configure);
  configure();
  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', queue);
    window.removeEventListener('resize', resize);
    compactMotion.removeEventListener('change', configure);
    track.removeEventListener('focusin', focusIn);
    track.removeEventListener('focusout', focusOut);
    nav.removeEventListener('click', selectChapter);
    nav.remove();
    restoreGrid();
    main.classList.remove('home-scroll', 'scroll-motion');
  };
}
