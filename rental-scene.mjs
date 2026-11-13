export function rentalIndex(left, stride, count) {
  return Math.max(0, Math.min(count - 1, Math.round(left / Math.max(1, stride))));
}
export function mountRentalScene(doc = document) {
  const section = doc.querySelector('#rental');
  const layers = [...(section?.querySelectorAll('.rental-backdrop') || [])];
  if (!layers.length) return () => {};
  const grid = section.querySelector('.rental-grid');
  const cards = [...grid.querySelectorAll('[data-rental-select]')];
  const view = doc.defaultView;
  let active = -1, frame = 0;
  const stride = () => grid.querySelector('figure').getBoundingClientRect().width + (parseFloat(view.getComputedStyle(grid).columnGap) || 0);
  function update() {
    frame = 0;
    const index = rentalIndex(grid.scrollLeft, stride(), cards.length);
    if (active === index) return;
    active = index;
    layers.forEach((layer, i) => layer.classList.toggle('is-active', i === index));
    cards.forEach((card, i) => card.setAttribute('aria-pressed', String(i === index)));
    section.querySelector('#rental-title').textContent = cards[index].dataset.label;
    section.querySelector('.rental-name').textContent = cards[index].dataset.name;
    section.querySelector('.rental-count').innerHTML = `${String(index + 1).padStart(2, '0')} <small>/ ${String(cards.length).padStart(2, '0')}</small>`;
    section.querySelector('.rental-progress span').style.width = `${(index + 1) / cards.length * 100}%`;
  }
  function queue() { if (!frame) frame = view.requestAnimationFrame(update); }
  function select(event) {
    const card = event.target.closest('[data-rental-select]');
    if (!cards.includes(card)) return;
    grid.scrollTo({left: Number(card.dataset.rentalSelect) * stride(), behavior: view.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  grid.addEventListener('scroll', queue, {passive:true});
  grid.addEventListener('click', select);
  view.addEventListener('resize', queue);
  update();
  return () => {
    view.cancelAnimationFrame(frame);
    grid.removeEventListener('scroll', queue);
    grid.removeEventListener('click', select);
    view.removeEventListener('resize', queue);
  };
}
