import { DESIGN } from './design-data.js';
import { ARCHIVE } from './archive-data.js';

const RESERVATION = 'https://naver.me/G7ZOAG1j';
const CONSULTATION = 'https://pf.kakao.com/_ljgUxj/chat';
const LOCATION = 'https://map.naver.com/p/entry/place/36523919';
const NAVIGATION = [
  ['ABOUT', '#/main/experience'], ['TAILORING', '#/main/experience'],
  ['RENTAL', '#/main/rental'], ['ARCHIVE', '#/archive/all'],
  ['EVENT', '#/event/all'], ['STORE', '#/store/cheongdam']
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

function footer(archive = false, archiveLabel = 'CUSTOMER GALLERY') {
  return `<footer class="site-footer"><a class="brand" href="#/">HERITZ TAILOR</a><p>${archive ? 'ARCHIVE / ' + archiveLabel : 'Tailor House · Rental Center · Seoul'}</p></footer>`;
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
  return `<div class="site-switch"><span>현재 맞춤 홈페이지</span><span aria-hidden="true">|</span><a href="#/main/rental">렌탈 컬렉션 보기 →</a></div>${header(true)}<main id="main">
    <section class="hero" aria-labelledby="hero-title">${photo(main[0], '헤리츠테일러 웨딩 수트를 입은 신랑과 신부', 'hero-photo', true, true)}<div class="hero-content"><p class="eyebrow">HERITZ TAILOR · WEDDING SUIT</p><h1 id="hero-title">Crafted for your moment</h1><p class="hero-description">맞춤예복부터 렌탈까지,<br class="mobile-break"> 한 공간에서 완성하는 웨딩 수트</p><a class="button hero-button" href="#/main/rental">RENTAL COLLECTION</a></div></section>
    <section class="section moments" id="moments" aria-labelledby="moments-title"><p class="eyebrow">ARCHIVE / CUSTOMER GALLERY</p><h2 class="serif" id="moments-title">HERITZ MOMENTS</h2><p class="section-description">헤리츠테일러를 입고 완성한, 고객님의 스튜디오 촬영과 결혼식.</p><div class="four-grid moment-grid">${main.slice(1,5).map((p,i) => `<a class="photo-link" href="#/archive/${i%2 === 0 ? 'studio' : 'ceremony'}" aria-label="${i%2 === 0 ? '스튜디오 촬영' : '결혼식 본식'} 고객 사진 보기">${photo(p, i%2 === 0 ? '스튜디오 촬영 고객 착용사진' : '결혼식 본식 고객 착용사진', '', false, true)}</a>`).join('')}</div><div class="section-bottom"><p>스튜디오 촬영 · 결혼식 본식</p><a class="button gallery-button" href="#/archive/all">고객 착용사진 전체 보기 &nbsp; →</a></div></section>
    <section class="section rental" id="rental" aria-labelledby="rental-title"><h2 class="serif" id="rental-title">A suit for every silhouette</h2><p class="section-description">스타일과 체형에 따라 선택할 수 있는 렌탈 컬렉션</p><div class="four-grid rental-grid">${main.slice(5,9).map((p,i) => photo(p, ['블랙 렌탈 수트','블루 렌탈 수트','그레이 렌탈 수트','버건디 렌탈 수트'][i], '', false, true)).join('')}</div></section>
    <section class="section experience" id="experience" aria-labelledby="experience-title"><p class="eyebrow">HERITZ EXPERIENCE</p><h2 id="experience-title">상담부터 최종 피팅까지</h2><div class="four-grid steps-grid">${steps.map(([name, desc], i) => `<article class="step-card"><span class="step-number">0${i+1}</span><h3>${name}</h3><p>${desc}</p>${photo(main[i+9], ['상담과 일정 확인','체형에 맞는 치수 측정','원단 및 디자인 선택','최종 수트 피팅'][i], '', false, true)}</article>`).join('')}</div></section>
    <section class="section store" id="store" aria-labelledby="store-title"><div class="store-copy"><p class="eyebrow">HERITZ STORE</p><h2 class="serif" id="store-title">Tailor House &amp;<br>Rental Center</h2><p class="section-description">서로 다른 공간에서 만나는 맞춤 제작과 렌탈 컬렉션.</p>${external(LOCATION, '방문 위치 확인', 'button location-button')}</div><div class="store-grid">${main.slice(13,15).map((p,i) => `<article>${photo(p, i===0 ? '헤리츠테일러 2층 맞춤센터 내부' : '헤리츠테일러 지하 1층 렌탈센터 내부', '', false, true)}<h3><span class="floor-badge">${i===0 ? '2F' : 'B1'}</span>${i===0 ? '맞춤센터' : '렌탈센터'}</h3><p>${i===0 ? '나에게 맞는 한 벌을 준비하는 공간' : '다양한 수트를 직접 비교하는 공간'}</p></article>`).join('')}</div></section>
    <section class="section booking" id="booking" aria-labelledby="booking-title"><p class="eyebrow">BOOK YOUR FITTING</p><h2 id="booking-title">당신에게 맞는 예복을<br>직접 만나보세요.</h2><p class="section-description">맞춤예복과 렌탈 수트를 한 자리에서 비교하고 상담하세요.</p>${external(RESERVATION, '<span class="service-icon n-icon" aria-hidden="true">N</span><span>네이버 예약하고<br>무료주차권 받기</span>', 'button booking-button naver')}</section>
  </main>${footer()}${contact()}`;
}

const STORE_NAMES=[['cheongdam','청담 본점'],['rental-center','청담 렌탈센터'],['suwon','수원'],['hapjeong','합정'],['ilsan','일산']];
const STORE_PHOTOS={'cheongdam':Array.from({length:7},(_,i)=>'assets/store/cheongdam/'+(i+1)+'.webp'),'rental-center':Array.from({length:7},(_,i)=>'assets/store/rental-center/'+(i+1)+'.webp'),'suwon':Array.from({length:7},(_,i)=>'assets/store/suwon/'+(i+1)+'.webp'),'ilsan':Array.from({length:7},(_,i)=>'assets/store/ilsan/'+(i+1)+'.webp')};
let storePhotoIndex=0;
function storeImage(src,alt) {
 return '<div class="photo store-original-photo"><img src="'+escape(src)+'" alt="'+escape(alt)+'" loading="lazy" decoding="async"></div>';
}
function storePage(slug) {
 const name=STORE_NAMES.find(x=>x[0]===slug)?.[1] || '청담 본점';
 const photos=STORE_PHOTOS[slug]||[];
 storePhotoIndex=0;
 const info=slug==='cheongdam'?[['위치','서울 강남구 압구정로72길 21 2층 헤리츠테일러'],['연락처','02-511-9876'],['영업시간','화요일~금요일 11:00~20:00 / 토요일~일요일 10:00~20:00'],['휴무일','매주 월요일 정기휴무'],['주차','발렛파킹 가능']]:[];
 return `${header()}<main id="main" class="store-detail"><nav class="store-nav" aria-label="지점 선택">${STORE_NAMES.map(([id,label])=>`<a href="#/store/${id}" class="${slug===id?'selected':''}" ${slug===id?'aria-current="page"':''}>${label}</a>`).join('')}</nav><h1 class="serif">STORE</h1><h2>${name}</h2>${photos.length?`<section class="store-slideshow" aria-label="매장 사진"><button type="button" class="store-photo-button" data-store-next aria-label="다음 사진">${storeImage(photos[0],name+' 매장 사진 1')}</button><div class="store-photo-controls"><button data-store-prev type="button">← 이전</button><span data-store-count>1 / ${photos.length}</span><button data-store-next type="button">다음 →</button></div></section>`:`<div class="store-photo-pending" role="status">피그마 원본 사진 연결 준비 중</div>`}<dl class="store-info">${info.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl></main>${footer()}${contact()}`;
}
function cycleStorePhoto(delta) {
 const store=STORE_PHOTOS[parseRoute().selection]||[];
 if (!store.length) return;
 storePhotoIndex=(storePhotoIndex+delta+store.length)%store.length;
 document.querySelector('.store-photo-button').innerHTML=storeImage(store[storePhotoIndex],'매장 사진 '+(storePhotoIndex+1));
 document.querySelector('[data-store-count]').textContent=`${storePhotoIndex+1} / ${store.length}`;
}
function tabs(page, active) {
  const options = page === 'archive' ? [['all','전체'],['studio','스튜디오 촬영'],['ceremony','본식']] : [['all','전체 이벤트'],['groom','신랑 패키지'],['family','가족 패키지']];
  return `<nav class="tabs ${page}-tabs" aria-label="${page === 'archive' ? '고객 사진' : '이벤트'} 분류">${options.map(([key,label]) => `<a class="tab ${key===active ? 'active' : ''}" href="#/${page}/${key}" ${key===active ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}

function archiveNav(active){
 const menu=[['lookbook','Look book'],['celebrity','Celebrity'],['all','고객 갤러리']];
 return '<nav class="archive-section-nav" aria-label="ARCHIVE 하위 메뉴"><strong>ARCHIVE</strong>'+menu.map(([id,title])=>'<a href="#/archive/'+id+'" class="'+(active===id?'selected':'')+'" '+(active===id?'aria-current="page"':'')+'>'+title+'</a>').join('')+'</nav>';
}
function archivePhoto(data, alt, priority = false) {
 return `<img class="archive-photo" src="${escape(data.src)}" alt="${escape(alt)}" width="${data.width}" height="${data.height}" loading="${priority ? 'eager' : 'lazy'}" decoding="async" ${priority ? 'fetchpriority="high"' : ''} data-figma-node="${escape(data.nodeId)}">`;
}
function lookCopy(look, index, fixed = false) {
 return `<div class="look-copy ${fixed ? 'look-fixed' : ''} ${index === 3 ? 'look-romance' : ''}"><p>LOOK ${index + 1}</p><h2>${escape(look.title)}</h2></div>`;
}
function archiveSpecialPage(kind, number) {
 const isLook = kind === 'lookbook';
 const page = Math.min(isLook ? ARCHIVE.lookbooks.length : ARCHIVE.celebrity.length, Math.max(1, Math.floor(number || 1)));
 let body;
 if (isLook) {
  if (number > 0) {
   const look = ARCHIVE.lookbooks[page - 1];
   body = `<section class="look-detail" aria-label="${escape(look.title)}"><div class="look-photos">${look.photos.map((p,i) => archivePhoto(p, `${look.title} 사진 ${i + 1}`, i === 0)).join('')}</div>${lookCopy(look, page - 1, true)}</section><a class="look-back" href="#/archive/lookbook">← LOOKBOOK 목록</a>`;
  } else {
   body = `<div class="look-list">${ARCHIVE.lookbooks.map((look,i) => `<a href="#/archive/lookbook/${i+1}" aria-label="LOOK ${i+1} ${escape(look.title)} 상세 보기">${archivePhoto(look.photos[0], look.title, i === 0)}${lookCopy(look, i)}</a>`).join('')}</div>`;
  }
 } else {
  body = `<div class="celebrity-grid">${ARCHIVE.celebrity[page-1].map((p,i) => `<article>${archivePhoto(p, p.caption.map(s => s.trim()).join(' · '), i < 3)}<div class="celebrity-caption">${p.caption.map(line => `<p>${escape(line)}</p>`).join('')}</div></article>`).join('')}</div><nav class="archive-pagination" aria-label="Celebrity 페이지">${ARCHIVE.celebrity.map((_,i) => `<a ${i+1 === page ? 'aria-current="page"' : ''} href="#/archive/celebrity/${i+1}">${i+1}</a>`).join('')}</nav><div class="celebrity-bottom"><p>헤리츠테일러와 함께한 협찬 스타일입니다.</p><a class="button secondary" href="#/">메인으로 돌아가기 →</a></div>`;
 }
 const heading = isLook ? '<h1 class="serif">LOOKBOOK</h1>' : '<div class="celebrity-heading"><h1 class="serif">CELEBRITY</h1><h2>협찬 갤러리</h2><p>헤리츠테일러와 함께한 셀럽들의 스타일을 만나보세요.</p></div>';
 return header() + `<main id="main" class="archive-special archive-${kind}">${archiveNav(kind)}${heading}${body}</main>` + footer(true, isLook ? 'LOOKBOOK' : 'CELEBRITY') + contact();
}
function archivePage(category) {
  gallery = DESIGN[category];
  return `${header()}<main id="main" class="archive-main">${archiveNav("all")}<section class="archive-content" aria-labelledby="archive-title"><div class="archive-heading"><h1 class="serif" id="archive-title">HERITZ MOMENTS</h1><h2>고객 갤러리</h2><p>스튜디오 촬영부터 결혼식까지, 헤리츠테일러와 함께한 고객님의 소중한 순간을 만나보세요.</p></div><div class="gallery-controls">${tabs('archive',category)}<p>사진을 선택해 크게 보세요.</p></div><div class="customer-grid">${gallery.map((p,i) => {const label=category==='ceremony' || (category==='all' && i>=3) ? '결혼식 본식' : '스튜디오 촬영';return `<button type="button" class="customer-card" data-photo="${i}" aria-label="${label} 사진 ${i+1} 확대 보기" aria-haspopup="dialog">${photo(p, `${label} 고객 착용사진 ${i+1}`)}<span class="customer-caption"><strong>${label}</strong><span aria-hidden="true">↗</span></span></button>`;}).join('')}</div><div class="gallery-bottom"><p>소중한 순간을 함께해 주신 고객님들께 감사드립니다.</p><a href="#/" class="button secondary">메인으로 돌아가기 &nbsp; →</a></div></section></main>${footer(true)}${contact()}`;
}

function packageCard(kind) {
  const groom=kind==='groom';
  const label=groom ? '신랑' : '가족';
  const copy=`<div class="package-copy"><p class="eyebrow">${groom ? 'WEDDING' : 'FAMILY'} PACKAGE</p><h2>${label} 패키지 ${groom ? '2+1' : '1+2'}</h2><p class="old-price"><s>${groom ? '89' : '99'}만원</s></p><p class="price">${groom ? '49' : '59'}만원</p><p class="limited">20명 한정</p><p class="benefit-note">가격과 혜택은 예약 시 확인해 주세요.</p><p class="package-description">${groom ? '복잡한 설명 없이 필요한 구성과 가격을 한눈에. 방문 상담에서 체형과 예식 분위기에 맞는 수트를 제안합니다.' : '혼주와 가족 구성원까지 함께 준비할 수 있도록 사이즈와 스타일 선택 폭을 넓게 구성합니다.'}</p>${external(RESERVATION, `${label} 패키지 상담예약`, 'button package-button')}</div>`;
  const visual=photo(DESIGN.event[groom ? 0 : 1], groom ? '신랑 패키지 웨딩 수트 착용사진' : '결혼식 본식에서 손을 맞잡은 신랑과 신부', 'package-photo');
  return `<section class="package-section ${kind}" aria-label="${label} 패키지">${groom ? visual+copy : copy+visual}</section>`;
}

const EVENT_POSTS=[
 {id:1,title:'[진행중] 9월~12월 후기 이벤트',date:'2026.10.20'},
 {id:2,title:'[결혼준비ZERO프로젝트] 파트너쉽 모집',date:'2026.10.19'},
 {id:3,title:'[진행중] 웨딩 스냅 이벤트',date:'2026.10.18'},
 {id:4,title:'[진행중] 청담점 지인소개 이벤트',date:'2026.10.17'}
];
function eventTabs(active){
 return '<nav class="event-category-tabs" aria-label="이벤트 종류">'+[['store','매장 이벤트'],['package','패키지 이벤트']].map(([slug,label])=>'<a href="#/event/'+slug+'" class="'+(active===slug?'active':'')+'" '+(active===slug?'aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav>';
}
function eventPage(category,articleId=0) {
 const packageType=['groom','family'].includes(category)?category:'';
 const isPackage=category==='package'||!!packageType;
 const post=EVENT_POSTS.find(p=>p.id===articleId);
 const heading='<section class="event-heading"><p class="eyebrow">HERITZ EVENT</p><h1 class="serif">EVENT</h1><p>이벤트별 구성과 혜택을 확인하세요.</p>'+eventTabs(isPackage?'package':'store')+'</section>';
 let content='';
 if(post&&!isPackage){
  content='<article class="event-article"><p class="eyebrow">매장 이벤트</p><h2>'+escape(post.title)+'</h2><time>'+post.date+'</time><div class="event-original-pending">피그마 상세 콘텐츠 원본 이미지 적용 대기</div><a href="#/event/store" class="event-return">← 목록으로 돌아가기</a><section class="event-recent"><h3>최신글</h3>'+EVENT_POSTS.filter(p=>p.id!==post.id).map(p=>'<a href="#/event/store/'+p.id+'">'+escape(p.title)+'</a>').join('')+'</section></article>';
 } else if(isPackage) {
  content=(packageType!=='family'?packageCard('groom'):'')+(packageType!=='groom'?packageCard('family'):'');
 } else {
  content='<section class="event-post-section"><p class="event-sort">최신글순 ↓</p><div class="event-post-grid">'+EVENT_POSTS.map(p=>'<a class="event-post-card" href="#/event/store/'+p.id+'"><div class="event-original-pending">피그마 원본 이벤트 이미지 적용 대기</div><h2>'+escape(p.title)+'</h2><time>'+p.date+'</time></a>').join('')+'</div></section>';
 }
 return header()+'<main id="main" class="event-main">'+heading+content+'<div class="event-bottom"><a href="#/" class="button secondary">메인으로 돌아가기 &nbsp; →</a></div></main>'+footer()+contact();
}

function parseRoute(hash = location.hash) {
  const [,page='main',selection='all'] = hash.replace(/^#/, '').split('/');
  if (page==='store') return {page,selection:STORE_NAMES.some(x=>x[0]===selection)?selection:'cheongdam'};
  if (page==='archive') return {page, selection:['all','studio','ceremony','lookbook','celebrity'].includes(selection) ? selection : 'all', number:Math.max(0,Number(hash.replace(/^#/, '').split('/')[3])||0)};
  if (page==='event') return {page, selection:['all','store','package','groom','family'].includes(selection) ? selection : 'store', number:Math.max(0,Number(hash.replace(/^#/, '').split('/')[3])||0)};
  return {page:'main', selection:['experience','rental','store','booking','moments'].includes(selection) ? selection : ''};
}

function render() {
  const route=parseRoute();
  if (menu.open) menu.close();
  if (photoDialog.open) photoDialog.close();
  if (currentPage!==route.page || route.page!=='main') {
    app.innerHTML=route.page==='archive' ? (['celebrity','lookbook'].includes(route.selection) ? archiveSpecialPage(route.selection,route.number) : archivePage(route.selection)) : route.page==='event' ? eventPage(route.selection,route.number) : route.page==='store' ? storePage(route.selection) : mainPage();
    currentPage=route.page;
  }
  document.title=route.page==='archive' ? 'ARCHIVE | HERITZ TAILOR' : route.page==='event' ? '이벤트 | HERITZ TAILOR' : route.page==='store' ? '매장 안내 | HERITZ TAILOR' : 'HERITZ TAILOR | 맞춤예복 & 렌탈';
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
  if(event.target.closest('[data-store-prev]')){cycleStorePhoto(-1);return;}
  if(event.target.closest('[data-store-next]')){cycleStorePhoto(1);return;}
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
