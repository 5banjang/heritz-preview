import { DESIGN } from './design-data.js';

const RESERVATION = 'https://naver.me/G7ZOAG1j';
const CONSULTATION = 'https://pf.kakao.com/_ljgUxj/chat';
const LOCATION = 'https://map.naver.com/p/entry/place/36523919';
const NAVIGATION = [
  ['ABOUT', '#/main/experience'], ['TAILORING', '#/main/experience'],
  ['RENTAL', '#/main/rental'], ['ARCHIVE', '#/archive/all'],
  ['EVENT', '#/event/all'], ['STORE', '#/main/store']
];
const app = document.querySelector('#app');
const menu = document.querySelector('#menu-dialog');
const photoDialog = document.querySelector('#photo-dialog');
let gallery = [];
let photoIndex = 0;
let currentPage = '';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assetURL = hash => `assets/${hash}.webp`;

function cropStyle(data) {
  if (data.mode !== 'CROP' || !data.transform) return '';
  const [[x, , left], [, y, top]] = data.transform;
  return `width:${100/x}%;height:${100/y}%;left:${-100*left/x}%;top:${-100*top/y}%;object-fit:fill;`;
}

function photo(data, alt, extra = '', priority = false, responsiveMain = false) {
  const dim = DESIGN.dimensions[data.hash];
  const tablet = responsiveMain ? DESIGN.tablet.find(p => p.hash === data.hash) : data;
  const mobile = responsiveMain ? DESIGN.mobile.find(p => p.hash === data.hash) : data;
  const crops = [data, tablet || data, mobile || data];
  const images = crops.map((p, i) => `<img class="crop-${i}" src="${assetURL(p.hash)}" alt="${escape(alt)}" width="${dim.w}" height="${dim.h}" loading="${priority ? 'eager' : 'lazy'}" ${priority ? 'fetchpriority="high"' : ''} decoding="async" style="${cropStyle(p)}">`).join('');
  return `<div class="photo ${extra}" data-asset="${data.hash}">${images}</div>`;
}

