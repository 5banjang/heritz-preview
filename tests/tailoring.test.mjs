import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFile(join(root, path), 'utf8');
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const lists = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]));
  return lists.flat();
}

test('desktop, menu and static pages link to tailoring without replacing ABOUT', async () => {
  const app = await read('app.js');
  assert.ok(app.includes("['ABOUT', sitePath('about/')]"));
  assert.ok(app.includes("['TAILORING', sitePath('tailoring/')]"));
  assert.match(app, /menu-navigation.*NAVIGATION\.map/);
  for (const page of ['index.html', 'archive/index.html', 'event/index.html', 'store/index.html']) {
    assert.match(await read(page), /href="(?:\.\.\/)?tailoring\/">TAILORING<\/a>/);
    assert.match(await read(page), /src="(?:\.\.\/)?app\.js\?v=local-editorial-draft"/);
  }
});

test('tailoring retains five chapters and offers return, booking and consultation links', async () => {
  const page = await read('tailoring/index.html');
  assert.equal((page.match(/class="design-chapter-heading"/g) || []).length, 5);
  assert.match(page, /href="\.\.\/" aria-label="헤리츠테일러 메인"/);
  assert.match(page, /https:\/\/naver.me\/G7ZOAG1j/);
  assert.match(page, /https:\/\/pf.kakao.com\/_ljgUxj\/chat/);
  assert.match(page, /index, follow/);
  const visit = await read('tailoring/src/features/visit/index.mjs');
  assert.ok(visit.includes("link.href = '../#/main/booking'"));
  assert.ok(!visit.includes('네이버 예약 · 준비 중'));
});

test('all static tailoring assets and imports exist inside the checkout', async () => {
  for (const path of await walk(join(root, 'tailoring'))) {
    if (!/\.(?:html|css|mjs|js)$/.test(path)) continue;
    const content = await readFile(path, 'utf8');
    const refs = [
      ...content.matchAll(/(?:src|href)="(\.{1,2}\/[^"#?]*)/g),
      ...content.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g),
      ...content.matchAll(/new URL\(['"](\.[^'"]+)['"]/g),
      ...content.matchAll(/url\(['"]?(\.[^'"\)]+)['"]?\)/g),
    ];
    for (const [, ref] of refs) {
      const destination = fileURLToPath(new URL(ref, pathToFileURL(path)));
      assert.ok(resolve(destination).startsWith(resolve(root)), ref);
      await stat(destination);
    }
  }
});

test('source state and preview preserve 288 combinations with double vent default', async () => {
  const { GROUPS, createState } = await import('../tailoring/src/features/configurator/state.mjs');
  const { renderPreview } = await import('../tailoring/src/features/configurator/preview.mjs');
  assert.equal(createState().vent, 'double-vent');
  let states = [{}];
  for (const group of GROUPS) states = states.flatMap(state => group.choices.map(([value]) => ({ ...state, [group.key]: value })));
  assert.equal(states.length, 288);
  for (const state of states) assert.match(renderPreview(state), /--suit-line:#000000/);
});
