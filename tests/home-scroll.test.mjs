import test from 'node:test';
import assert from 'node:assert/strict';
import {chapterFrame,mountHomeScroll} from '../home-scroll.mjs';

test('five-point rail follows section position and clamps before/after content',()=>{
 const rects=Array.from({length:5},(_,i)=>({top:1000+i*1000,height:1000}));
 assert.deepEqual(chapterFrame(rects,1000),{index:-1,progress:0});
 for(let i=0;i<5;i++)assert.deepEqual(chapterFrame(rects.map(r=>({...r,top:r.top-1000-i*1000})),1000),{index:i,progress:.45});
 assert.deepEqual(chapterFrame(rects.map(r=>({...r,top:r.top-10000})),1000),{index:4,progress:1});
});

class Element{
 constructor(className=''){
  this.className=className;this.children=[];this.parent=null;this.attrs=new Map();this.listeners=new Map();this.dataset={};
  this.style={setProperty:(k,v)=>{this.style[k]=v;},removeProperty:k=>{delete this.style[k];}};
  const classes=new Set();this.classList={add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),contains:x=>classes.has(x)};
  this.rect={top:0,height:800};this.clientWidth=300;this.scrollLeft=0;
 }
 set innerHTML(html){
  if(html.includes('moments-viewport')){
   const viewport=new Element('moments-viewport');viewport.setAttribute('tabindex','0');
   this.append(viewport,new Element('moments-controls'));
  }else if(html.includes('moments-counter')){
   this.append(new Element('moments-counter'));
   for(const direction of [-1,1]){const b=new Element('button');b.dataset.photoDirection=String(direction);this.append(b);}
   for(let i=0;i<(html.match(/data-photo-index=/g)||[]).length;i++){const b=new Element('button');b.dataset.photoIndex=String(i);this.append(b);}
  }else for(let i=0;i<5;i++){const b=new Element('button');b.dataset.chapter=String(i);this.append(b);}
 }
 matches(selector){
  if(selector[0]==='.')return this.className===selector.slice(1);
  if(selector[0]==='#')return this.id===selector.slice(1);
  if(selector[0]==='['){const key=selector.slice(6,-1).replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return key in this.dataset;}
  return this.className===selector;
 }
 append(...nodes){for(const n of nodes){n.remove();n.parent=this;this.children.push(n);}}
 remove(){if(this.parent){this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null;}}
 before(node){const p=this.parent,i=p.children.indexOf(this);node.remove();node.parent=p;p.children.splice(i,0,node);}
 replaceWith(node){this.before(node);this.remove();}
 querySelector(selector){return this.querySelectorAll(selector)[0];}
 querySelectorAll(selector){return this.children.flatMap(n=>[...(n.matches(selector)?[n]:[]),...n.querySelectorAll(selector)]);}
 contains(node){return node===this||this.children.some(n=>n.contains(node));}
 closest(selector){return this.matches(selector)?this:this.parent?.closest(selector);}
 getBoundingClientRect(){return this.rect;}
 scrollTo(options){this.lastScroll=options;this.scrollLeft=options.left;}
 scrollIntoView(options){this.lastIntoView=options;}
 setAttribute(k,v){this.attrs.set(k,v);}
 removeAttribute(k){this.attrs.delete(k);}
 addEventListener(k,v){this.listeners.set(k,v);}
 removeEventListener(k){this.listeners.delete(k);}
 focus(){document.activeElement=this;}
 setPointerCapture(id){this.capture=id;}
 hasPointerCapture(id){return this.capture===id;}
 releasePointerCapture(){this.capture=null;}
}

