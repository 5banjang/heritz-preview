// Progressive enhancement: content stays readable when motion is unavailable.
export function mountHomeReveal(doc = document) {
  const view = doc.defaultView;
  const root = doc.querySelector('.home-main, .about-main');
  const preference = view?.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!root || !view?.IntersectionObserver || preference?.matches) return () => {};
  const selector = '.tailoring-entry-copy, .fabric-copy, .hero-content, .editorial-heading, .section-bottom, .rental-backdrops, .rental-copy, .rental-topline, .rental-grid, .experience:not(.process-enhanced) .step-card, .store-grid article, .booking, .moments-viewport, .moments:not(.moments-cinema) .moment-grid > .photo-link, .process-stage > .editorial-link, .about-opening, .about-story figure, .about-prose, .about-section-heading, .about-profile, .about-history-heading, .about-history li, .about-bi-heading, .about-logo, .about-bi-usage';
  const groups = [...root.querySelectorAll(selector)];
  const targets = new Map(groups.map(group => [group,
    group.matches('.hero-content')
      ? ['.hero-eyebrow', 'h1', '.hero-description', '.hero-links'].map(selector => group.querySelector(selector)).filter(Boolean)
      : group.matches('.about-opening') ? [...group.children].filter(element => !element.matches('.about-cover'))
      : group.matches('.rental-backdrops, .rental-grid, .moments-viewport, .photo-link, .process-stage > .editorial-link, .about-story figure') ? [group] : [...group.children],
  ]));
  const elements = [...targets.values()].flat();
  if (!elements.every(element => typeof element.animate === 'function')) return () => {};
  const original = new Map(elements.map(element => [element, [element.style.getPropertyValue('opacity'), element.style.getPropertyPriority('opacity')]]));
  const active = new Map();
  const pending = new Set(groups);
  let stopped = false;
  const restore = element => {
    const [value, priority] = original.get(element);
    if (value) element.style.setProperty('opacity', value, priority);
    else element.style.removeProperty('opacity');
  };
  function finish(group) {
    for (const animation of active.get(group) ?? []) animation.cancel();
    active.delete(group);
    targets.get(group).forEach(restore);
  }
  const observer = new view.IntersectionObserver(entries => {
    if (stopped) return;
    for (const { target: group, isIntersecting } of entries) {
      if (!isIntersecting || !pending.delete(group)) continue;
      observer.unobserve(group);
      targets.get(group).forEach(restore);
      if (group.contains(doc.activeElement)) continue;
      const animations = targets.get(group).map((element, index) => element.animate([
        { opacity: 0, transform: element.matches?.('.rental-backdrops') ? 'none' : 'translateY(42px)' },
        { opacity: 1, transform: element.matches?.('.rental-backdrops') ? 'none' : 'translateY(0)' },
      ], { duration: 800, delay: 500 + index * 180, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
      active.set(group, animations);
      Promise.all(animations.map(animation => animation.finished.catch(() => {})))
        .then(() => { if (active.get(group) === animations) active.delete(group); });
    }
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  function onFocus(event) {
    for (const group of groups) {
      if (!group.contains(event.target)) continue;
      pending.delete(group);
      observer.unobserve(group);
      finish(group);
    }
  }
  function stop() {
    if (stopped) return;
    stopped = true;
    observer.disconnect();
    pending.clear();
    groups.forEach(finish);
    doc.removeEventListener('focusin', onFocus);
    preference?.removeEventListener?.('change', onPreference);
  }
  const onPreference = event => { if (event.matches) stop(); };
  // Opacity keeps pending links keyboard-focusable, unlike visibility:hidden.
  elements.forEach(element => element.style.setProperty('opacity', '0'));
  groups.forEach(group => observer.observe(group));
  doc.addEventListener('focusin', onFocus);
  preference?.addEventListener?.('change', onPreference);
  return stop;
}
