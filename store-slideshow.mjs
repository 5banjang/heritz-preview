export function mountStoreSlideshow(root = document) {
  const track = root.querySelector('.store-track');
  if (!track) return;
  const previous = root.querySelector('[data-store-prev]');
  const next = root.querySelector('[data-store-next]');
  const count = root.querySelector('[data-store-count]');
  const total = track.children.length;
  const index = () => Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / (track.clientWidth || 1))));
  const update = () => {
    const current = index();
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    previous.disabled = current === 0;
    next.disabled = current === total - 1;
  };
  const move = target => track.scrollTo({
    left: Math.max(0, Math.min(total - 1, target)) * track.clientWidth,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  });
  const back = () => move(index() - 1);
  const forward = () => move(index() + 1);
  const keydown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'Home' ? 0 : event.key === 'End' ? total - 1 : index() + (event.key === 'ArrowLeft' ? -1 : 1));
  };
  previous.addEventListener('click', back);
  next.addEventListener('click', forward);
  track.addEventListener('keydown', keydown);
  track.addEventListener('scroll', update, {passive: true});
  window.addEventListener('resize', update);
  update();
  return () => {
    previous.removeEventListener('click', back);
    next.removeEventListener('click', forward);
    track.removeEventListener('keydown', keydown);
    track.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}
