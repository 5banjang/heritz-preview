(() => {
  const section = document.querySelector('#moments');
  const track = section.querySelector('.moment-grid');
  const slides = [...track.querySelectorAll('figure')];
  const toggle = section.querySelector('[data-moments-toggle]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches;
  let visible = false;
  let timer;
  track.classList.add('is-slideshow');
  section.querySelector('.hero-controls').hidden = false;

  function advance(step) {
    const stride = slides[1].offsetLeft - slides[0].offsetLeft;
    const last = Math.round((track.scrollWidth - track.clientWidth) / stride);
    const next = Math.round(track.scrollLeft / stride) + step;
    const index = next > last ? 0 : next < 0 ? last : next;
    track.scrollTo({left: index * stride, behavior: motion.matches || index !== next ? 'instant' : 'smooth'});
  }

  function schedule() {
    clearInterval(timer);
    toggle.textContent = paused ? '자동 재생' : '일시정지';
    if (visible && !paused && !document.hidden && !section.matches(':hover, :focus-within') && !document.querySelector('dialog[open]')) {
      timer = setInterval(() => {
        if (!document.querySelector('dialog[open]')) advance(1);
      }, 3000);
    }
  }
  toggle.addEventListener('click', () => { paused = !paused; schedule(); });
  section.querySelectorAll('[data-moments-step]').forEach(button => {
    button.addEventListener('click', () => { advance(Number(button.dataset.momentsStep)); schedule(); });
  });
  for (const event of ['mouseenter', 'mouseleave', 'focusin', 'focusout']) {
    section.addEventListener(event, () => setTimeout(schedule, 0));
  }
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, {threshold: 0.2}).observe(track);
  schedule();
})();
