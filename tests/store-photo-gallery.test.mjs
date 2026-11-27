import test from 'node:test';
import assert from 'node:assert/strict';
import {renderStorePhotoGallery, mountStorePhotoGallery} from '../store-photo-gallery.mjs';

test('render separates categories, escapes labels and serves responsive static photos without enlargement', () => {
  const html = renderStorePhotoGallery([{src:'space.webp', thumbnail:'small.webp', label:'A & "B"', width:1600, height:1200, thumbnailWidth:800}, {src:'space2.webp', label:'두 번째'}], [{src:'suit.webp', thumbnail:'suit-small.webp', label:'수트', width:1600, height:2400, thumbnailWidth:800}], path => '/site/' + path);
  assert.match(html, /id="store-gallery-tab-space"[^>]*aria-selected="true"/);
  assert.match(html, /id="store-gallery-panel-rental"[^>]* hidden/);
  assert.match(html, /<img src="\/site\/small.webp"[^>]*loading="lazy"/);
  assert.match(html, /srcset="\/site\/suit-small.webp 800w, \/site\/suit.webp 1600w"/);
  assert.match(html, /width="1600" height="1200"/);
  assert.match(html, /A &amp; &quot;B&quot;/);
  assert.doesNotMatch(html, /<dialog|aria-haspopup|data-gallery-src/);
  assert.equal((html.match(/<button/g) || []).length, 6);
  assert.match(html, /class="store-space-image" src="\/site\/space.webp"/);
  assert.match(html, /class="store-space-image" data-src="\/site\/space2.webp"[^>]* hidden/);
  assert.match(html, />1\/2<\/span>/);
  const space = html.slice(html.indexOf('<div role="tabpanel"'), html.indexOf('<div role="tabpanel" id="store-gallery-panel-rental"'));
  assert.doesNotMatch(space, /<figcaption/);
  assert.match(html, /<figcaption>수트<\/figcaption>/);
  assert.match(html, /방문일 피팅·대여 가능 여부는 지점에 문의해 주세요\./);
  const empty = renderStorePhotoGallery([], [], path => path);
  assert.match(empty, /대여복 사진을 준비하고 있습니다/);
  assert.match(empty, /매장 공간 사진을 준비하고 있습니다/);
});

test('space-only gallery has no rental category or orphan tab semantics', () => {
  const html = renderStorePhotoGallery([{src:'space.jpg', thumbnail:'small.jpg', label:'수원 접수 공간'}], null, path => path, '수원점 사진');
  assert.match(html, /aria-label="수원점 사진"/);
  assert.match(html, /class="store-space-image" src="space.jpg"/);
  assert.doesNotMatch(html, /role="tab|aria-labelledby="store-gallery-tab|대여복|<figcaption/);
  assert.match(renderStorePhotoGallery([], null, path => path), /매장 공간 사진을 준비하고 있습니다/);
});

function fixture(withViewer = false, spaceOnly = false) {
  const node = () => ({
    events:new Map(), attrs:{},
    addEventListener(type, fn) { this.events.set(type, fn); },
    removeEventListener(type, fn) { if (this.events.get(type) === fn) this.events.delete(type); },
    emit(type, event = {}) { this.events.get(type)?.(event); },
    setAttribute(name, value) { this.attrs[name] = value; },
    focus() { this.focused = true; },
  });
  const tabs = spaceOnly ? [] : [node(), node()];
  const panels = spaceOnly ? [] : [{}, {}];
  const images = Array.from({length:3}, (_, i) => ({dataset:i ? {src:`space-${i}.webp`} : {}, src:i ? '' : 'space-0.webp'}));
  const thumbnails = [node(), node(), node()];
  const previous = node(), next = node(), count = {};
  const viewer = Object.assign(node(), {
    querySelectorAll:selector => selector === '.store-space-image' ? images : thumbnails,
    querySelector:selector => ({'[data-space-prev]':previous, '[data-space-next]':next, '.store-space-count':count})[selector],
  });
  const gallery = {querySelectorAll:selector => selector === '[role="tab"]' ? tabs : panels, querySelector:() => withViewer ? viewer : null};
  const cleanup = mountStorePhotoGallery({querySelector:() => gallery});
  const key = (element, key) => element.emit('keydown', {key, preventDefault() {}});
  return {tabs, panels, cleanup, key, images, thumbnails, previous, next, count, viewer};
}

