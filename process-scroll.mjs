export function processStep(top, height, viewport, count = 4) {
  if (height <= viewport || count <= 1) return 0;
  const progress = Math.max(0, Math.min(1, -top / (height - viewport)));
  return Math.min(count - 1, Math.floor(progress * count));
}

export function mountProcessScroll(doc = document) {
  const section = doc.querySelector('#experience');
  const view = doc.defaultView;
  const cards = [...(section?.querySelectorAll('.step-card') ?? [])];
  if (!view || !section?.querySelector('.process-stage') || !cards.length) return () => {};
  const compact = view.matchMedia('(prefers-reduced-motion: reduce), (max-height: 600px)');
  const buttons = [...section.querySelectorAll('[data-process-step]')];
  let frame = 0, disposed = false;
  function reset() {
    section.classList.remove('process-enhanced');
    section.style.removeProperty('--process-index');
    cards.forEach(card => { card.removeAttribute('data-current'); card.removeAttribute('aria-hidden'); card.inert = false; });
    buttons.forEach(button => button.removeAttribute('aria-pressed'));
  }
  function paint() {
    frame = 0;
    if (disposed) return;
    if (compact.matches) { reset(); return; }
    section.classList.add('process-enhanced');
    const rect = section.getBoundingClientRect();
    const index = processStep(rect.top, rect.height, view.innerHeight, cards.length);
    section.style.setProperty('--process-index', index);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.processStep) === index)));
    cards.forEach((card, i) => {
      card.inert = i !== index;
      card.setAttribute('aria-hidden', String(i !== index));
      if (i === index) card.setAttribute('data-current', 'true');
      else card.removeAttribute('data-current');
    });
  }
  function queue() { if (!disposed && !frame) frame = view.requestAnimationFrame(paint); }
  function onMedia() { view.cancelAnimationFrame(frame); paint(); }
  function select(event) {
    const button = event.target.closest('[data-process-step]');
    const index = button ? Number(button.dataset.processStep) : cards.indexOf(event.target.closest('.step-card'));
    if (!Number.isInteger(index) || index < 0 || index >= cards.length) return;
    if (compact.matches) { cards[index].scrollIntoView({ behavior: 'instant', block: 'center' }); return; }
    const rect = section.getBoundingClientRect();
    view.scrollTo({ top: view.scrollY + rect.top + (rect.height - view.innerHeight) * (index + .5) / cards.length, behavior: 'smooth' });
  }
  section.addEventListener('click', select);
  view.addEventListener('scroll', queue, { passive: true });
  view.addEventListener('resize', queue);
  compact.addEventListener('change', onMedia);
  paint();
  return () => {
    if (disposed) return;
    disposed = true;
    view.cancelAnimationFrame(frame);
    frame = 0;
    view.removeEventListener('scroll', queue);
    view.removeEventListener('resize', queue);
    compact.removeEventListener('change', onMedia);
    section.removeEventListener('click', select);
    reset();
  };
}
