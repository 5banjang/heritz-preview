export function mountProcessScroll(doc = document) {
  const section = doc.querySelector('#experience');
  const viewport = section?.querySelector('.process-window');
  const tabs = section?.querySelector('.process-tabs');
  const view = doc.defaultView;
  const cards = [...(section?.querySelectorAll('.step-card') ?? [])];
  if (!view || !viewport || !tabs || !cards.length) return () => {};
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  const originalAttributes = ['tabindex', 'role', 'aria-label'].map(name => [name, viewport.getAttribute(name)]);
  const buttons = [...section.querySelectorAll('[data-process-step]')];
  const controls = doc.createElement('div');
  controls.className = 'process-controls';
  controls.innerHTML = '<button type="button" data-process-direction="-1" aria-label="이전 제작 과정">←</button><span aria-live="polite" aria-atomic="true"></span><button type="button" data-process-direction="1" aria-label="다음 제작 과정">→</button>';
  tabs.after(controls);
  const arrows = [...controls.querySelectorAll('button')];
  const counter = controls.querySelector('span');
  let frame = 0, disposed = false, active = -1, gesture = null, suppressClick = false;
  const clamp = index => Math.max(0, Math.min(cards.length - 1, index));
  section.classList.add('process-enhanced', 'process-swipe');
  viewport.setAttribute('tabindex', '0');
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', '제작 과정, 좌우로 넘겨 보기');
  function paint() {
    frame = 0;
    if (disposed) return;
    const index = clamp(Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth)));
    if (index === active) return;
    active = index;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.processStep) === index)));
    cards.forEach((card, i) => i === index ? card.setAttribute('data-current', 'true') : card.removeAttribute('data-current'));
    arrows[0].disabled = index === 0;
    arrows[1].disabled = index === cards.length - 1;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }
  function queue() { if (!disposed && !frame) frame = view.requestAnimationFrame(paint); }
  function moveTo(index, behavior = reduced.matches ? 'instant' : 'smooth') {
    viewport.scrollTo({ left: clamp(index) * viewport.clientWidth, behavior });
  }
  function resize() { moveTo(Math.max(0, active), 'instant'); queue(); }
  function key(event) {
    if (event.target !== viewport || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    moveTo(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : active + (event.key === 'ArrowLeft' ? -1 : 1));
  }
  function select(event) {
    const direction = event.target.closest('[data-process-direction]');
    if (arrows.includes(direction) && !direction.disabled) { moveTo(active + Number(direction.dataset.processDirection)); return; }
    const button = event.target.closest('[data-process-step]');
    if (buttons.includes(button)) moveTo(Number(button.dataset.processStep));
  }
  function finish(event) {
    if (!gesture || (event && event.pointerId !== gesture.id)) return;
    const previous = gesture;
    gesture = null;
    viewport.classList.remove('process-dragging');
    if (viewport.hasPointerCapture?.(previous.id)) viewport.releasePointerCapture(previous.id);
    if (previous.dragging && !disposed) moveTo(Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth)));
  }
  function down(event) {
    suppressClick = false;
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.isPrimary === false) return;
    finish();
    gesture = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft, dragging: false };
  }
  function move(event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const delta = event.clientX - gesture.x;
    if (!gesture.dragging && Math.abs(delta) <= 6) return;
    if (!gesture.dragging) {
      gesture.dragging = true;
      suppressClick = true;
      viewport.classList.add('process-dragging');
      viewport.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    viewport.scrollLeft = Math.max(0, Math.min((cards.length - 1) * viewport.clientWidth, gesture.left - delta));
    queue();
  }
  function click(event) {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }
  function preventDrag(event) { event.preventDefault(); }
  section.addEventListener('click', select);
  viewport.addEventListener('scroll', queue, { passive: true });
  viewport.addEventListener('keydown', key);
  viewport.addEventListener('pointerdown', down);
  viewport.addEventListener('lostpointercapture', finish);
  viewport.addEventListener('click', click, true);
  viewport.addEventListener('dragstart', preventDrag);
  view.addEventListener('pointermove', move, { passive: false });
  view.addEventListener('pointerup', finish);
  view.addEventListener('pointercancel', finish);
  view.addEventListener('resize', resize);
  paint();
  return () => {
    if (disposed) return;
    disposed = true;
    finish();
    view.cancelAnimationFrame(frame);
    section.removeEventListener('click', select);
    viewport.removeEventListener('scroll', queue);
    viewport.removeEventListener('keydown', key);
    viewport.removeEventListener('pointerdown', down);
    viewport.removeEventListener('lostpointercapture', finish);
    viewport.removeEventListener('click', click, true);
    viewport.removeEventListener('dragstart', preventDrag);
    view.removeEventListener('pointermove', move);
    view.removeEventListener('pointerup', finish);
    view.removeEventListener('pointercancel', finish);
    view.removeEventListener('resize', resize);
    controls.remove();
    section.classList.remove('process-enhanced', 'process-swipe');
    originalAttributes.forEach(([name, value]) => value === null ? viewport.removeAttribute(name) : viewport.setAttribute(name, value));
    cards.forEach(card => card.removeAttribute('data-current'));
    buttons.forEach(button => button.removeAttribute('aria-pressed'));
    viewport.scrollLeft = 0;
  };
}
