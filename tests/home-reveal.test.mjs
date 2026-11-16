import test from 'node:test';
import assert from 'node:assert/strict';
import { mountHomeReveal } from '../home-reveal.mjs';

function fixture({ reduced = false, supported = true, rental = false, about = false, fabric = false } = {}) {
  const calls = [], listeners = new Map(), mediaListeners = new Map();
  let callback, observer;
  const element = name => {
    const values = new Map();
    return { name, children: [], style: {
      getPropertyValue: key => values.get(key) || '', getPropertyPriority: () => '',
      setProperty: (key, value) => values.set(key, value), removeProperty: key => values.delete(key),
    }, animate(frames, options) {
      const animation = { finished: new Promise(() => {}), cancelled: false, cancel() { this.cancelled = true; } };
      calls.push({ name, frames, options, animation });
      return animation;
    }, contains(node) { return node === this || this.children.includes(node); } };
  };
  const hero = element('hero');
  hero.children = ['eyebrow', 'title', 'description', 'links'].map(element);
  hero.matches = selector => selector === '.hero-content';
  hero.querySelector = selector => hero.children[['.hero-eyebrow','h1','.hero-description','.hero-links'].indexOf(selector)];
  if (fabric) {
    hero.matches = selector => selector === '.fabric-copy';
    hero.children = ['fabric-kicker','fabric-title','fabric-notes','fabric-scroll-hint'].map(element);
    hero.children.forEach(child => { child.matches = selector => selector.split(',').map(value=>value.trim()).includes('.'+child.name); });
  }
  const cover = element('cover');
  if (about) {
    hero.matches = selector => selector === '.about-opening';
    hero.children.unshift(cover);
    hero.children.forEach(child => { child.matches = selector => child === cover && selector === '.about-cover'; });
  }
  const photo = element('photo');
  photo.matches = selector => selector.includes('.moments-viewport');
  const background = element('rental-background');
  background.matches = selector => selector.includes('.rental-backdrops');
  const copy = element('rental-copy');
  copy.matches = () => false;
  copy.children = ['rental-eyebrow','rental-title','rental-name','rental-description','rental-booking'].map(element);
  const groups = rental ? [hero, photo, background, copy] : [hero, photo];
  class Observer {
    constructor(fn) { callback = fn; observer = this; this.observed = new Set(); }
    observe(group) { this.observed.add(group); }
    unobserve(group) { this.observed.delete(group); }
    disconnect() { this.observed.clear(); this.disconnected = true; }
  }
  const preference = { matches: reduced, addEventListener: (key, fn) => mediaListeners.set(key, fn), removeEventListener: key => mediaListeners.delete(key) };
  const doc = { defaultView: { IntersectionObserver: supported ? Observer : undefined, matchMedia: () => preference },
    querySelector: () => ({ querySelectorAll: () => groups }), activeElement: null,
    addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  return { doc, hero, cover, photo, background, copy, calls, listeners, mediaListeners, get observer() { return observer; }, enter(group) { callback([{ target: group, isIntersecting: true }]); } };
}

test('hero reveals top to bottom after half a second, photos reveal once independently', () => {
  const f = fixture(), dispose = mountHomeReveal(f.doc);
  assert.ok(f.hero.children.every(element => element.style.getPropertyValue('opacity') === '0'));
  f.enter(f.hero);
  assert.deepEqual(f.calls.map(call => call.name), ['eyebrow','title','description','links']);
  assert.deepEqual(f.calls.map(call => call.options.delay), [500,680,860,1040]);
  assert.ok(f.calls.every(call => call.options.duration === 800 && call.frames[0].transform === 'translateY(42px)'));
  assert.equal(f.photo.style.getPropertyValue('opacity'), '0');
  f.enter(f.hero); assert.equal(f.calls.length, 4);
  f.enter(f.photo); assert.equal(f.calls.length, 5);
  assert.equal(f.calls[4].options.delay, 500);
  dispose(); dispose();
  assert.ok(f.calls.every(call => call.animation.cancelled));
  assert.equal(f.photo.style.getPropertyValue('opacity'), '');
  assert.equal(f.listeners.size + f.mediaListeners.size, 0);
});

test('keyboard focus reveals pending content and cancels running motion immediately', () => {
  const f = fixture(), dispose = mountHomeReveal(f.doc);
  f.listeners.get('focusin')({ target: f.hero.children[3] });
  assert.ok(f.hero.children.every(element => element.style.getPropertyValue('opacity') === ''));
  f.enter(f.hero); assert.equal(f.calls.length, 0);
  f.enter(f.photo);
  f.listeners.get('focusin')({ target: f.photo });
  assert.ok(f.calls[0].animation.cancelled);
  dispose();
});

test('reduced motion or missing support never hides content; live preference clears all', () => {
  for (const options of [{ reduced: true }, { supported: false }]) {
    const f = fixture(options); mountHomeReveal(f.doc)();
    assert.equal(f.observer, undefined);
    assert.ok(f.hero.children.every(element => element.style.getPropertyValue('opacity') === ''));
  }
  const f = fixture(); mountHomeReveal(f.doc); f.enter(f.hero);
  f.mediaListeners.get('change')({ matches: true });
  assert.ok(f.observer.disconnected);
  assert.ok(f.calls.every(call => call.animation.cancelled));
  assert.equal(f.photo.style.getPropertyValue('opacity'), '');
  f.enter(f.photo); assert.equal(f.calls.length, 4);
});

test('rental background fades without moving its edges and copy rises sequentially', () => {
  const f = fixture({rental:true}), dispose = mountHomeReveal(f.doc);
  assert.equal(f.background.style.getPropertyValue('opacity'), '0');
  f.enter(f.background);f.enter(f.copy);
  assert.equal(f.calls[0].options.delay, 500);
  assert.equal(f.calls[0].frames[0].transform, 'none');
  assert.deepEqual(f.calls.slice(1).map(c=>c.options.delay), [500,680,860,1040,1220]);
  assert.ok(f.calls.slice(1).every(c=>c.frames[0].transform==='translateY(42px)'));
  dispose();assert.equal(f.background.style.getPropertyValue('opacity'), '');
});

test('ABOUT keeps the cover visible while copy rises in sequence and restores all on disposal', () => {
  const f = fixture({about:true}), dispose = mountHomeReveal(f.doc);
  assert.equal(f.cover.style.getPropertyValue('opacity'), '');
  assert.ok(f.hero.children.slice(1).every(element => element.style.getPropertyValue('opacity') === '0'));
  f.enter(f.hero);
  assert.deepEqual(f.calls.map(call => call.name), ['eyebrow','title','description','links']);
  assert.deepEqual(f.calls.map(call => call.options.delay), [500,680,860,1040]);
  assert.ok(f.calls.every(call => call.options.duration === 800 && call.frames[0].transform === 'translateY(42px)'));
  dispose();
  assert.ok(f.hero.children.every(element => element.style.getPropertyValue('opacity') === ''));
  assert.equal(f.listeners.size + f.mediaListeners.size, 0);
});

test('fabric scroll opacity remains owned by the cut during reveal and reduced-motion cleanup', () => {
  const f = fixture({fabric:true});
  const [kicker,title,notes,hint] = f.hero.children;
  // The cut mounts first and owns these two inline opacities.
  notes.style.setProperty('opacity','0');
  hint.style.setProperty('opacity','1');
  const dispose = mountHomeReveal(f.doc);
  assert.equal(kicker.style.getPropertyValue('opacity'),'0');
  assert.equal(title.style.getPropertyValue('opacity'),'0');
  assert.equal(notes.style.getPropertyValue('opacity'),'0');
  assert.equal(hint.style.getPropertyValue('opacity'),'1','reveal must not hide the scroll hint');
  notes.style.setProperty('opacity','.7');
  hint.style.setProperty('opacity','.2');
  f.enter(f.hero);
  assert.deepEqual(f.calls.map(call=>call.name),['fabric-kicker','fabric-title']);
  assert.equal(notes.style.getPropertyValue('opacity'),'.7');
  assert.equal(hint.style.getPropertyValue('opacity'),'.2');
  // The cut's earlier media listener restores the static appearance first.
  notes.style.removeProperty('opacity');
  hint.style.removeProperty('opacity');
  f.mediaListeners.get('change')({matches:true});
  assert.equal(notes.style.getPropertyValue('opacity'),'','cleanup must not restore a stale hidden value');
  assert.equal(hint.style.getPropertyValue('opacity'),'');
  assert.ok(f.calls.every(call=>call.animation.cancelled));
  dispose();
  assert.ok(f.hero.children.every(child=>child.style.getPropertyValue('opacity')===''));
});
