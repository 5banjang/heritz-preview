export function createFlight(width, height, size, fromRight, random = Math.random) {
  const room = Math.max(0, height - size / 3 - 32);
  const upper = 16 + room * (.05 + random() * .3);
  const lower = 16 + room * (.6 + random() * .3);
  const descending = random() > .5;
  return {
    fromRight, size, duration: 10000 + random() * 4000,
    startX: fromRight ? width + 24 : -size - 24,
    endX: fromRight ? -size - 24 : width + 24,
    startY: descending ? upper : lower,
    endY: descending ? lower : upper,
  };
}

export function mountSnowfall(doc) {
  const view = doc.defaultView;
  if (!view?.requestAnimationFrame) return () => {};
  const preference = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  const snow = doc.createElement('div');
  snow.className = 'design-snowfall';
  snow.setAttribute('aria-hidden', 'true');
  const trail = Array.from({length: 36}, () => {
    const flake = doc.createElement('span');
    flake.className = 'design-snow-trail';
    flake.style.width = flake.style.height = `${2 + Math.random() * 3}px`;
    flake.hidden = true;
    snow.append(flake);
    return {element: flake, remaining: 0};
  });
  for (let index = 0; index < 28; index++) {
    const flake = doc.createElement('span');
    flake.className = 'design-snow-ambient';
    flake.style.cssText = `left:${Math.random() * 100}%;--snow-size:${2 + Math.random() * 4}px;--snow-duration:${12 + Math.random() * 12}s;--snow-delay:${-Math.random() * 24}s;--snow-drift:${Math.random() * 100 - 50}px`;
    snow.append(flake);
  }
  const sleigh = doc.createElement('img');
  sleigh.className = 'design-santa-sleigh';
  sleigh.src = new URL('../assets/effects/santa-sleigh.png', import.meta.url).href;
  sleigh.alt = '';
  sleigh.width = 2172;
  sleigh.height = 724;
  sleigh.decoding = 'async';
  sleigh.draggable = false;
  snow.append(sleigh);
  const toggle = doc.createElement('button');
  toggle.className = 'design-snow-toggle';
  toggle.type = 'button';
  toggle.textContent = '겨울 효과 끄기';
  let frame, lastTime, flight, elapsed = 0, emission = 0, nextFlake = 0, disposed = false;
  function startFlight(fromRight) {
    flight = createFlight(view.innerWidth, view.innerHeight, sleigh.clientWidth || 240, fromRight);
    elapsed = 0;
  }
  function tick(time) {
    const delta = lastTime == null ? 0 : Math.min(time - lastTime, 64);
    lastTime = time;
    elapsed += delta;
    if (!flight) startFlight(false);
    if (elapsed >= flight.duration) startFlight(!flight.fromRight);
    const progress = elapsed / flight.duration;
    const x = flight.startX + (flight.endX - flight.startX) * progress;
    const y = flight.startY + (flight.endY - flight.startY) * progress;
    sleigh.style.transform = `translate(${x}px, ${y}px) scaleX(${flight.fromRight ? -1 : 1})`;
    emission += delta;
    if (emission >= 100 && x + flight.size > 0 && x < view.innerWidth) {
      emission = 0;
      const flake = trail[nextFlake++ % trail.length];
      Object.assign(flake, {x: x + flight.size * (flight.fromRight ? .9 : .1), y: y + flight.size / 4,
        remaining: 2800, drift: Math.random() * 24 - 12});
    }
    for (const flake of trail) {
      flake.remaining = Math.max(0, flake.remaining - delta);
      flake.element.hidden = flake.remaining === 0;
      if (!flake.remaining) continue;
      flake.x += flake.drift * delta / 1000;
      flake.y += 60 * delta / 1000;
      flake.element.style.transform = `translate(${flake.x}px, ${flake.y}px)`;
      flake.element.style.opacity = String(.8 * flake.remaining / 2800);
    }
    frame = view.requestAnimationFrame(tick);
  }
  function syncPlayback() {
    view.cancelAnimationFrame(frame);
    lastTime = null;
    const paused = disposed || snow.hidden || doc.hidden || Boolean(preference?.matches);
    snow.setAttribute('data-paused', String(paused));
    if (!paused) frame = view.requestAnimationFrame(tick);
  }
  const onResize = () => { flight = undefined; };
  const onClick = () => {
    snow.hidden = !snow.hidden;
    toggle.textContent = snow.hidden ? '겨울 효과 켜기' : '겨울 효과 끄기';
    syncPlayback();
  };
  toggle.addEventListener('click', onClick);
  doc.body.append(snow, toggle);
  doc.addEventListener('visibilitychange', syncPlayback);
  preference?.addEventListener?.('change', syncPlayback);
  view.addEventListener('resize', onResize);
  syncPlayback();
  return () => {
    disposed = true;
    view.cancelAnimationFrame(frame);
    doc.removeEventListener('visibilitychange', syncPlayback);
    preference?.removeEventListener?.('change', syncPlayback);
    view.removeEventListener('resize', onResize);
    toggle.removeEventListener('click', onClick);
    snow.remove();
    toggle.remove();
  };
}
