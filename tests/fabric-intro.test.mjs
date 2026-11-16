import test from 'node:test';
import assert from 'node:assert/strict';
import { cutFrame, cutProgress, cutTransforms, renderFabricIntro, mountFabricIntro } from '../fabric-intro.mjs';

test('normal-flow center progress clamps, reverses and has no time component', () => {
  for (const [center, expected] of [[900,0],[800,0],[500,.5],[200,1],[0,1]]) {
    assert.equal(cutProgress(center,1000), expected);
  }
  const forward = [800,650,500,350,200].map(center => cutFrame(cutProgress(center,1000)));
  assert.deepEqual([200,350,500,650,800].map(center => cutFrame(cutProgress(center,1000))), forward.toReversed());
  assert.equal(cutFrame(-1).progress,0);
  assert.equal(cutFrame(2).progress,1);
  assert.equal(cutFrame(0).apex,100);
  assert.equal(cutFrame(1).apex,0);
  assert.equal(cutFrame(0).gap,0);
  assert.equal(cutFrame(1).gap,50);
  assert.ok(cutFrame(1).release > 50);
  assert.deepEqual(cutFrame(.3),cutFrame(.3));
  assert.equal(cutProgress(500,1000,500),0,'no cut before the first scroll');
  assert.equal(cutProgress(200,1000,500),.5);
});

test('renderer supplies meaningful content and local shears without enhancement', () => {
  const html = renderFabricIntro();
  assert.match(html,/section class="fabric-intro"/);
  assert.match(html,/당신만을 위한 한 벌/);
  assert.match(html,/id="fabric-title"/);
  assert.match(html,/src="assets\/effects\/tailor-shears-open30.png"/);
  assert.doesNotMatch(html,/fabric-enhanced|<button/);
});

