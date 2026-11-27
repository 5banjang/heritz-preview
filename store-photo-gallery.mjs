const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function renderSpacePhotos(photos, sitePath) {
  return `<div class="store-space-viewer" tabindex="0" aria-label="매장 공간 사진, 좌우 방향키로 이동">
    <div class="store-space-stage" id="store-space-stage">${photos.map((photo, i) => `<img class="store-space-image" ${i ? 'data-src' : 'src'}="${escape(sitePath(photo.src))}" alt="${escape(photo.label)}"${photo.width && photo.height ? ` width="${Number(photo.width)}" height="${Number(photo.height)}"` : ''} decoding="async"${i ? ' hidden' : ''}>`).join('')}<span class="store-space-count" aria-live="polite" aria-atomic="true">1/${photos.length}</span></div>
    <div class="store-space-controls"><button type="button" data-space-prev aria-label="이전 매장 사진" aria-controls="store-space-stage" disabled>‹</button><div class="store-space-thumbnails">${photos.map((photo, i) => `<button type="button" data-space-index="${i}" aria-label="${escape(photo.label)} 보기" aria-controls="store-space-stage" aria-pressed="${i === 0}"><img src="${escape(sitePath(photo.thumbnail || photo.src))}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div><button type="button" data-space-next aria-label="다음 매장 사진" aria-controls="store-space-stage"${photos.length < 2 ? ' disabled' : ''}>›</button></div>
  </div>`;
}

export function renderStorePhotoGallery(spacePhotos, rentalPhotos, sitePath, label = '매장 사진') {
  if (rentalPhotos === null) return `<section class="store-photo-gallery" aria-label="${escape(label)}"><div class="store-gallery-heading"><p>매장 공간</p><span>${spacePhotos.length} PHOTOS</span></div>${spacePhotos.length ? renderSpacePhotos(spacePhotos, sitePath) : '<p class="store-gallery-empty">매장 공간 사진을 준비하고 있습니다.</p>'}</section>`;
  const groups = [['space', '매장 공간', spacePhotos], ['rental', '대여복', rentalPhotos]];
  return `<section class="store-photo-gallery" aria-label="${escape(label)}">
    <div class="store-gallery-tabs" role="tablist" aria-label="사진 종류">${groups.map(([id, label], i) => `<button type="button" role="tab" id="store-gallery-tab-${id}" aria-controls="store-gallery-panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join('')}</div>
    ${groups.map(([id, label, photos], i) => `<div role="tabpanel" id="store-gallery-panel-${id}" aria-labelledby="store-gallery-tab-${id}" tabindex="0"${i ? ' hidden' : ''}>
      <div class="store-gallery-heading"><p>${label}</p><span>${photos.length} PHOTOS</span></div>
      ${id === 'rental' ? '<p class="store-gallery-notice">방문일 피팅·대여 가능 여부는 지점에 문의해 주세요.</p>' : ''}
      ${photos.length ? id === 'space' ? renderSpacePhotos(photos, sitePath) : `<div class="store-gallery-grid">${photos.map(photo => `<figure class="store-gallery-photo"><img src="${escape(sitePath(photo.thumbnail || photo.src))}"${photo.thumbnail && photo.thumbnailWidth && photo.width ? ` srcset="${escape(sitePath(photo.thumbnail))} ${photo.thumbnailWidth}w, ${escape(sitePath(photo.src))} ${photo.width}w" sizes="(max-width: 799px) calc((100vw - 60px) / 2), (max-width: 1455px) calc((88vw - 48px) / 3), 411px"` : ''}${photo.width && photo.height ? ` width="${Number(photo.width)}" height="${Number(photo.height)}"` : ''} alt="${escape(photo.label)}" loading="lazy" decoding="async"><figcaption>${escape(photo.label)}</figcaption></figure>`).join('')}</div>` : `<p class="store-gallery-empty">${label} 사진을 준비하고 있습니다.</p>`}
    </div>`).join('')}
  </section>`;
}

export function mountStorePhotoGallery(root = document) {
  const gallery = root.querySelector('.store-photo-gallery');
  if (!gallery) return;
  const tabs = [...gallery.querySelectorAll('[role="tab"]')];
  const panels = [...gallery.querySelectorAll('[role="tabpanel"]')];
  const disposers = [];
  function listen(node, type, handler) {
    node.addEventListener(type, handler);
    disposers.push(() => node.removeEventListener(type, handler));
  }
  function select(index) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
  }
  tabs.forEach((tab, i) => {
    listen(tab, 'click', () => select(i));
    listen(tab, 'keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(target);
      tabs[target].focus();
    });
  });
  const viewer = gallery.querySelector('.store-space-viewer');
  if (viewer) {
    const images = [...viewer.querySelectorAll('.store-space-image')];
    const thumbnails = [...viewer.querySelectorAll('[data-space-index]')];
    const previous = viewer.querySelector('[data-space-prev]');
    const next = viewer.querySelector('[data-space-next]');
    const count = viewer.querySelector('.store-space-count');
    let current = 0;
    function show(index) {
      current = Math.max(0, Math.min(images.length - 1, index));
      images.forEach((image, i) => {
        image.hidden = i !== current;
        if (i === current && image.dataset.src) {
          image.src = image.dataset.src;
          delete image.dataset.src;
        }
        thumbnails[i].setAttribute('aria-pressed', String(i === current));
      });
      count.textContent = `${current + 1}/${images.length}`;
      previous.disabled = current === 0;
      next.disabled = current === images.length - 1;
    }
    thumbnails.forEach((thumbnail, i) => listen(thumbnail, 'click', () => show(i)));
    listen(previous, 'click', () => show(current - 1));
    listen(next, 'click', () => show(current + 1));
    listen(viewer, 'keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      show(event.key === 'Home' ? 0 : event.key === 'End' ? images.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
      if (thumbnails.includes(event.target)) thumbnails[current].focus();
    });
    show(0);
  }
  select(0);
  return () => disposers.forEach(dispose => dispose());
}