function external(url, label, classes = 'button') {
  return `<a class="${classes}" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function header(dark = false) {
  return `<header class="site-header ${dark ? 'dark' : ''}"><a class="brand" href="#/" aria-label="헤리츠테일러 메인">HERITZ TAILOR</a><nav class="desktop-nav" aria-label="주 메뉴">${NAVIGATION.map(([name, href]) => `<a href="${href}">${name}</a>`).join('')}</nav><button type="button" id="open-menu" class="menu-button" aria-label="전체 메뉴 열기" aria-haspopup="dialog" aria-controls="menu-dialog">☰</button></header>`;
}

function footer(archive = false) {
  return `<footer class="site-footer"><a class="brand" href="#/">HERITZ TAILOR</a><p>${archive ? 'ARCHIVE / CUSTOMER GALLERY' : 'Tailor House · Rental Center · Seoul'}</p></footer>`;
}

function contact() {
  return `<aside class="floating-contact" aria-label="예약 및 상담">${external(RESERVATION, '<span class="service-icon n-icon" aria-hidden="true">N</span><span class="contact-copy"><small>네이버</small><strong>예약하기</strong></span>', 'contact-button reserve')}${external(CONSULTATION, '<span class="service-icon kakao-icon" aria-hidden="true">●</span><span class="contact-copy"><small>카카오톡</small><strong>상담하기</strong></span>', 'contact-button consult')}</aside>`;
}

function mainPage() {
  const main = DESIGN.main;
  const steps = [
    ['CONSULT', '예식 일정과 원하는 스타일을 확인합니다.'],
    ['FITTING', '체형과 사이즈에 맞는 핏을 확인합니다.'],
    ['SELECT', '원단·디자인 또는 렌탈 수트를 선택합니다.'],
    ['FINAL', '최종 피팅 후 예식 준비를 마무리합니다.']
  ];
  return `${header(true)}<main id="main">
    <section class="hero" aria-labelledby="hero-title">${photo(main[0], '헤리츠테일러 웨딩 수트를 입은 신랑과 신부', 'hero-photo', true, true)}<div class="hero-content"><p class="eyebrow">HERITZ TAILOR · WEDDING SUIT</p><h1 id="hero-title">Crafted for your moment</h1><p class="hero-description">맞춤예복부터 렌탈까지,<br class="mobile-break"> 한 공간에서 완성하는 웨딩 수트</p><a class="button hero-button" href="#/main/rental">RENTAL COLLECTION</a></div></section>
    <section class="section moments" id="moments" aria-labelledby="moments-title"><p class="eyebrow">ARCHIVE / CUSTOMER GALLERY</p><h2 class="serif" id="moments-title">HERITZ MOMENTS</h2><p class="section-description">헤리츠테일러를 입고 완성한, 고객님의 스튜디오 촬영과 결혼식.</p><div class="four-grid moment-grid">${main.slice(1,5).map((p,i) => `<a class="photo-link" href="#/archive/${i%2 === 0 ? 'studio' : 'ceremony'}" aria-label="${i%2 === 0 ? '스튜디오 촬영' : '결혼식 본식'} 고객 사진 보기">${photo(p, i%2 === 0 ? '스튜디오 촬영 고객 착용사진' : '결혼식 본식 고객 착용사진', '', false, true)}</a>`).join('')}</div><div class="section-bottom"><p>스튜디오 촬영 · 결혼식 본식</p><a class="button gallery-button" href="#/archive/all">고객 착용사진 전체 보기 &nbsp; →</a></div></section>
    <section class="section rental" id="rental" aria-labelledby="rental-title"><h2 class="serif" id="rental-title">A suit for every silhouette</h2><p class="section-description">스타일과 체형에 따라 선택할 수 있는 렌탈 컬렉션</p><div class="four-grid rental-grid">${main.slice(5,9).map((p,i) => photo(p, ['블랙 렌탈 수트','블루 렌탈 수트','그레이 렌탈 수트','버건디 렌탈 수트'][i], '', false, true)).join('')}</div></section>
    <section class="section experience" id="experience" aria-labelledby="experience-title"><p class="eyebrow">HERITZ EXPERIENCE</p><h2 id="experience-title">상담부터 최종 피팅까지</h2><div class="four-grid steps-grid">${steps.map(([name, desc], i) => `<article class="step-card"><span class="step-number">0${i+1}</span><h3>${name}</h3><p>${desc}</p>${photo(main[i+9], ['상담과 일정 확인','체형에 맞는 치수 측정','원단 및 디자인 선택','최종 수트 피팅'][i], '', false, true)}</article>`).join('')}</div></section>
    <section class="section store" id="store" aria-labelledby="store-title"><div class="store-copy"><p class="eyebrow">HERITZ STORE</p><h2 class="serif" id="store-title">Tailor House &amp;<br>Rental Center</h2><p class="section-description">서로 다른 공간에서 만나는 맞춤 제작과 렌탈 컬렉션.</p>${external(LOCATION, '방문 위치 확인', 'button location-button')}</div><div class="store-grid">${main.slice(13,15).map((p,i) => `<article>${photo(p, i===0 ? '헤리츠테일러 2층 맞춤센터 내부' : '헤리츠테일러 지하 1층 렌탈센터 내부', '', false, true)}<h3><span class="floor-badge">${i===0 ? '2F' : 'B1'}</span>${i===0 ? '맞춤센터' : '렌탈센터'}</h3><p>${i===0 ? '나에게 맞는 한 벌을 준비하는 공간' : '다양한 수트를 직접 비교하는 공간'}</p></article>`).join('')}</div></section>
    <section class="section booking" id="booking" aria-labelledby="booking-title"><p class="eyebrow">BOOK YOUR FITTING</p><h2 id="booking-title">당신에게 맞는 예복을<br>직접 만나보세요.</h2><p class="section-description">맞춤예복과 렌탈 수트를 한 자리에서 비교하고 상담하세요.</p>${external(RESERVATION, '<span class="service-icon n-icon" aria-hidden="true">N</span><span>네이버 예약하고<br>무료주차권 받기</span>', 'button booking-button naver')}</section>
  </main>${footer()}${contact()}`;
}

function tabs(page, active) {
  const options = page === 'archive' ? [['all','전체'],['studio','스튜디오 촬영'],['ceremony','본식']] : [['all','전체 이벤트'],['groom','신랑 패키지'],['family','가족 패키지']];
  return `<nav class="tabs ${page}-tabs" aria-label="${page === 'archive' ? '고객 사진' : '이벤트'} 분류">${options.map(([key,label]) => `<a class="tab ${key===active ? 'active' : ''}" href="#/${page}/${key}" ${key===active ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}

function archivePage(category) {
  gallery = DESIGN[category];
  return `${header()}<main id="main" class="archive-main"><div class="archive-subnav"><span>ARCHIVE</span><span>Look book</span><span>Celebrity</span><span class="selected">고객 갤러리</span></div><section class="archive-content" aria-labelledby="archive-title"><div class="archive-heading"><h1 class="serif" id="archive-title">HERITZ MOMENTS</h1><h2>고객 갤러리</h2><p>스튜디오 촬영부터 결혼식까지, 헤리츠테일러와 함께한 고객님의 소중한 순간을 만나보세요.</p></div><div class="gallery-controls">${tabs('archive',category)}<p>사진을 선택해 크게 보세요.</p></div><div class="customer-grid">${gallery.map((p,i) => {const label=category==='ceremony' || (category==='all' && i>=3) ? '결혼식 본식' : '스튜디오 촬영';return `<button type="button" class="customer-card" data-photo="${i}" aria-label="${label} 사진 ${i+1} 확대 보기" aria-haspopup="dialog">${photo(p, `${label} 고객 착용사진 ${i+1}`)}<span class="customer-caption"><strong>${label}</strong><span aria-hidden="true">↗</span></span></button>`;}).join('')}</div><div class="gallery-bottom"><p>소중한 순간을 함께해 주신 고객님들께 감사드립니다.</p><a href="#/" class="button secondary">메인으로 돌아가기 &nbsp; →</a></div></section></main>${footer(true)}${contact()}`;
}

function packageCard(kind) {
  const groom=kind==='groom';
  const label=groom ? '신랑' : '가족';
  const copy=`<div class="package-copy"><p class="eyebrow">${groom ? 'WEDDING' : 'FAMILY'} PACKAGE</p><h2>${label} 패키지 ${groom ? '2+1' : '1+2'}</h2><p class="old-price"><s>${groom ? '89' : '99'}만원</s></p><p class="price">${groom ? '49' : '59'}만원</p><p class="limited">20명 한정</p><p class="benefit-note">가격과 혜택은 예약 시 확인해 주세요.</p><p class="package-description">${groom ? '복잡한 설명 없이 필요한 구성과 가격을 한눈에. 방문 상담에서 체형과 예식 분위기에 맞는 수트를 제안합니다.' : '혼주와 가족 구성원까지 함께 준비할 수 있도록 사이즈와 스타일 선택 폭을 넓게 구성합니다.'}</p>${external(RESERVATION, `${label} 패키지 상담예약`, 'button package-button')}</div>`;
  const visual=photo(DESIGN.event[groom ? 0 : 1], groom ? '신랑 패키지 웨딩 수트 착용사진' : '결혼식 본식에서 손을 맞잡은 신랑과 신부', 'package-photo');
  return `<section class="package-section ${kind}" aria-label="${label} 패키지">${groom ? visual+copy : copy+visual}</section>`;
}

function eventPage(category) {
  return `${header()}<main id="main" class="event-main"><section class="event-heading"><p class="eyebrow">HERITZ EVENT</p><h1 class="serif">EVENT</h1><p>이벤트별 구성과 혜택을 확인하세요.</p>${tabs('event',category)}</section>${category!=='family' ? packageCard('groom') : ''}${category!=='groom' ? packageCard('family') : ''}<div class="event-bottom"><a href="#/" class="button secondary">메인으로 돌아가기 &nbsp; →</a></div></main>${footer()}${contact()}`;
}

function parseRoute(hash = location.hash) {
  const [,page='main',selection='all'] = hash.replace(/^#/, '').split('/');
  if (page==='archive') return {page, selection:['all','studio','ceremony'].includes(selection) ? selection : 'all'};
  if (page==='event') return {page, selection:['all','groom','family'].includes(selection) ? selection : 'all'};
  return {page:'main', selection:['experience','rental','store','booking','moments'].includes(selection) ? selection : ''};
}

function render() {
  const route=parseRoute();
  if (menu.open) menu.close();
  if (photoDialog.open) photoDialog.close();
  if (currentPage!==route.page || route.page!=='main') {
    app.innerHTML=route.page==='archive' ? archivePage(route.selection) : route.page==='event' ? eventPage(route.selection) : mainPage();
    currentPage=route.page;
  }
  document.title=route.page==='archive' ? '고객 갤러리 | HERITZ TAILOR' : route.page==='event' ? '이벤트 | HERITZ TAILOR' : 'HERITZ TAILOR | 맞춤예복 & 렌탈';
  requestAnimationFrame(() => {
    if(route.page==='main' && route.selection) document.getElementById(route.selection)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
    else window.scrollTo({top:0,behavior:'instant'});
  });
}

function displayPhoto(index) {
  photoIndex=(index+gallery.length)%gallery.length;
  const data=gallery[photoIndex];
  const route=parseRoute();
  const label=route.selection==='ceremony' || (route.selection==='all' && photoIndex>=3) ? '결혼식 본식' : '스튜디오 촬영';
  const image=document.querySelector('#large-photo');
  image.src=assetURL(data.hash);
  image.alt=`${label} 고객 착용사진 ${photoIndex+1}`;
  document.querySelector('#photo-title').textContent=`고객 착용사진 · ${label}`;
  document.querySelector('#photo-count').textContent=`${photoIndex+1} / ${gallery.length}`;
}

document.querySelector('#menu-navigation').innerHTML=NAVIGATION.map(([label,href]) => `<a href="${href}">${label}<span aria-hidden="true">↗</span></a>`).join('');
document.addEventListener('click',event => {
  const opener=event.target.closest('#open-menu');
  if(opener){menu.showModal();return;}
  const closer=event.target.closest('[data-close]');
  if(closer){document.getElementById(closer.dataset.close).close();return;}
  const card=event.target.closest('[data-photo]');
  if(card){displayPhoto(Number(card.dataset.photo));photoDialog.showModal();return;}
  const routeLink=event.target.closest('a[href^="#/"]');
  if(routeLink && routeLink.getAttribute('href')===location.hash){event.preventDefault();render();}
});
for(const dialog of [menu,photoDialog]) {
  dialog.addEventListener('click',event => {if(event.target===dialog) dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');});
  new MutationObserver(()=>document.body.classList.toggle('dialog-open',menu.open || photoDialog.open)).observe(dialog,{attributes:true,attributeFilter:['open']});
}
document.querySelector('#previous-photo').addEventListener('click',()=>displayPhoto(photoIndex-1));
document.querySelector('#next-photo').addEventListener('click',()=>displayPhoto(photoIndex+1));
document.addEventListener('keydown',event=>{if(photoDialog.open && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();displayPhoto(photoIndex+(event.key==='ArrowLeft' ? -1 : 1));}});
let touchStart=null;
document.querySelector('.lightbox-image').addEventListener('touchstart',event=>{touchStart=event.touches[0].clientX;},{passive:true});
document.querySelector('.lightbox-image').addEventListener('touchend',event=>{if(touchStart!==null){const change=event.changedTouches[0].clientX-touchStart;if(Math.abs(change)>60)displayPhoto(photoIndex+(change>0?-1:1));touchStart=null;}},{passive:true});
window.addEventListener('hashchange',render);
render();
