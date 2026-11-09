/** Progressive enhancement: content remains readable without animation support. */
export function mountScrollReveal(doc) {
  const view = doc.defaultView;
  const selector = '.design-hero-copy, .design-intro, .design-chapter-heading, .design-feature-root, .design-footer';
  const sections = [...doc.querySelectorAll(selector)];
  const preference = view?.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!view?.IntersectionObserver || preference?.matches ||
      !sections.every(section => typeof section.animate === 'function')) return () => {};

  const active = new Map();
  const pending = new Set(sections);
  let stopped = false;
  function finish(section) {
    for (const animation of active.get(section) ?? []) animation.cancel();
    active.delete(section);
  }
  const observer = new view.IntersectionObserver(entries => {
    if (stopped) return;
    for (const entry of entries) {
      if (!entry.isIntersecting || !pending.delete(entry.target)) continue;
      const section = entry.target;
      observer.unobserve(section);
      if (section.contains(doc.activeElement)) continue;
      const elements = section.matches('.design-feature-root') ? [section] : [...section.children];
      const animations = elements
        .map((element, index) => element.animate([
          { opacity: 0, transform: 'translateY(42px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 720, delay: index * 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
      active.set(section, animations);
      Promise.all(animations.map(animation => animation.finished.catch(() => {})))
        .then(() => { if (active.get(section) === animations) active.delete(section); });
    }
  // Observe headings and content separately, including content taller than the viewport.
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  const onFocus = event => {
    const section = event.target.closest?.(selector);
    if (!section || !sections.includes(section)) return;
    observer.unobserve(section);
    pending.delete(section);
    finish(section);
  };
  const stop = () => {
    stopped = true;
    pending.clear();
    observer.disconnect();
    for (const section of sections) finish(section);
    doc.removeEventListener('focusin', onFocus);
    preference?.removeEventListener?.('change', onPreference);
  };
  const onPreference = event => { if (event.matches) stop(); };
  sections.forEach(section => observer.observe(section));
  doc.addEventListener('focusin', onFocus);
  preference?.addEventListener?.('change', onPreference);
  return stop;
}