function fixture(count,run){
 const names=['document','window','matchMedia','requestAnimationFrame','cancelAnimationFrame'];
 const saved=Object.fromEntries(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 try{
  const main=new Element(),track=new Element('moment-grid'),stage=new Element('moments-stage');
  for(const id of ['moments','rental','experience','store','booking']){const s=new Element();s.id=id;main.append(s);}
  main.children[0].append(stage);stage.append(track);
  for(let i=0;i<count;i++)track.append(new Element('photo-link'));
  const events=new Map(),reduced={matches:false};let callback;
  globalThis.document={querySelector:()=>main,createElement:()=>new Element(),activeElement:null};
  globalThis.window={innerHeight:1000,scrollY:500,addEventListener:(k,v)=>events.set(k,v),removeEventListener:k=>events.delete(k)};
  globalThis.matchMedia=()=>reduced;
  globalThis.requestAnimationFrame=fn=>{callback=fn;return 1;};
  globalThis.cancelAnimationFrame=()=>{callback=null;};
  const flush=()=>{const fn=callback;callback=null;fn?.();};
  const dispose=mountHomeScroll();flush();
  const viewport=main.querySelector('.moments-viewport'),controls=main.querySelector('.moments-controls');
  const dots=controls.querySelectorAll('[data-photo-index]'),arrows=controls.querySelectorAll('[data-photo-direction]');
  const click=target=>{controls.listeners.get('click')({target});flush();};
  run({main,track,stage,events,reduced,flush,dispose,viewport,controls,dots,arrows,click});
  dispose();
 }finally{for(const n of names)if(saved[n])Object.defineProperty(globalThis,n,saved[n]);else delete globalThis[n];}
}

for(const count of [4,14])test(`${count} photos use manual controls without page scrolling; resize and cleanup retain state`,()=>fixture(count,f=>{
 const {viewport,controls,dots,arrows,click,events,flush,main,track,stage,dispose}=f;
 assert.equal(viewport.attrs.get('tabindex'),'0');assert.equal(arrows[0].disabled,true);
 click(arrows[1]);assert.equal(viewport.scrollLeft,300);assert.equal(dots[1].attrs.get('aria-pressed'),'true');
 click(dots[count-1]);assert.equal(viewport.scrollLeft,(count-1)*300);assert.equal(arrows[1].disabled,true);
 assert.equal(controls.querySelector('.moments-counter').textContent,`${String(count).padStart(2,'0')} / ${String(count).padStart(2,'0')}`);
 assert.equal(window.scrollY,500,'buttons leave document position unchanged');
 window.scrollY=1500;main.children[0].rect.top=-1500;events.get('scroll')();flush();
 assert.equal(viewport.scrollLeft,(count-1)*300,'document scrolling never advances photos');
 assert.equal(dots[count-1].attrs.get('aria-pressed'),'true');
 viewport.clientWidth=390;events.get('resize')();flush();
 assert.equal(viewport.scrollLeft,(count-1)*390,'resize keeps the chosen photo');
 assert.equal(viewport.lastScroll.behavior,'instant');
 assert.ok(track.children.every(s=>!s.inert&&!s.attrs.has('aria-hidden')),'native paging keeps links keyboard accessible');
 document.activeElement=arrows[0];dispose();dispose();
 assert.equal(document.activeElement,track.children[count-1]);assert.equal(track.parent,stage);
 assert.equal(viewport.listeners.size,0);assert.equal(controls.listeners.size,0);assert.equal(events.size,0);
 assert.equal(main.querySelector('.moments-gallery'),undefined);assert.equal(main.querySelector('.chapter-rail'),undefined);
 const again=mountHomeScroll();flush();again();assert.equal(track.parent,stage);
}));

test('native swipe, keyboard and reduced motion work independently of viewport height',()=>fixture(4,f=>{
 const {viewport,events,flush,dots,reduced,click}=f;
 window.innerHeight=480;
 viewport.scrollLeft=600;viewport.listeners.get('scroll')();flush();assert.equal(dots[2].attrs.get('aria-pressed'),'true');
 let prevented=0;
 const key=key=>{viewport.listeners.get('keydown')({target:viewport,key,preventDefault(){prevented++;}});flush();};
 key('End');assert.equal(viewport.scrollLeft,900);key('Home');assert.equal(viewport.scrollLeft,0);
 key('ArrowRight');assert.equal(viewport.scrollLeft,300);key('ArrowLeft');assert.equal(viewport.scrollLeft,0);
 assert.equal(prevented,4);assert.equal(window.scrollY,500);
 reduced.matches=true;click(dots[3]);assert.equal(viewport.lastScroll.behavior,'instant');
 events.get('scroll')();flush();assert.equal(dots[3].attrs.get('aria-pressed'),'true');
}));

test('mouse drag pages photos and suppresses only its link click; touch and ordinary clicks remain native',()=>fixture(4,f=>{
 const {viewport,events,flush}=f;let prevented=0,stopped=0;
 const pointer={pointerType:'mouse',button:0,isPrimary:true,pointerId:7,clientX:250,preventDefault(){prevented++;}};
 viewport.listeners.get('pointerdown')(pointer);
 events.get('pointermove')({...pointer,clientX:247});assert.equal(viewport.capture,undefined);
 events.get('pointermove')({...pointer,clientX:40});flush();assert.equal(viewport.scrollLeft,210);assert.equal(viewport.capture,7);
 events.get('pointerup')(pointer);flush();assert.equal(viewport.scrollLeft,300);assert.equal(viewport.capture,null);
 assert.equal(viewport.classList.contains('moments-dragging'),false);
 const event={preventDefault(){prevented++;},stopPropagation(){stopped++;}};
 viewport.listeners.get('click')(event);assert.equal(stopped,1);
 viewport.listeners.get('click')(event);assert.equal(stopped,1,'subsequent normal links still work');
 for(const pointerType of ['touch','pen']){
  viewport.listeners.get('pointerdown')({...pointer,pointerType});events.get('pointermove')({...pointer,pointerType,clientX:0});
  assert.equal(viewport.scrollLeft,300);
 }
 assert.equal(prevented,2,'native touch is not prevented');
 viewport.listeners.get('pointerdown')(pointer);events.get('pointermove')({...pointer,clientX:40});
 events.get('pointercancel')(pointer);flush();assert.equal(viewport.capture,null);
 viewport.listeners.get('pointerdown')(pointer);events.get('pointermove')({...pointer,clientX:40});
 f.dispose();assert.equal(viewport.capture,null);assert.equal(viewport.classList.contains('moments-dragging'),false);
}));
