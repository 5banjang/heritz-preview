import test from 'node:test';
import assert from 'node:assert/strict';
import { mountProcessScroll } from '../process-scroll.mjs';

function element() {
  const attrs=new Map(),listeners=new Map(),classes=new Set();
  return {attrs,listeners,classes,dataset:{},disabled:false,
    getAttribute:name=>attrs.get(name)??null,setAttribute:(name,value)=>attrs.set(name,value),removeAttribute:name=>attrs.delete(name),
    addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name),
    classList:{add:(...names)=>names.forEach(name=>classes.add(name)),remove:(...names)=>names.forEach(name=>classes.delete(name))},
    remove(){this.removed=true;}
  };
}
function fixture() {
  const cards=Array.from({length:4},element),buttons=cards.map((_,i)=>Object.assign(element(),{dataset:{processStep:String(i)}}));
  const arrows=[-1,1].map(direction=>Object.assign(element(),{dataset:{processDirection:String(direction)}}));
  const counter={},controls=Object.assign(element(),{querySelectorAll:()=>arrows,querySelector:()=>counter});
  const tabs={after(node){this.controls=node;}};
  const frames=new Map();let serial=0;
  const viewport=Object.assign(element(),{clientWidth:390,scrollLeft:0,
    scrollTo(options){this.lastScroll=options;this.scrollLeft=options.left;this.listeners.get('scroll')?.();},
    setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},releasePointerCapture(){this.capture=undefined;}
  });
  const section=Object.assign(element(),{querySelector:selector=>selector==='.process-window'?viewport:tabs,
    querySelectorAll:selector=>selector==='.step-card'?cards:buttons});
  const reduced={matches:false};
  const view=Object.assign(element(),{innerHeight:1000,scrollY:1200,matchMedia:()=>reduced,
    requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id),
    scrollTo(){throw Error('Must not move document');}
  });
  const doc={defaultView:view,querySelector:()=>section,createElement:()=>controls};
  return {doc,view,section,viewport,tabs,controls,arrows,counter,cards,buttons,frames,reduced,
    flush(){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());},
    select(button){section.listeners.get('click')({target:{closest:selector=>selector==='[data-process-direction]'?(arrows.includes(button)?button:null):(buttons.includes(button)?button:null)}});this.flush();},
    key(key){viewport.listeners.get('keydown')({key,target:viewport,preventDefault(){}});this.flush();},
    pointer(name,properties={}){const target=name==='pointerdown'?viewport:view;target.listeners.get(name)?.({pointerType:'mouse',pointerId:1,button:0,isPrimary:true,clientX:300,preventDefault(){},...properties});this.flush();}
  };
}
const active=f=>f.cards.findIndex(card=>card.attrs.has('data-current'));

test('all widths start as a manual gallery, independent of vertical scrolling',()=>{
  for(const width of [390,1440]){
    const f=fixture();f.viewport.clientWidth=width;
    const dispose=mountProcessScroll(f.doc);
    assert.ok(f.section.classes.has('process-enhanced'));
    assert.equal(f.viewport.attrs.get('tabindex'),'0');
    assert.equal(active(f),0);assert.equal(f.arrows[0].disabled,true);assert.equal(f.counter.textContent,'01 / 04');
    assert.equal(f.view.listeners.has('scroll'),false);
    f.select(f.buttons[2]);assert.equal(active(f),2);assert.equal(f.viewport.scrollLeft,width*2);
    f.view.scrollY+=1000;f.flush();assert.equal(active(f),2);
    assert.ok(f.cards.every(card=>!card.attrs.has('aria-hidden')),'native scroll content remains accessible');
    dispose();
  }
});

