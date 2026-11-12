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
  const mobile = view.matchMedia('(max-width: 799px)');
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  const viewport = section.querySelector('.process-window');
  if (!viewport) return () => {};
  const viewportAttributes = ['tabindex', 'role', 'aria-label'].map(name => [name, viewport.getAttribute(name)]);
  const buttons = [...section.querySelectorAll('[data-process-step]')];
  let frame = 0, disposed = false, active = -1;
  function reset() {
    active = -1;
    section.classList.remove('process-enhanced', 'process-swipe');
    section.style.removeProperty('--process-index');
    viewportAttributes.forEach(([name, value]) => value === null ? viewport.removeAttribute(name) : viewport.setAttribute(name, value));
    cards.forEach(card => { card.removeAttribute('data-current'); card.removeAttribute('aria-hidden'); card.inert = false; });
    buttons.forEach(button => button.removeAttribute('aria-pressed'));
  }
  function paint() {
    frame = 0;
    if (disposed) return;
    if (compact.matches && !mobile.matches) { if (active !== -1) reset(); return; }
    if (active === -1) {
      section.classList.add('process-enhanced');
      if (mobile.matches) {
        section.classList.add('process-swipe');
        viewport.setAttribute('tabindex', '0');
        viewport.setAttribute('role', 'region');
        viewport.setAttribute('aria-label', '제작 과정, 좌우로 넘겨 보기');
      }
    }
    const rect = mobile.matches ? null : section.getBoundingClientRect();
    const index = mobile.matches
      ? Math.max(0, Math.min(cards.length - 1, Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth))))
      : processStep(rect.top, rect.height, view.innerHeight, cards.length);
    if (index === active) return;
    active = index;
    section.style.setProperty('--process-index', index);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.processStep) === index)));
    cards.forEach((card, i) => {
      card.inert = !mobile.matches && i !== index;
      if (mobile.matches) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', String(i !== index));
      if (i === index) card.setAttribute('data-current', 'true');
      else card.removeAttribute('data-current');
    });
  }
  function queue() { if (!disposed && !frame) frame = view.requestAnimationFrame(paint); }
  function onPageScroll() { if (!mobile.matches) queue(); }
  function onMedia() { view.cancelAnimationFrame(frame); reset(); viewport.scrollLeft = 0; paint(); }
  function moveTo(index, behavior = reduced.matches ? 'instant' : 'smooth') {
    viewport.scrollTo({ left: Math.max(0, Math.min(cards.length - 1, index)) * viewport.clientWidth, behavior });
  }
  function resize() {
    if (mobile.matches && active >= 0) moveTo(active, 'instant');
    queue();
  }
  function key(event) {
    if (!mobile.matches || event.target !== viewport || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    moveTo(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : active + (event.key === 'ArrowLeft' ? -1 : 1));
  }
  function select(event) {
    const button = event.target.closest('[data-process-step]');
    const index = button ? Number(button.dataset.processStep) : cards.indexOf(event.target.closest('.step-card'));
    if (!Number.isInteger(index) || index < 0 || index >= cards.length) return;
    if (mobile.matches) { moveTo(index); return; }
    if (compact.matches) { cards[index].scrollIntoView({ behavior: 'instant', block: 'center' }); return; }
    const rect = section.getBoundingClientRect();
    view.scrollTo({ top: view.scrollY + rect.top + (rect.height - view.innerHeight) * (index + .5) / cards.length, behavior: 'smooth' });
  }
  section.addEventListener('click', select);
  viewport.addEventListener('scroll', queue, { passive: true });
  viewport.addEventListener('keydown', key);
  view.addEventListener('scroll', onPageScroll, { passive: true });
  view.addEventListener('resize', resize);
  compact.addEventListener('change', onMedia);
  mobile.addEventListener('change', onMedia);
  paint();
  return () => {
    if (disposed) return;
    disposed = true;
    view.cancelAnimationFrame(frame);
    frame = 0;
    view.removeEventListener('scroll', onPageScroll);
    view.removeEventListener('resize', resize);
    compact.removeEventListener('change', onMedia);
    mobile.removeEventListener('change', onMedia);
    viewport.removeEventListener('scroll', queue);
    viewport.removeEventListener('keydown', key);
    section.removeEventListener('click', select);
    reset();
    viewport.scrollLeft = 0;
  };
}
