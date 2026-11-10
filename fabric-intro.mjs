export function cutFrame(progress) {
  const p = Math.max(0, Math.min(1, progress));
  return { progress: p, apex: Math.max(0, Math.min(100, 115 - p * 200)), gap: Math.max(0, (p - .12) / .88) * 50, release: Math.max(0, p - .7) * 180, spread: Math.min(1, p / .65) * 13 };
}

export function cutProgress(center, viewportHeight, documentCenter = .8 * viewportHeight) {
  const start = Math.min(.8 * viewportHeight, documentCenter);
  return Math.max(0, Math.min(1, (start - center) / (.6 * viewportHeight)));
}

export function renderFabricIntro(imageURL = 'assets/effects/tailor-shears-open30.png') {
  return `<section class="fabric-intro" aria-labelledby="fabric-title">
    <div class="fabric-copy">
      <p class="fabric-kicker">THE ART OF BESPOKE</p>
      <h2 class="fabric-title" id="fabric-title"><span>Tailored</span><span>Yours.</span></h2>
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
  const properties = Object.keys(cutFrame(0));
  let frame = 0;
  let disposed = false;
  function reset() {
    intro.classList.remove('fabric-enhanced');
    for (const key of properties) intro.style.removeProperty('--' + key);
  }
  function paint() {
    frame = 0;
    if (disposed) return;
    if (motion.matches || short.matches) { reset(); return; }
    const rect = stage.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    // The first screen stays entirely white even on taller desktop viewports.
    const values = cutFrame(cutProgress(center, window.innerHeight, center + window.scrollY));
    for (const [key, value] of Object.entries(values)) intro.style.setProperty('--' + key, value);
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
  };
}
