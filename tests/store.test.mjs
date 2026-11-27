import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {renderStorePhotoGallery} from '../store-photo-gallery.mjs';
import {HAPJEONG_RENTALS} from '../hapjeong-rentals.mjs';
import {ILSAN_RENTALS} from '../ilsan-rentals.mjs';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('app.js', root), 'utf8');
const prefix = source.slice(0, source.indexOf('const SEO_METADATA')).replace(/^import .*;\r?\n/gm, '');
function evaluate(expression, staticPage = false) {
  const code = staticPage ? prefix.replace(/const BASE_PATH =[^;]+;/, "const BASE_PATH = '../';") : prefix;
  return runInNewContext(code + '\n' + expression, {
    renderStorePhotoGallery, HAPJEONG_RENTALS, ILSAN_RENTALS,
    document: {querySelector: () => null},
    location: {hostname: 'localhost', pathname: '/store/', hash: ''},
  });
}

test('all five store branches retain contact details and selected navigation', () => {
  for (const [slug, name] of evaluate('STORE_NAMES')) {
    const html = evaluate(`storePage('${slug}')`);
    assert.match(html, new RegExp(`<main[^>]*class="store-editorial"[^>]*data-store="${slug}"`));
    assert.match(html, /site-header dark/);
    assert.match(html, /editorial-footer/);
    assert.equal((html.match(/href="#\/store\//g) || []).length, 5);
    assert.match(html, new RegExp(`href="#/store/${slug}"[^>]*aria-current="page"`));
    assert.ok(html.includes(name));
    for (const [key, value] of evaluate(`STORE_INFO['${slug}']`)) {
      if (key === '기타 안내') continue;
      for (const line of value.split('|')) assert.ok(html.includes(line.replaceAll('&', '&amp;')), `${slug}: ${line}`);
    }
  }
  assert.match(evaluate("storePage('suwon')"), /https:\/\/www\.instagram\.com\/heritztailor_suwon/);
});

test('Cheongdam and rental center show seven space photos and thumbnails without rental tabs', () => {
  for (const slug of ['cheongdam', 'rental-center']) {
    const html = evaluate(`storePage('${slug}')`);
    assert.equal((html.match(/class="store-space-image"/g) || []).length, 7);
    assert.equal((html.match(/data-space-index=/g) || []).length, 7);
    assert.match(html, /class="store-space-viewer"[^>]*tabindex="0"/);
    assert.match(html, /data-space-prev/);
    assert.match(html, /data-space-next/);
    assert.match(html, /class="store-space-count"[^>]*>1\/7/);
    assert.doesNotMatch(html, /store-gallery-tabs|role="tabpanel"|store-slideshow|<figcaption/);
    for (let number = 1; number <= 7; number++) {
      const path = `assets/store/${slug}/${number}.webp`;
      assert.ok(html.includes(path), path);
      assert.ok(existsSync(new URL(path, root)), path);
      const thumbnail = path.replace('.webp', '-720.webp');
      assert.ok(html.includes(thumbnail), thumbnail);
      assert.ok(existsSync(new URL(thumbnail, root)), thumbnail);
    }
  }
});

test('all five stores mount the new gallery while lookbook retains its slideshow', () => {
  for (const [slug] of evaluate('STORE_NAMES')) {
    const html = evaluate(`storePage('${slug}')`);
    assert.match(html, /class="store-photo-gallery"/);
    assert.doesNotMatch(html, /class="store-slideshow"/);
  }
  assert.match(source, /route\.page === 'store' \? mountStorePhotoGallery\(\) : route\.page === 'archive' && route\.selection === 'lookbook' \? mountStoreSlideshow\(\)/);
});

test('unknown branches fall back to the Cheongdam content and theme', () => {
  const html = evaluate("storePage('unknown')");
  assert.equal(html, evaluate("storePage('cheongdam')"));
  assert.match(html, /data-store="cheongdam"/);
});

test('Hapjeong separates five space photos and eighteen supplied rental photos without enlargement', () => {
  const html = evaluate("storePage('hapjeong')");
  const space = html.slice(html.indexOf('id="store-gallery-panel-space"'), html.indexOf('id="store-gallery-panel-rental"'));
  for (let i = 1; i <= 5; i++) {
    assert.ok(space.includes(`/assets/store/hapjeong/${i}.webp`));
    assert.ok(space.includes(`/assets/store/hapjeong/${i}-720.webp`));
  }
  assert.doesNotMatch(space, /<figcaption/);
  const rental = html.slice(html.indexOf('id="store-gallery-panel-rental"'));
  assert.equal((rental.match(/class="store-gallery-photo"/g) || []).length, 18);
  assert.equal(HAPJEONG_RENTALS.length, 18);
  for (const photo of HAPJEONG_RENTALS) {
    assert.ok(html.includes(photo.label));
    assert.ok(existsSync(new URL(photo.src, root)));
    assert.ok(existsSync(new URL(photo.thumbnail, root)));
    assert.ok(photo.width > photo.thumbnailWidth);
    assert.ok(html.includes(`${photo.src} ${photo.width}w`));
  }
  assert.match(html, /role="tab"[^>]*id="store-gallery-tab-space"[^>]*aria-selected="true"/);
  assert.match(html, /id="store-gallery-panel-rental"[^>]* hidden/);
  assert.match(html, /방문일 피팅·대여 가능 여부는 지점에 문의/);
  assert.doesNotMatch(html, /store-slideshow|data-store-prev|data-gallery-open/);
  assert.doesNotMatch(html, /store-empty|공간 사진을 준비|피그마|Figma|입력해 주세요/);
  assert.match(html, /02-336-5662/);
  assert.match(html, /서울 마포구 월드컵로8길 23 1, 2층/);
});

test('Ilsan uses its own four space images and fifteen rental photos without crossing branch data', () => {
  const html = evaluate("storePage('ilsan')");
  const space = html.slice(html.indexOf('id="store-gallery-panel-space"'), html.indexOf('id="store-gallery-panel-rental"'));
  assert.match(html, /class="store-photo-gallery" aria-label="일산점 사진"/);
  assert.equal((space.match(/class="store-space-image"/g) || []).length, 4);
  assert.equal((space.match(/data-space-index=/g) || []).length, 4);
  assert.match(space, /class="store-space-count"[^>]*>1\/4/);
  for (let i = 1; i <= 4; i++) {
    assert.ok(space.includes(`/assets/store/ilsan/${i}.webp`));
    assert.ok(space.includes(`/assets/store/ilsan/${i}-720.webp`));
  }
  assert.match(space, /data-src="\/assets\/store\/ilsan\/2.webp"/);
  assert.doesNotMatch(space, /<figcaption|assets\/store\/ilsan\/[567]\.webp/);
  const rental = html.slice(html.indexOf('id="store-gallery-panel-rental"'));
  assert.equal((rental.match(/class="store-gallery-photo"/g) || []).length, 15);
  assert.equal(ILSAN_RENTALS.length, 15);
  for (const photo of ILSAN_RENTALS) {
    assert.ok(photo.src.startsWith('assets/store/ilsan/rental/'));
    assert.ok(html.includes(`${photo.src} ${photo.width}w`));
    assert.ok(existsSync(new URL(photo.src, root)));
    assert.ok(existsSync(new URL(photo.thumbnail, root)));
  }
  assert.match(html, /id="store-gallery-panel-rental"[^>]* hidden/);
  assert.doesNotMatch(html, /assets\/store\/hapjeong\/|합정점 사진|store-slideshow/);
  assert.doesNotMatch(evaluate("storePage('hapjeong')"), /assets\/store\/ilsan\//);
});

test('Suwon shows seven space images with the new fifth photo and no rental UI', () => {
  const html = evaluate("storePage('suwon')");
  assert.match(html, /class="store-photo-gallery" aria-label="수원점 사진"/);
  assert.equal((html.match(/class="store-space-image"/g) || []).length, 7);
  assert.equal((html.match(/data-space-index=/g) || []).length, 7);
  const sources = [...html.matchAll(/class="store-space-image" (?:data-)?src="([^"]+)"/g)].map(([,src]) => src);
  assert.deepEqual(sources, [1,2,3,4,'5-reception',6,7].map(id => `/assets/store/suwon/${id}.${id === '5-reception' ? 'jpg' : 'webp'}`));
  assert.ok(html.includes('/assets/store/suwon/5-reception-720.jpg'));
  assert.ok(existsSync(new URL('assets/store/suwon/5-reception.jpg', root)));
  assert.ok(existsSync(new URL('assets/store/suwon/5-reception-720.jpg', root)));
  assert.match(html, /class="store-space-count"[^>]*>1\/7/);
  assert.doesNotMatch(html, /store-gallery-tab|role="tabpanel"|대여복|<figcaption|assets\/store\/suwon\/5.webp/);
  assert.match(html, /수원점 방문 예약/);
});

test('each store branch has its own color theme selector', () => {
  const css = readFileSync(new URL('store-page.css', root), 'utf8');
  for (const [slug] of evaluate('STORE_NAMES')) {
    const rule = css.match(new RegExp(`\\.store-editorial\\[data-store="${slug}"\\]\\s*\\{([^}]+)\\}`));
    assert.ok(rule, `${slug}: missing branch theme`);
    assert.match(rule[1], /--[\w-]+\s*:\s*#[\da-f]{3,8}\b/i, `${slug}: missing color custom property`);
  }
});

test('static store landing matches the current renderer for no-JS visitors', () => {
  const html = readFileSync(new URL('store/index.html', root), 'utf8');
  const start = html.indexOf('<div id="app">') + '<div id="app">'.length;
  const end = html.indexOf('<dialog id="menu-dialog"');
  assert.ok(start >= '<div id="app">'.length && end > start);
  assert.equal(html.slice(start, end).trim().replace(/<\/div>$/, ''), evaluate("storePage('cheongdam')", true));
});

test('branch booking links keep the supplied Naver ticket destinations and safe new tabs', () => {
  for (const slug of ['ilsan', 'hapjeong', 'suwon']) {
    const url = evaluate(`STORE_INFO['${slug}'].find(([key]) => key === '예약')[1]`);
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://map.naver.com');
    assert.ok(parsed.searchParams.get('placePath').startsWith('/ticket?'));
    if (slug === 'ilsan') assert.equal(parsed.pathname, '/p/entry/place/1173365429');
    else assert.ok(decodeURIComponent(parsed.pathname).endsWith(slug === 'hapjeong' ? '합정' : '수원'));
    const html = evaluate(`storePage('${slug}')`);
    assert.ok(html.includes(`href="${url.replaceAll('&', '&amp;')}" target="_blank" rel="noopener noreferrer"`));
    assert.match(html, /<dt>예약<\/dt><dd><a[^>]+>[^<]+ 네이버 예약 ↗<\/a>/);
    assert.match(html, /인스타그램 ↗/);
  }
});

test('all branches show a Naver booking button below the visit label with their existing destination', () => {
  const labels = {cheongdam:'청담 본점 방문 예약','rental-center':'청담 렌탈센터 방문 예약',suwon:'수원점 방문 예약',hapjeong:'합정점 방문 예약',ilsan:'일산점 방문 예약'};
  for (const [slug] of evaluate('STORE_NAMES')) {
    const html = evaluate(`storePage('${slug}')`);
    const expected = evaluate(`STORE_INFO['${slug}'].find(([key]) => key === '예약')?.[1] || RESERVATION`);
    const heading = html.match(/<div class="store-visit-heading">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(heading, slug);
    assert.match(heading, /방문 안내<\/p><a class="store-booking-button"/);
    assert.ok(heading.includes(`href="${expected.replaceAll('&', '&amp;')}"`), slug);
    assert.match(heading, /target="_blank" rel="noopener noreferrer"/);
    assert.ok(heading.includes(labels[slug]), slug);
    assert.match(heading, /<span aria-hidden="true">N<\/span>/);
    assert.equal((html.match(/class="store-booking-button"/g) || []).length, 1);
  }
});

function slideshowFixture() {
  function target() {
    const listeners = new Map();
    return {
      listeners,
      addEventListener(type, fn) { listeners.set(type, fn); },
      removeEventListener(type, fn) { if (listeners.get(type) === fn) listeners.delete(type); },
      emit(type, event) { listeners.get(type)?.(event); },
    };
  }
  const previous = target(), next = target(), view = target(), count = {};
  const track = Object.assign(target(), {
    children: Array(7), clientWidth: 390, scrollLeft: 0,
    scrollTo(options) { this.lastScroll = options; this.scrollLeft = options.left; this.emit('scroll'); },
  });
  const nodes = {'.store-track': track, '[data-store-prev]': previous, '[data-store-next]': next, '[data-store-count]': count};
  const media = {matches: false};
  const module = readFileSync(new URL('store-slideshow.mjs', root), 'utf8').replace(/^export /gm, '');
  const mount = runInNewContext(module + '\nmountStoreSlideshow;', {window: view, matchMedia: () => media});
  const cleanup = mount({querySelector: selector => nodes[selector]});
  let prevented = 0;
  return {track, previous, next, count, view, media, cleanup, mount,
    key(key) { track.emit('keydown', {key, preventDefault() { prevented++; }}); },
    get prevented() { return prevented; },
  };
}

test('store slides support bounded button and keyboard navigation and swipe counters', () => {
  const f = slideshowFixture();
  assert.equal(f.count.textContent, '01 / 07');
  assert.equal(f.previous.disabled, true);
  assert.equal(f.next.disabled, false);
  f.next.emit('click');
  assert.equal(f.track.scrollLeft, 390);
  assert.equal(f.track.lastScroll.behavior, 'smooth');
  assert.equal(f.count.textContent, '02 / 07');
  f.previous.emit('click');
  f.key('ArrowLeft');
  assert.equal(f.track.scrollLeft, 0);
  f.key('End');
  assert.equal(f.track.scrollLeft, 2340);
  assert.equal(f.count.textContent, '07 / 07');
  assert.equal(f.next.disabled, true);
  f.key('ArrowRight');
  assert.equal(f.track.scrollLeft, 2340);
  f.key('Home');
  f.key('ArrowRight');
  assert.equal(f.track.scrollLeft, 390);
  const before = f.prevented;
  f.key('Tab');
  assert.equal(f.prevented, before, 'unrelated keys keep their native behavior');
  f.track.scrollLeft = 1560;
  f.track.emit('scroll');
  assert.equal(f.count.textContent, '05 / 07');
  assert.equal(f.previous.disabled, false);
  assert.equal(f.next.disabled, false);
  f.cleanup();
});

test('reduced motion skips animation and disposal removes all owned listeners', () => {
  const f = slideshowFixture();
  f.media.matches = true;
  f.next.emit('click');
  assert.equal(f.track.lastScroll.behavior, 'instant');
  f.track.clientWidth = 500;
  f.track.scrollLeft = 1500;
  f.view.emit('resize');
  assert.equal(f.count.textContent, '04 / 07');
  f.cleanup();
  f.cleanup();
  for (const target of [f.track, f.previous, f.next, f.view]) assert.equal(target.listeners.size, 0);
  assert.doesNotThrow(() => f.mount({querySelector: () => null}));
});