test('tabs default to space, switch panels, support keyboard focus and remove listeners', () => {
  const f = fixture();
  assert.equal(f.panels[0].hidden, false);
  assert.equal(f.panels[1].hidden, true);
  f.tabs[1].emit('click');
  assert.equal(f.tabs[1].attrs['aria-selected'], 'true');
  assert.equal(f.tabs[0].tabIndex, -1);
  assert.equal(f.panels[0].hidden, true);
  f.key(f.tabs[1], 'ArrowRight');
  assert.equal(f.tabs[0].focused, true);
  assert.equal(f.panels[0].hidden, false);
  f.key(f.tabs[0], 'ArrowLeft');
  assert.equal(f.panels[1].hidden, false);
  f.key(f.tabs[1], 'Home');
  assert.equal(f.panels[0].hidden, false);
  f.key(f.tabs[0], 'End');
  assert.equal(f.panels[1].hidden, false);
  f.key(f.tabs[1], 'Tab');
  assert.equal(f.panels[1].hidden, false);
  f.cleanup();
  f.cleanup();
  assert.ok(f.tabs.every(tab => tab.events.size === 0));
  const remounted = fixture();
  assert.equal(remounted.panels[0].hidden, false);
  remounted.cleanup();
  assert.doesNotThrow(() => mountStorePhotoGallery({querySelector:() => null}));
});

test('space viewer uses original images, thumbnails and bounded navigation without resetting on tab changes', () => {
  const f = fixture(true);
  assert.equal(f.count.textContent, '1/3');
  assert.equal(f.previous.disabled, true);
  assert.deepEqual(f.images.map(image => image.hidden), [false, true, true]);
  assert.equal(f.images[1].src, '');
  f.next.emit('click');
  assert.equal(f.images[1].src, 'space-1.webp');
  assert.equal(f.images[1].dataset.src, undefined);
  assert.equal(f.count.textContent, '2/3');
  f.tabs[1].emit('click');
  f.tabs[0].emit('click');
  assert.equal(f.count.textContent, '2/3');
  f.thumbnails[2].emit('click');
  assert.equal(f.next.disabled, true);
  assert.equal(f.thumbnails[2].attrs['aria-pressed'], 'true');
  f.key(f.viewer, 'ArrowRight');
  assert.equal(f.count.textContent, '3/3');
  f.key(f.viewer, 'Home');
  assert.equal(f.count.textContent, '1/3');
  f.key(f.viewer, 'ArrowLeft');
  assert.equal(f.count.textContent, '1/3');
  f.viewer.emit('keydown', {key:'End', target:f.thumbnails[0], preventDefault() {}});
  assert.equal(f.count.textContent, '3/3');
  assert.equal(f.thumbnails[2].focused, true);
  f.previous.emit('click');
  assert.equal(f.count.textContent, '2/3');
  f.cleanup();
  assert.ok([...f.tabs, ...f.thumbnails, f.previous, f.next, f.viewer].every(node => node.events.size === 0));
});

test('space-only viewer mounts and navigates without category tabs', () => {
  const f = fixture(true, true);
  assert.equal(f.count.textContent, '1/3');
  f.next.emit('click');
  assert.equal(f.count.textContent, '2/3');
  f.thumbnails[2].emit('click');
  assert.equal(f.images[2].src, 'space-2.webp');
  assert.equal(f.count.textContent, '3/3');
  f.cleanup();
  assert.ok([...f.thumbnails, f.previous, f.next, f.viewer].every(node => node.events.size === 0));
});