test('transformed cloth edges preserve the cut apex, bottom opening and release at both viewport sizes', () => {
  const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} should equal ${expected}`);
  const edge = (transform, x, y) => {
    const [, shift, angle] = transform.match(/^translate3d\(([-\d.e+]+)px,0,0\) skewX\(([-\d.e+]+)deg\)$/);
    return x + Number(shift) + Math.tan(Number(angle) * Math.PI / 180) * y;
  };
  for (const [width, height] of [[1440,1000],[390,844]]) {
    for (const progress of [0,.075,.12,.25,.5,.575,.7,.85,1]) {
      const values = cutFrame(progress), transforms = cutTransforms(progress,width,height);
      for (const value of Object.values(transforms)) assert.doesNotMatch(value,/NaN|Infinity/);
      const apex = height * values.apex / 100, release = width * values.release / 100;
      near(edge(transforms.left,width / 2,apex),width / 2 - release);
      near(edge(transforms.right,width / 2,apex),width / 2 + release);
      near(edge(transforms.left,width / 2,height),width * (.5 - values.gap / 100) - release);
      near(edge(transforms.right,width / 2,height),width * (.5 + values.gap / 100) + release);
      near(Number(transforms.cap.match(/^scaleY\((.+)\)$/)[1]) * height,apex);
    }
    const closed = cutTransforms(0,width,height), open = cutTransforms(1,width,height);
    assert.equal(closed.cap,'scaleY(1)');
    assert.equal(closed.notes,'0');
    assert.equal(closed.hint,'1');
    assert.equal(open.cap,'scaleY(0)');
    assert.equal(open.notes,'1');
    assert.equal(open.hint,'0');
    assert.ok(edge(open.left,width / 2,0) < 0,'left panel clears the stage');
    assert.ok(edge(open.right,width / 2,0) > width,'right panel clears the stage');
  }
});

test('existing section survives hashes, media changes and idempotent dispose/remount', () => {
  const names = ['matchMedia','document','window','requestAnimationFrame','cancelAnimationFrame'];
  const saved = Object.fromEntries(names.map(name => [name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  try {
    const listeners = new Map(), classes = new Set(), pending = new Map();
    const media = () => ({ matches:false, listeners:new Set(), addEventListener(_,fn){this.listeners.add(fn);}, removeEventListener(_,fn){this.listeners.delete(fn);}, change(value){this.matches=value;for(const fn of this.listeners)fn();} });
    const motion = media(), short = media();
    let top=500, width=1200, height=600, nextFrame=0, styleWrites=0;
    const element = () => {
      const styles = new Map();
      return {styles,style:{getPropertyValue:key=>styles.get(key) ?? '',setProperty:(key,value)=>{styleWrites++;styles.set(key,String(value));},removeProperty:key=>styles.delete(key)},remove(){stage.children.splice(stage.children.indexOf(this),1);}};
    };
    const nodes = Object.fromEntries(['.fabric-left','.fabric-right','.fabric-shears','.fabric-title span:first-child','.fabric-title span:last-child','.fabric-notes','.fabric-scroll-hint'].map(selector=>[selector,element()]));
    nodes['.fabric-notes'].styles.set('opacity','.42');
    const originals = Object.fromEntries(Object.entries(nodes).map(([selector,node])=>[selector,[...node.styles]]));
    const stage = {
      children:[nodes['.fabric-left'],nodes['.fabric-right'],nodes['.fabric-shears']],
      getBoundingClientRect:()=>({top,width,height}),
      querySelector:selector=>nodes[selector] ?? null,
      insertBefore(node,reference){this.children.splice(this.children.indexOf(reference),0,node);},
    };
    const intro = {querySelector:selector=>selector==='.fabric-stage'?stage:nodes[selector] ?? null,classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)}};
    globalThis.matchMedia=query=>query.includes('reduced')?motion:short;
    globalThis.window={innerHeight:1000,scrollY:0,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
    globalThis.document={querySelector:selector=>selector==='.fabric-intro'?intro:null,createElement:()=>element()};
    globalThis.requestAnimationFrame=fn=>{pending.set(++nextFrame,fn);return nextFrame;};
    globalThis.cancelAnimationFrame=id=>pending.delete(id);
    const flush=()=>{const callbacks=[...pending.values()];pending.clear();for(const fn of callbacks)fn();};
    const assertRestored=()=>{for(const [selector,node] of Object.entries(nodes)) assert.deepEqual([...node.styles],originals[selector]);};
    for(let run=0;run<2;run++) {
      top=500;window.scrollY=0;
      const dispose=mountFabricIntro();
      const cap=stage.children.find(node=>node.className==='fabric-cap');
      assert.ok(cap);
      assert.equal(stage.children.indexOf(cap),stage.children.indexOf(nodes['.fabric-shears'])-1);
      assert.equal(cap.styles.get('transform'),'scaleY(1)');
      assert.equal(nodes['.fabric-scroll-hint'].styles.get('opacity'),'1');
      assert.ok(classes.has('fabric-enhanced'));
      assert.equal(listeners.has('hashchange'),false);
      top=200;window.scrollY=300;listeners.get('scroll')();listeners.get('scroll')();
      assert.equal(pending.size,1);flush();
      assert.equal(cap.styles.get('transform'),'scaleY(0.15)');
      assert.match(nodes['.fabric-shears'].styles.get('transform'),/- 390px/);
      assert.equal(pending.size,0,'no follow-up animation after scroll stops');
      top=-1000;window.scrollY=1500;listeners.get('scroll')();flush();
      assert.equal(cap.styles.get('transform'),'scaleY(0)');
      assert.equal(nodes['.fabric-notes'].styles.get('opacity'),'1');
      const completedWrites=styleWrites;
      top=-1100;window.scrollY=1600;listeners.get('scroll')();flush();
      assert.equal(styleWrites,completedWrites,'completed fabric motion does not rewrite styles while other sections scroll');
      top=350;window.scrollY=150;listeners.get('scroll')();flush();
      assert.equal(cap.styles.get('transform'),'scaleY(0.65)');
      const leftBeforeResize=nodes['.fabric-left'].styles.get('transform');
      width=900;listeners.get('resize')();flush();
      assert.notEqual(nodes['.fabric-left'].styles.get('transform'),leftBeforeResize,'width-only resize recomputes panel geometry');
      width=1200;
      height=800;listeners.get('resize')();flush();
      assert.notEqual(cap.styles.get('transform'),'scaleY(0.65)','stage-height resize recomputes progress');
      height=600;
      window.innerHeight=800;listeners.get('resize')();flush();
      assert.equal(cap.styles.get('transform'),'scaleY(1)');
      window.innerHeight=1000;
      listeners.get('scroll')();motion.change(true);
      assert.equal(pending.size,0);
      assert.equal(classes.size,0);assertRestored();assert.equal(cap.styles.size,0);
      motion.change(false);assert.ok(classes.has('fabric-enhanced'));
      short.change(true);assert.equal(classes.size,0);assertRestored();
      short.change(false);assert.equal(cap.styles.get('transform'),'scaleY(0.65)');
      listeners.get('scroll')();const stale=[...pending.values()][0];
      dispose();dispose();stale();
      assert.equal(pending.size,0);assert.equal(listeners.size,0);
      assert.equal(motion.listeners.size,0);assert.equal(short.listeners.size,0);
      assertRestored();assert.equal(classes.size,0);
      assert.equal(stage.children.length,3,'dispose removes only the inserted cap');
      assert.equal(document.querySelector('.fabric-intro'),intro,'dispose preserves renderer-owned section');
    }
    motion.matches=true;
    const dispose=mountFabricIntro();
    assert.equal(classes.size,0);
    assertRestored();
    motion.change(false);assert.ok(classes.has('fabric-enhanced'));
    dispose();
    assert.equal(stage.children.length,3);
    document.querySelector=()=>null;
    assert.equal(mountFabricIntro(),undefined);
    assert.equal(listeners.size,0);
  } finally {
    for(const name of names) if(saved[name]) Object.defineProperty(globalThis,name,saved[name]); else delete globalThis[name];
  }
});
