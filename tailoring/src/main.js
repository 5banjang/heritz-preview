import { mountScrollReveal } from './scroll-reveal.mjs';
import { mountSnowfall } from './snowfall.mjs';

const features = ['measurement', 'configurator', 'pattern', 'sewing', 'visit'];
const cleanups = [];
let disposed = false;

// Each chapter stays readable when another feature cannot load.
export async function mountFeature(name) {
  const root = document.getElementById(name);
  if (!root) return;
  try {
    const feature = await import(`./features/${name}/index.mjs`);
    if (disposed) return;
    root.replaceChildren();
    const cleanup = await feature.mount(root, {});
    if (typeof cleanup !== 'function') throw new TypeError(`${name}.mount must return cleanup`);
    if (disposed) cleanup();
    else cleanups.push(cleanup);
    root.dataset.state = 'ready';
  } catch (error) {
    if (disposed) return;
    root.dataset.state = 'unavailable';
    const notice = document.createElement('p');
    notice.className = 'design-unavailable';
    notice.setAttribute('role', 'status');
    notice.textContent = '이 체험을 불러오지 못했습니다. 페이지를 새로고침해 주세요. 계속 표시되면 콘텐츠 준비 상태를 확인해 주세요.';
    root.replaceChildren(notice);
    console.error(`HERITZ: ${name} unavailable`, error);
  }
}

export function cleanup() {
  disposed = true;
  for (const dispose of cleanups.splice(0)) {
    try { dispose(); } catch (error) { console.error('HERITZ: cleanup failed', error); }
  }
}

export const ready = Promise.all(features.map(mountFeature)).then(results => {
  if (!disposed) cleanups.push(mountScrollReveal(document), mountSnowfall(document));
  return results;
});
window.addEventListener('pagehide', event => {
  if (!event.persisted) cleanup();
});
