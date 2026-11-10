export function mountRentalDrag(doc = document) {
  const section = doc.querySelector('#rental');
  const grid = section?.querySelector('.rental-grid');
  const view = doc.defaultView;
  if (!grid || !view) return () => {};

  const buttons = [...section.querySelectorAll('[data-rental-direction]')];
  const originalDisabled = buttons.map(button => button.disabled);
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  let gesture = null, suppressClick = false, frame = 0, disposed = false;

  function update() {
    frame = 0;
    if (disposed) return;
    const end = Math.max(0, grid.scrollWidth - grid.clientWidth);
    buttons.forEach(button => {
      button.disabled = Number(button.dataset.rentalDirection) < 0
        ? grid.scrollLeft <= 1 : grid.scrollLeft >= end - 1;
    });
  }
  function queue() {
    if (!disposed && !frame) frame = view.requestAnimationFrame(update);
  }
  function advance(direction) {
    const card = grid.querySelector('figure');
    if (!card) return;
    const gap = Number.parseFloat(view.getComputedStyle(grid).columnGap) || 0;
    grid.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  function finish() {
    const pointerId = gesture?.id;
    gesture = null;
    grid.classList.remove('rental-dragging');
    if (pointerId !== undefined && grid.hasPointerCapture?.(pointerId)) grid.releasePointerCapture(pointerId);
    queue();
  }
  function down(event) {
    suppressClick = false;
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.isPrimary === false) return;
    finish();
    gesture = { id: event.pointerId, x: event.clientX, left: grid.scrollLeft, dragging: false };
  }
  function move(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const delta = event.clientX - gesture.x;
    if (!gesture.dragging && Math.abs(delta) <= 6) return;
    if (!gesture.dragging) {
      gesture.dragging = true;
      suppressClick = true;
      grid.classList.add('rental-dragging');
      grid.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    grid.scrollLeft = gesture.left - delta;
  }
  function end(event) {
    if (gesture?.id === event.pointerId) finish();
  }
  function click(event) {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }
  function key(event) {
    if (event.target !== grid || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    advance(event.key === 'ArrowLeft' ? -1 : 1);
  }
  function navigate(event) {
    const button = event.target.closest('[data-rental-direction]');
    if (!buttons.includes(button) || button.disabled) return;
    const direction = Number(button.dataset.rentalDirection);
    if (direction === -1 || direction === 1) advance(direction);
  }
  function preventNativeDrag(event) { event.preventDefault(); }

  grid.addEventListener('pointerdown', down);
  view.addEventListener('pointermove', move, { passive: false });
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);
  grid.addEventListener('lostpointercapture', end);
  grid.addEventListener('click', click, true);
  grid.addEventListener('keydown', key);
  grid.addEventListener('dragstart', preventNativeDrag);
  grid.addEventListener('scroll', queue, { passive: true });
  section.addEventListener('click', navigate);
  view.addEventListener('resize', queue);
  update();

  return () => {
    if (disposed) return;
    disposed = true;
    finish();
    view.cancelAnimationFrame(frame);
    grid.removeEventListener('pointerdown', down);
    view.removeEventListener('pointermove', move);
    view.removeEventListener('pointerup', end);
    view.removeEventListener('pointercancel', end);
    grid.removeEventListener('lostpointercapture', end);
    grid.removeEventListener('click', click, true);
    grid.removeEventListener('keydown', key);
    grid.removeEventListener('dragstart', preventNativeDrag);
    grid.removeEventListener('scroll', queue);
    section.removeEventListener('click', navigate);
    view.removeEventListener('resize', queue);
    buttons.forEach((button, index) => { button.disabled = originalDisabled[index]; });
  };
}
