(() => {
  const gallery = document.querySelector('.hero-photos');
  const figures = [...gallery.querySelectorAll('figure')];
  figures.forEach(figure => {
    const image = figure.querySelector('img');
    const frame = document.createElement('div');
    frame.className = 'hero-photo-frame';
    image.replaceWith(frame);
    frame.append(image);
  });
  const slides = [...document.querySelectorAll('.suit-grid figure')].map(figure => ({
    src: figure.querySelector('img').src,
    alt: figure.querySelector('img').alt.replace(' 상세 보기', ' 착용 화보'),
    title: figure.querySelector('strong').textContent
  }));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = gallery.querySelector('[data-hero-toggle]');
  let index = 0;
  let paused = motion.matches;
  let ready = false;
  let timer;

  function render(step) {
    const images = figures.map(figure => figure.querySelector('img'));
    images.forEach(image => {
      image.parentElement.querySelector('[aria-hidden]')?.remove();
      image.getAnimations().forEach(animation => animation.cancel());
    });
    const bounds = images.map(image => image.parentElement.getBoundingClientRect());
    const timing = { duration: 850, easing: 'cubic-bezier(.22,.61,.36,1)' };
    if (step && !motion.matches) {
      const outgoing = images[step > 0 ? 0 : 1];
      const previous = outgoing.cloneNode();
      previous.alt = '';
      previous.setAttribute('aria-hidden', 'true');
      outgoing.parentElement.append(previous);
      previous.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-step * 110}%)` }], timing).finished.then(() => previous.remove(), () => previous.remove());
    }
    index = (index + step + slides.length) % slides.length;
    figures.forEach((figure, offset) => {
      const position = (index + offset) % slides.length;
      const slide = slides[position];
      const image = images[offset];
      image.src = slide.src;
      image.alt = slide.alt;
      figure.querySelector('figcaption').textContent = `${String(position + 1).padStart(2, '0')} / ${slide.title.toUpperCase()}`;
      if (step && !motion.matches) {
        const from = bounds[1 - offset];
        const to = bounds[offset];
        const movingBetweenFrames = offset === (step > 0 ? 0 : 1);
        const transform = movingBetweenFrames
          ? `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`
          : `translateX(${step * 110}%)`;
        image.animate([{ transform }, { transform: 'translate(0, 0) scale(1)' }], timing);
      }
    });
  }

  function schedule() {
    clearInterval(timer);
    toggle.textContent = paused ? '자동 재생' : '일시정지';
    if (ready && !paused && !document.hidden && !gallery.matches(':hover, :focus-within')) {
      timer = setInterval(() => render(1), 3000);
    }
  }

  toggle.addEventListener('click', () => { paused = !paused; schedule(); });
  gallery.querySelectorAll('[data-hero-step]').forEach(button => {
    button.addEventListener('click', () => { if (ready) render(Number(button.dataset.heroStep)); schedule(); });
  });
  for (const event of ['mouseenter', 'mouseleave', 'focusin', 'focusout']) {
    gallery.addEventListener(event, () => setTimeout(schedule, 0));
  }
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; schedule(); });
  // Keep the original photos visible if any replacement image cannot load.
  Promise.all(slides.map(slide => {
    const image = new Image();
    image.src = slide.src;
    return image.decode();
  })).then(() => {
    ready = true;
    render(0);
    gallery.querySelector('.hero-controls').hidden = false;
    schedule();
  }).catch(() => {});
})();
