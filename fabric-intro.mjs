export function cutFrame(progress) {
  const p = Math.max(0, Math.min(1, progress));
  return { progress: p, apex: Math.max(0, Math.min(100, 115 - p * 200)), gap: Math.max(0, (p - .12) / .88) * 50, release: Math.max(0, p - .7) * 180, spread: Math.min(1, p / .65) * 13 };
}

export function cutProgress(center, viewportHeight, documentCenter = .8 * viewportHeight) {
  const start = Math.min(.8 * viewportHeight, documentCenter);
  return Math.max(0, Math.min(1, (start - center) / (.6 * viewportHeight)));
}

export function cutTransforms(progress, width, height) {
  const value = cutFrame(progress);
  const apex = value.apex * height / 100;
  const slope = apex < height ? value.gap * width / 100 / (height - apex) : 0;
  const angle = Math.atan(slope) * 180 / Math.PI;
  const shift = apex * slope - value.release * width / 100;
  return {
    left: `translate3d(${shift}px,0,0) skewX(${-angle}deg)`,
    right: `translate3d(${-shift}px,0,0) skewX(${angle}deg)`,
    cap: `scaleY(${value.apex / 100})`,
    shears: `translate3d(-49.5%,calc(-51.5% - ${value.progress * height * 1.3}px),0)`,
    titleLeft: `translate3d(${-value.spread}vw,0,0)`,
    titleRight: `translate3d(${value.spread}vw,0,0)`,
    notes: String(Math.max(0, Math.min(1, (value.progress - .3) * 3))),
    hint: String(Math.max(0, 1 - value.progress * 5)),
  };
}

export function renderFabricIntro(imageURL = 'assets/effects/tailor-shears-open30.png') {
  return `<section class="fabric-intro" aria-labelledby="fabric-title">
    <div class="fabric-copy">
      <p class="fabric-kicker">THE ART OF BESPOKE</p>
      <h2 class="fabric-title" id="fabric-title"><span>Tailored</span><span>Yours.</span></h2>
      <p class="fabric-scroll-hint"><span>아래로 스크롤</span><svg width="16" height="22" viewBox="0 0 16 22" fill="none" aria-hidden="true"><path d="M8 1v18M2 13l6 6 6-6" stroke="currentColor" stroke-width="1.2"/></svg></p>
      <div class="fabric-notes"><p>당신만을 위한 선.<br>당신만을 위한 한 벌.</p><div><small>THE FIRST CUT</small><p>한 사람의 몸을 읽고,<br>원단 위에 새로운 이야기를 그립니다.<br>헤리츠의 테일러링은 여기서 시작됩니다.</p></div></div>
    </div>
    <div class="fabric-stage" aria-hidden="true">
      <div class="fabric-underlay"></div>
      <div class="fabric-piece fabric-left"></div>
      <div class="fabric-piece fabric-right"></div>
      <div class="fabric-shears"><img src="${imageURL}" width="1024" height="1536" alt="" decoding="async" fetchpriority="high"></div>
    </div>
  </section>`;
}

export function mountFabricIntro() {
  const intro = document.querySelector('.fabric-intro');
  const stage = intro?.querySelector('.fabric-stage');
  if (!stage) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const short = matchMedia('(max-height: 600px)');
  const cap = document.createElement('div');
  cap.className = 'fabric-cap';
  stage.insertBefore(cap, stage.querySelector('.fabric-shears'));
  const targets = {
    left: intro.querySelector('.fabric-left'), right: intro.querySelector('.fabric-right'), cap,
    shears: intro.querySelector('.fabric-shears'),
    titleLeft: intro.querySelector('.fabric-title span:first-child'), titleRight: intro.querySelector('.fabric-title span:last-child'),
    notes: intro.querySelector('.fabric-notes'), hint: intro.querySelector('.fabric-scroll-hint'),
  };
  const property = key => key === 'notes' || key === 'hint' ? 'opacity' : 'transform';
  const original = Object.fromEntries(Object.entries(targets).map(([key, element]) => [key, element.style.getPropertyValue(property(key))]));
  let frame = 0;
  let disposed = false;
  let paintedProgress, paintedHeight, paintedWidth;
  function reset() {
    if (paintedProgress === undefined) return;
    paintedProgress = paintedHeight = paintedWidth = undefined;
    intro.classList.remove('fabric-enhanced');
    for (const [key, element] of Object.entries(targets)) {
      if (original[key]) element.style.setProperty(property(key), original[key]);
      else element.style.removeProperty(property(key));
    }
  }
  function paint() {
    frame = 0;
    if (disposed) return;
    if (motion.matches || short.matches) { reset(); return; }
    const rect = stage.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    // The first screen stays entirely white even on taller desktop viewports.
    const progress = cutProgress(center, window.innerHeight, center + window.scrollY);
    if (progress === paintedProgress && rect.height === paintedHeight && rect.width === paintedWidth) return;
    paintedProgress = progress;
    paintedHeight = rect.height;
    paintedWidth = rect.width;
    for (const [key, value] of Object.entries(cutTransforms(progress, rect.width, rect.height))) targets[key].style.setProperty(property(key), value);
    intro.classList.add('fabric-enhanced');
  }
  function queue() { if (!disposed && !frame) frame = requestAnimationFrame(paint); }
  function onMedia() {
    cancelAnimationFrame(frame);
    paint();
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  motion.addEventListener('change', onMedia);
  short.addEventListener('change', onMedia);
  paint();
  return function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener('scroll', queue);
    window.removeEventListener('resize', queue);
    motion.removeEventListener('change', onMedia);
    short.removeEventListener('change', onMedia);
    reset();
    cap.remove();
  };
}