test('arrows, tabs, keyboard and native swipe change only the horizontal viewport',()=>{
  const f=fixture(),dispose=mountProcessScroll(f.doc),pageY=f.view.scrollY;
  f.select(f.arrows[1]);assert.equal(active(f),1);
  f.select(f.buttons[3]);assert.equal(active(f),3);assert.equal(f.arrows[1].disabled,true);
  f.select(f.arrows[1]);assert.equal(active(f),3);
  f.key('Home');assert.equal(active(f),0);
  f.key('ArrowLeft');assert.equal(active(f),0);
  f.key('ArrowRight');assert.equal(active(f),1);
  f.key('End');assert.equal(active(f),3);
  f.viewport.scrollLeft=780;f.viewport.listeners.get('scroll')();f.flush();assert.equal(active(f),2);
  assert.equal(f.view.scrollY,pageY);assert.equal(f.counter.textContent,'03 / 04');
  assert.equal(f.buttons[2].attrs.get('aria-pressed'),'true');
  dispose();
});

test('resize preserves the selected step and reduced motion uses immediate navigation',()=>{
  const f=fixture();f.view.innerHeight=400;f.reduced.matches=true;
  const dispose=mountProcessScroll(f.doc);
  f.select(f.buttons[2]);assert.deepEqual(f.viewport.lastScroll,{left:780,behavior:'instant'});
  f.viewport.clientWidth=1440;f.view.listeners.get('resize')();f.flush();
  assert.deepEqual(f.viewport.lastScroll,{left:2880,behavior:'instant'});assert.equal(active(f),2);
  f.reduced.matches=false;f.select(f.buttons[1]);assert.equal(f.viewport.lastScroll.behavior,'smooth');
  dispose();
});

test('mouse drag snaps to a step and suppresses its following click; touch remains native',()=>{
  const f=fixture(),dispose=mountProcessScroll(f.doc);
  f.pointer('pointerdown');f.pointer('pointermove',{clientX:296});
  assert.equal(f.viewport.capture,undefined);assert.equal(f.viewport.scrollLeft,0);
  f.pointer('pointermove',{clientX:50});assert.equal(f.viewport.capture,1);assert.equal(f.viewport.scrollLeft,250);
  f.pointer('pointerup',{clientX:50});assert.equal(f.viewport.capture,undefined);assert.equal(f.viewport.scrollLeft,390);
  let blocked=0;
  f.viewport.listeners.get('click')({preventDefault(){blocked++;},stopPropagation(){blocked++;}});
  assert.equal(blocked,2);assert.equal(active(f),1);assert.equal(f.view.scrollY,1200);
  f.pointer('pointerdown',{pointerType:'touch'});f.pointer('pointermove',{pointerType:'touch',clientX:0});
  assert.equal(f.viewport.scrollLeft,390);assert.equal(f.viewport.capture,undefined);
  dispose();
});

test('cancel and cleanup release pointer capture, remove controls and restore attributes',()=>{
  const f=fixture();f.viewport.setAttribute('role','group');
  const dispose=mountProcessScroll(f.doc);
  f.pointer('pointerdown');f.pointer('pointermove',{clientX:50});f.pointer('pointercancel');
  assert.equal(f.viewport.capture,undefined);assert.equal(f.viewport.classes.size,0);
  f.pointer('pointerdown');f.pointer('pointermove',{clientX:20});
  f.viewport.listeners.get('scroll')();const stale=[...f.frames.values()][0];
  dispose();dispose();stale();
  assert.equal(f.viewport.capture,undefined);assert.equal(f.frames.size,0);
  assert.equal(f.view.listeners.size,0);assert.equal(f.viewport.listeners.size,0);assert.equal(f.section.listeners.size,0);
  assert.equal(f.section.classes.size,0);assert.equal(f.controls.removed,true);
  assert.equal(f.viewport.attrs.get('role'),'group');assert.equal(f.viewport.attrs.has('tabindex'),false);
  assert.equal(active(f),-1);assert.ok(f.buttons.every(button=>!button.attrs.has('aria-pressed')));
  assert.equal(f.viewport.scrollLeft,0);
  const again=mountProcessScroll(f.doc);assert.equal(active(f),0);again();
});

test('missing markup is a harmless no-op',()=>{
  assert.doesNotThrow(()=>mountProcessScroll({querySelector:()=>null})());
});
