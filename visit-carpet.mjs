export function carpetProgress(top, height, viewport) {
  return Math.max(0, Math.min(1, (viewport * .88 - top) / Math.max(1, height + viewport * .2)));
}
export function mountVisitCarpet(doc = document) {
  const carpet = doc.querySelector('.visit-carpet');
  const view = doc.defaultView;
  if (!carpet || !view) return () => {};
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  function paint() {
    frame = 0;
    const rect = carpet.getBoundingClientRect();
    const progress = reduced.matches ? 1 : carpetProgress(rect.top, rect.height, view.innerHeight);
    carpet.style.setProperty('--carpet-length', `${12 + progress * 78}%`);
    carpet.style.setProperty('--carpet-radius', `${1 - progress * .55}`);
    carpet.style.setProperty('--carpet-turn', `${progress * -540}deg`);
  }
  function queue() { if (!frame) frame = view.requestAnimationFrame(paint); }
  view.addEventListener('scroll', queue, {passive:true});
  view.addEventListener('resize', queue);
  reduced.addEventListener('change', queue);
  paint();
  return () => {
    view.cancelAnimationFrame(frame);
    view.removeEventListener('scroll', queue);
    view.removeEventListener('resize', queue);
    reduced.removeEventListener('change', queue);
    ['--carpet-length','--carpet-radius','--carpet-turn'].forEach(name=>carpet.style.removeProperty(name));
  };
}
