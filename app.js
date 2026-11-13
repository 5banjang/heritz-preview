import { renderAbout, mountAbout } from './about.mjs';
import { mountRentalScene } from './rental-scene.mjs';
import { mountRentalDrag } from './rental-drag.mjs';
import { mountHomeScroll } from './home-scroll.mjs';
import { mountHomeReveal } from './home-reveal.mjs';
import { mountProcessScroll } from './process-scroll.mjs';
import { renderFabricIntro, mountFabricIntro } from './fabric-intro.mjs';
import { DESIGN } from './design-data.js';
import { MOMENT_PHOTOS } from './moments-data.mjs';
import { ARCHIVE } from './archive-data.js';
import { renderArchiveNav, renderArchiveOverview } from './archive-editorial.mjs';
import { renderCelebrity } from './archive-celebrity.mjs';
import { mountStoreSlideshow } from './store-slideshow.mjs';

// GitHub Pages project path during preview; production custom domain uses the site root.
const BASE_PATH = location.hostname === '5banjang.github.io' ? '/heritz-preview/' : '/';
const sitePath = path => `${BASE_PATH}${String(path).replace(/^\/+/, '')}`;

const RESERVATION = 'https://naver.me/G7ZOAG1j';
const CONSULTATION = 'https://pf.kakao.com/_ljgUxj/chat';
const LOCATION = 'https://map.naver.com/p/entry/place/36523919';
const NAVIGATION = [
  ['ABOUT', sitePath('about/')], ['TAILORING', sitePath('tailoring/')],
  ['RENTAL', '#/main/rental'], ['ARCHIVE', sitePath('archive/')],
  ['EVENT', sitePath('event/')], ['STORE', sitePath('store/')]
];
const app = document.querySelector('#app');
const menu = document.querySelector('#menu-dialog');
const photoDialog = document.querySelector('#photo-dialog');
let gallery = [];
let photoIndex = 0;
let currentPage = '';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assetURL = hash => sitePath(`assets/${hash}.webp`);

function cropStyle(data) {
  if (data.mode !== 'CROP' || !data.transform) return '';
  const [[x, , left], [, y, top]] = data.transform;
  return `width:${100/x}%;height:${100/y}%;left:${-100*left/x}%;top:${-100*top/y}%;object-fit:fill;`;
}

function responsivePhoto(src) {
  if (!/^assets\/(rental|moments)\/.+\.jpe?g$/.test(src) && src !== 'tailoring/assets/hero/tailoring-work.jpg') return `src="${escape(sitePath(src))}"`;
  const stem = src.replace(/\.jpe?g$/, '');
  return `src="${sitePath(stem + '-1920.webp')}" srcset="${sitePath(stem + '-960.webp')} 960w, ${sitePath(stem + '-1920.webp')} 1920w" sizes="100vw"`;
}

function photo(data, alt, extra = '', priority = false, responsiveMain = false) {
  if (data.src) return `<div class="photo ${extra}" data-asset="${escape(data.src)}"><img ${responsivePhoto(data.src)} alt="${escape(alt)}" width="${data.w}" height="${data.h}" loading="${priority ? 'eager' : 'lazy'}" decoding="async"></div>`;
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
  return `<header class="site-header ${dark ? 'dark' : ''}"><a class="brand" href="${sitePath('')}" aria-label="헤리츠테일러 메인">HERITZ TAILOR</a><nav class="desktop-nav" aria-label="주 메뉴">${NAVIGATION.map(([name, href]) => `<a href="${href}">${name}</a>`).join('')}</nav><button type="button" id="open-menu" class="menu-button" aria-label="전체 메뉴 열기" aria-haspopup="dialog" aria-controls="menu-dialog">☰</button></header>`;
}

function footer(archive = false, archiveLabel = 'CUSTOMER GALLERY') {
  return `<footer class="site-footer"><a class="brand" href="${sitePath('')}">HERITZ TAILOR</a><p>${archive ? 'ARCHIVE / ' + archiveLabel : 'Tailor House · Rental Center · Seoul'}</p></footer>`;
}

function editorialFooter(legal = false) {
  return `<footer class="editorial-footer"><a class="brand" href="${sitePath('')}">HERITZ TAILOR</a><p>THE MAKING OF A SUIT</p><p>헤리츠테일러 · <a href="tel:025119876">02-511-9876</a></p><a href="#main">맨 위로 ↑</a><nav aria-label="예약 및 상담">${external(RESERVATION, '네이버 예약 ↗', '')}${external(CONSULTATION, '카카오톡 상담 ↗', '')}<a href="${sitePath('')}">메인으로</a>${legal ? external('https://www.instagram.com/heritztailor_/', 'Instagram', '') : ''}</nav>${legal ? `<div class="legal-footer"><div class="legal-company"><strong>㈜제이케이산업개발</strong><p>대표자: 곽진국</p><p>사업자 등록번호: 217-81-38933</p></div><div class="legal-contact"><p>주소: 서울 강남구 압구정로 72길 21, 301호(청담동, 부원빌딩)</p><p>개인정보관리책임자: 곽진국</p><p>전화: <a href="tel:025119876">02-511-9876</a></p><p>이메일: <a href="mailto:kawk111@nate.com">kawk111@nate.com</a></p></div><p class="legal-copyright">© 2026 HARITZ TAILOR<br>All Rights Reserved</p></div>` : ''}</footer>`;
}

function contact() {
  return `<aside class="floating-contact" aria-label="예약 및 상담">${external(RESERVATION, '<span class="service-icon n-icon" aria-hidden="true">N</span><span class="contact-copy"><small>네이버</small><strong>예약하기</strong></span>', 'contact-button reserve')}${external(CONSULTATION, '<span class="service-icon kakao-icon" aria-hidden="true">●</span><span class="contact-copy"><small>카카오톡</small><strong>상담하기</strong></span>', 'contact-button consult')}</aside>`;
}

function mainPage() {
  const main = DESIGN.main;
  const rental = [
    ['double-black', '더블랙', 'Double Black'],
    ['black-peaked', '블랙피크드', 'Black Peaked'],
    ['ivory', '아이보리', 'Ivory'],
    ['dark-navy', '다크곤', 'Dark Navy'],
    ['montblanc', '몽블랑', 'Montblanc'],
    ['charcoal', '차콜', 'Charcoal'],
    ['double-choco', '더블초코', 'Double Choco'],
    ['olive', '올리브', 'Olive'],
  ];
  const steps = [
    ['CONSULT', '예식 일정과 착용할 자리를 먼저 확인합니다. 원하는 분위기와 평소 즐겨 입는 스타일을 함께 살펴보고, 맞춤 제작과 렌탈 중 적합한 방향을 정합니다.'],
    ['FITTING', '어깨와 가슴, 허리의 여유와 전체 길이의 균형을 살펴봅니다. 서 있을 때의 실루엣뿐 아니라 앉거나 팔을 움직일 때의 편안함까지 함께 확인합니다.'],
    ['SELECT', '맞춤은 원단의 색감과 질감, 디자인의 조합을 살펴보고, 렌탈은 준비된 수트를 직접 비교합니다. 착용할 장소와 계절, 함께 입을 셔츠와의 조화도 고려합니다.'],
    ['FINAL', '최종 착용 상태에서 재킷과 바지의 길이, 몸에 닿는 여유, 전체적인 균형을 다시 확인합니다. 필요한 조정 사항을 상담하고 착용 준비를 마무리합니다.']
  ];
  return `${header(true)}<main id="main" class="home-main"><div class="home-opening">${renderFabricIntro(sitePath('assets/effects/tailor-shears-open30.webp'))}
    <section class="hero home-editorial" aria-labelledby="hero-title"><div class="hero-content"><p class="hero-eyebrow">HERITZ TAILOR · BESPOKE &amp; RENTAL</p><h1 id="hero-title">Crafted for <span>your moment.</span></h1><div class="hero-aside"><p class="hero-description">당신의 가장 빛나는 순간을 위해.<br>한 사람의 취향과 시간을 담은 한 벌.</p><nav class="hero-links" aria-label="컬렉션 살펴보기"><a href="${sitePath('tailoring/')}">BESPOKE <span aria-hidden="true">↗</span></a><a href="#/main/rental">RENTAL <span aria-hidden="true">↗</span></a></nav></div></div></section>
    </div><section class="tailoring-entry" aria-labelledby="tailoring-entry-title"><div class="tailoring-entry-visual"><img ${responsivePhoto('tailoring/assets/hero/tailoring-work.jpg')} width="1920" height="1280" alt="테일러가 원단 위에 초크로 선을 그리는 모습" loading="lazy" decoding="async"></div><div class="tailoring-entry-copy"><p class="entry-eyebrow">THE ART OF BESPOKE</p><h2 id="tailoring-entry-title">한 사람을 위한<br>한 벌의 과정.</h2><p class="entry-description">당신의 몸을 읽고, 당신만의 선을 그립니다.<br>측정부터 디자인, 바느질까지 직접 경험해 보세요.</p><a class="tailoring-experience-link" href="${sitePath('tailoring/')}">테일러링 체험하기 <span aria-hidden="true">↗</span></a></div></section><section class="section moments" id="moments" aria-labelledby="moments-title"><div class="moments-stage"><div class="editorial-heading"><p class="eyebrow">01 / HERITZ MOMENTS</p><h2 id="moments-title">당신의 빛나는 순간에,<br>가장 당신다운 한 벌.</h2><p class="section-description">한 벌의 옷이,<br>당신의 가장 소중한 장면이 되도록.</p></div><div class="four-grid moment-grid">${MOMENT_PHOTOS.map((p,i) => `<a class="photo-link" href="${sitePath('archive/')}" aria-label="${p.studio ? '스튜디오 촬영' : '결혼식 본식'} 고객 사진 보기">${photo(p, p.studio ? '스튜디오 촬영 고객 착용사진' : '결혼식 본식 고객 착용사진', '', false, true)}<span class="photo-caption"><span>${p.studio ? 'STUDIO' : 'CEREMONY'}</span><span>0${i+1} ↗</span></span></a>`).join('')}</div><div class="section-bottom"><p>HERITZ / CUSTOMER ARCHIVE</p><a class="editorial-link" href="${sitePath('archive/')}">모든 순간 살펴보기 <span aria-hidden="true">↗</span></a></div></div></section>
    <section class="section rental" id="rental" aria-labelledby="rental-title"><div class="rental-backdrops" aria-hidden="true">${rental.map(([file],i)=>`<img class="rental-backdrop ${i===0?'is-active':''}" ${responsivePhoto('assets/rental/'+file+'.jpg')} alt="" loading="lazy" decoding="async" width="2016" height="3024">`).join('')}</div><div class="rental-shade"></div><div class="rental-topline"><span>02 / RENTAL COLLECTION</span><span>SELECTED LOOKS · HERITZ TAILOR</span></div><div class="rental-layout"><div class="rental-copy"><p class="eyebrow">YOUR STYLE. YOUR MOMENT.</p><h2 id="rental-title">Double Black</h2><p class="rental-name">더블랙</p><p class="section-description">취향은 다르니까. 선택은 더 자유롭게.<br>다양한 대여복 중, 헤리츠가 고른 대표 스타일.<br>더 많은 디자인과 컬러를 매장에서 만나보세요.</p><a class="editorial-link" href="#/main/booking">피팅 예약하기 <span aria-hidden="true">↗</span></a></div><div class="rental-browser"><div class="four-grid rental-grid" tabindex="0" aria-label="대표 대여복 사진, 좌우 방향키로 이동">${rental.map(([file,name,label],i)=>`<figure><button type="button" class="rental-look" data-rental-select="${i}" data-label="${label}" data-name="${name}" aria-label="${name} 스타일 보기" aria-pressed="${i===0}">${photo({src: `assets/rental/${file}.jpg`,w:2016,h:3024},`${name} 렌탈 수트`)}<span class="rental-card-copy"><small>LOOK / 0${i+1}</small><strong>${label}</strong><span>${name}</span></span></button></figure>`).join('')}</div><div class="rental-controls"><div><button type="button" data-rental-direction="-1" aria-label="이전 대여복 사진">←</button><button type="button" data-rental-direction="1" aria-label="다음 대여복 사진">→</button></div><div class="rental-progress"><span></span></div><span class="rental-count">01 <small>/ 08</small></span></div><p class="rental-hint">DRAG TO EXPLORE · 좌우로 드래그</p></div></div></section>
    <section class="section experience" id="experience" aria-labelledby="experience-title"><div class="process-stage"><div class="editorial-heading"><p class="eyebrow">03 / THE PROCESS</p><h2 id="experience-title">처음부터 마지막까지,<br> 당신에게 맞추는 과정.</h2><p class="section-description">첫 대화부터 마지막 피팅까지.<br>한 사람을 위한 세심한 과정.</p></div><nav class="process-tabs" aria-label="제작 과정 단계 선택">${steps.map(([name],i)=>`<button type="button" data-process-step="${i}">${String(i+1).padStart(2,'0')} <span>${name}</span></button>`).join('')}</nav><div class="process-window"><div class="steps-grid">${steps.map(([name, desc], i) => `<article class="step-card"><button type="button" class="step-number" data-process-step="${i}" aria-label="${i+1}단계 ${name} 보기">0${i+1}</button><div class="step-copy"><h3>${['먼저, 당신의 이야기를 듣습니다.','몸에 맞는 편안함을 찾습니다.','취향을 한 벌에 담습니다.','마지막까지 세심하게 맞춥니다.'][i]}</h3><small>${name}</small><p>${desc}</p></div>${photo(main[i+9], ['상담과 일정 확인','체형에 맞는 치수 측정','원단 및 디자인 선택','최종 수트 피팅'][i], '', false, true)}</article>`).join('')}</div></div><a class="editorial-link" href="${sitePath('tailoring/')}">헤리츠의 테일러링 이야기 <span aria-hidden="true">↗</span></a></div></section>
    <section class="section store" id="store" aria-labelledby="store-title"><div class="editorial-heading"><p class="eyebrow">04 / VISIT HERITZ</p><h2 id="store-title">Visit <em>Heritz.</em></h2><p class="section-description">직접 입어보고, 당신의 한 벌을 찾아보세요.<br>서로 다른 두 공간, 당신을 위한 하나의 경험.</p></div><div class="store-grid">${main.slice(13,15).map((p,i) => `<article>${photo(p, i===0 ? '헤리츠테일러 2층 맞춤센터 내부' : '헤리츠테일러 지하 1층 렌탈센터 내부', '', false, true)}<div class="store-caption"><span class="floor-badge">${i===0 ? '2F' : 'B1'}</span><div><p class="store-category">${i===0 ? 'BESPOKE / 상담과 맞춤 제작' : 'RENTAL / 셀렉션과 피팅'}</p><h3>${i===0 ? 'Tailor House' : 'Rental Center'}</h3><p>${i===0 ? '몸과 취향을 읽는 상담부터 원단과 디자인을 고르는 시간까지. 당신의 한 벌을 차분하게 준비하는 맞춤 공간입니다.' : '다양한 수트를 직접 입어보며 실루엣과 착용감을 비교합니다. 특별한 날에 어울리는 선택을 만나는 렌탈 공간입니다.'}</p><a class="store-visit-link" href="#/main/booking">${i===0 ? '맞춤 상담 예약' : '대여복 피팅 예약'} <span aria-hidden="true">↗</span></a></div></div></article>`).join('')}</div><div class="section-bottom"><p><span class="store-address-label">FIND US / CHEONGDAM</span>서울 강남구 압구정로72길 21</p>${external(LOCATION, '방문 위치 확인 <span aria-hidden="true">↗</span>', 'editorial-link')}</div></section>
    <section class="section booking" id="booking" aria-labelledby="booking-title"><p class="eyebrow">YOUR STORY STARTS HERE</p><h2 id="booking-title">당신의 이야기를<br>입어볼 시간.</h2><div class="booking-details"><p class="section-description">당신에게 어울리는 한 벌.<br>헤리츠에서 이야기를 시작해 보세요.</p><div class="booking-links">${external(RESERVATION, '방문 · 피팅 예약 <span aria-hidden="true">↗</span>', 'editorial-link')}${external(CONSULTATION, '카카오톡 상담 <span aria-hidden="true">↗</span>', 'editorial-link')}</div></div></section>
  </main>${editorialFooter(true)}${contact()}`;
}

const STORE_NAMES=[['cheongdam','청담 본점'],['rental-center','청담 렌탈센터'],['suwon','수원'],['hapjeong','합정'],['ilsan','일산']];
const STORE_PHOTOS={'hapjeong':Array.from({length:7},(_,i)=>'assets/store/hapjeong/'+(i+1)+'.webp'),'cheongdam':Array.from({length:7},(_,i)=>'assets/store/cheongdam/'+(i+1)+'.webp'),'rental-center':Array.from({length:7},(_,i)=>'assets/store/rental-center/'+(i+1)+'.webp'),'suwon':Array.from({length:7},(_,i)=>'assets/store/suwon/'+(i+1)+'.webp'),'ilsan':Array.from({length:7},(_,i)=>'assets/store/ilsan/'+(i+1)+'.webp')};
const STORE_INFO={
 'cheongdam':[['위치','서울 강남구 압구정로 72길 21 2층 헤리츠테일러'],['연락처','02-511-9876'],['영업시간','화요일~금요일 - 11:00 ~ 20:00|토요일~일요일 - 10:00 ~ 20:00'],['휴무일','매주 월요일 정기휴무'],['주차','발렛파킹 가능'],['기타 안내','원활한 상담을 위해 방문 전 예약을 권장드립니다.'],['인스타그램','https://www.instagram.com/heritztailor_/']],
 'rental-center':[['위치','서울 강남구 압구정로72길 21 지하1층'],['연락처','070-4214-8904'],['영업시간','화요일~금요일 - 11:00 ~ 20:00|토요일~일요일 - 10:00 ~ 20:00'],['휴무일','매주 월요일 정기 휴무'],['주차','발렛파킹 가능'],['기타 안내','렌탈센터 예약·방문 안내를 입력해 주세요']],
 'suwon':[['위치','경기 수원시 팔달구 정조로892번길 4 1~4층'],['연락처','0507-1402-1467'],['영업시간','화요일~일요일 - 11:00 ~ 20:00'],['휴무일','매주 월요일 정기휴무'],['주차','주차 가능'],['인스타그램','https://www.instagram.com/heritztailor_suwon']],
 'hapjeong':[['위치','서울 마포구 월드컵로8길 23 1, 2층'],['연락처','02-336-5662'],['영업시간','화요일~일요일 - 11:00 ~ 20:00'],['주차','매장 내 주차 가능'],['인스타그램','https://www.instagram.com/heritztailor_hapjeong/']],
 'ilsan':[['위치','경기 고양시 일산동구 일산로286번길 19-9 1층'],['연락처','0507-1457-1234'],['영업시간','화요일~일요일 - 11:00 ~ 20:00'],['휴무일','매주 월요일 정기 휴무'],['주차','매장 앞 주차 가능'],['인스타그램','https://www.instagram.com/heritztailor.ilsan/']]
};
function storePage(slug) {
 if (!STORE_NAMES.some(([id])=>id===slug)) slug='cheongdam';
 const name=STORE_NAMES.find(x=>x[0]===slug)?.[1] || '청담 본점';
 const title={'cheongdam':'Cheongdam.','rental-center':'Rental center.','suwon':'Suwon.','hapjeong':'Hapjeong.','ilsan':'Ilsan.'}[slug];
 const photos=STORE_PHOTOS[slug]||[];
 const info=STORE_INFO[slug]||STORE_INFO.cheongdam;
 return `${header(true)}<main id="main" class="store-editorial" data-store="${slug}"><section class="store-intro"><p class="store-eyebrow">HERITZ TAILOR / OUR STORES</p><h1>Visit Heritz.</h1><div class="store-intro-deck"><p>당신의 시간을 위한 공간.</p><p>가까운 헤리츠에서<br>당신에게 맞는 한 벌을 만나보세요.</p></div></section><nav class="store-branch-nav" aria-label="지점 선택">${STORE_NAMES.map(([id,label],i)=>`<a href="#/store/${id}" ${slug===id?'aria-current="page"':''}><small>0${i+1}</small>${label}</a>`).join('')}</nav><section class="store-location" aria-labelledby="store-name"><div class="store-location-heading"><p class="store-eyebrow">THE SPACE / ${String(STORE_NAMES.findIndex(([id])=>id===slug)+1).padStart(2,'0')}</p><h2 id="store-name" lang="en">${title}</h2><p class="store-location-label">${name}</p></div>${photos.length?`<section class="store-slideshow" aria-label="${name} 매장 사진" aria-roledescription="슬라이드"><div class="store-track" id="store-photos" tabindex="0" aria-label="매장 사진, 좌우 방향키로 이동">${photos.map((src,i)=>`<figure class="store-slide" role="group" aria-roledescription="슬라이드" aria-label="${i+1} / ${photos.length}"><picture><source media="(max-width: 799px)" srcset="${escape(sitePath(src.replace('.webp','-720.webp')))}"><img src="${escape(sitePath(src))}" alt="${name} 매장 사진 ${i+1}" loading="${i===0?'eager':'lazy'}" decoding="async"></picture></figure>`).join('')}</div><div class="store-slide-bar"><p class="store-photo-caption"><span>THE SPACE &amp; DETAILS</span><span>${name} <span aria-hidden="true">—</span> 공간과 디테일</span></p><div class="store-slide-controls"><button data-store-prev type="button" aria-label="이전 매장 사진" aria-controls="store-photos" disabled>←</button><span data-store-count aria-live="polite" aria-atomic="true">01 / ${String(photos.length).padStart(2,'0')}</span><button data-store-next type="button" aria-label="다음 매장 사진" aria-controls="store-photos">→</button></div></div></section>`:`<div class="store-empty"><p>공간 사진을 준비하고 있습니다.</p><p>방문 문의는 아래 연락처를 이용해 주세요.</p></div>`}<div class="store-visit"><div class="store-visit-heading"><p class="store-eyebrow">VISIT INFORMATION</p><h3 lang="en">Plan your<br>visit.</h3><p class="store-visit-label">방문 안내</p></div><dl class="store-details">${info.filter(([key,value])=>!value.includes('입력해 주세요')).map(([key,value])=>`<div><dt>${escape(key)}</dt><dd>${key==='연락처'?`<a href="tel:${value.replace(/-/g,'')}">${escape(value)}</a>`:value.startsWith('https://')?`<a href="${escape(value)}" target="_blank" rel="noopener noreferrer">${escape(name)} 인스타그램 ↗</a>`:value.split('|').map(v=>escape(v)).join('<br>')}</dd></div>`).join('')}</dl></div></section></main>${editorialFooter()}${contact()}`;
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
 return `<img class="archive-photo" src="${escape(sitePath(data.src))}?v=9915ea1" alt="${escape(alt)}" width="${data.width}" height="${data.height}" loading="${priority ? 'eager' : 'lazy'}" decoding="async" ${priority ? 'fetchpriority="high"' : ''} data-figma-node="${escape(data.nodeId)}">`;
}
function lookCopy(look, index, fixed = false) {
 return `<div class="look-copy ${fixed ? 'look-fixed' : ''} ${index === 3 ? 'look-romance' : ''}"><p>LOOK ${index + 1}</p><h2>${escape(look.title)}</h2></div>`;
}
function archiveSpecialPage(kind, number) {
 if (kind === 'celebrity') return archiveEditorialPage('celebrity', number);
 const page = Math.min(ARCHIVE.lookbooks.length, Math.max(1, Math.floor(number || 1)));
 let body;
 if (number > 0) {
   const look = ARCHIVE.lookbooks[page - 1];
   body = `<section class="look-detail" aria-label="${escape(look.title)}"><div class="look-photos">${look.photos.map((p,i) => archivePhoto(p, `${look.title} 사진 ${i + 1}`, i === 0)).join('')}</div>${lookCopy(look, page - 1, true)}</section><a class="look-back" href="#/archive/lookbook">← LOOKBOOK 목록</a>`;
 } else {
   body = `<div class="look-list">${ARCHIVE.lookbooks.map((look,i) => `<a href="#/archive/lookbook/${i+1}" aria-label="LOOK ${i+1} ${escape(look.title)} 상세 보기">${archivePhoto(look.photos[0], look.title, i === 0)}${lookCopy(look, i)}</a>`).join('')}</div>`;
 }
 return header() + `<main id="main" class="archive-special archive-lookbook">${archiveNav('lookbook')}<h1 class="serif">LOOKBOOK</h1>${body}</main>` + footer(true, 'LOOKBOOK') + contact();
}

function archivePage(category) {
  if (category === 'overview') return archiveEditorialPage('overview');
  gallery = DESIGN[category];
  return `${header()}<main id="main" class="archive-main">${archiveNav("all")}<section class="archive-content" aria-labelledby="archive-title"><div class="archive-heading"><h1 class="serif" id="archive-title">HERITZ MOMENTS</h1><h2>고객 갤러리</h2><p>스튜디오 촬영부터 결혼식까지, 헤리츠테일러와 함께한 고객님의 소중한 순간을 만나보세요.</p></div><div class="gallery-controls">${tabs('archive',category)}<p>사진을 선택해 크게 보세요.</p></div><div class="customer-grid">${gallery.map((p,i) => {const label=category==='ceremony' || (category==='all' && i>=3) ? '결혼식 본식' : '스튜디오 촬영';return `<button type="button" class="customer-card" data-photo="${i}" aria-label="${label} 사진 ${i+1} 확대 보기" aria-haspopup="dialog">${photo(p, `${label} 고객 착용사진 ${i+1}`)}<span class="customer-caption"><strong>${label}</strong><span aria-hidden="true">↗</span></span></button>`;}).join('')}</div><div class="gallery-bottom"><p>소중한 순간을 함께해 주신 고객님들께 감사드립니다.</p><a href="#/" class="button secondary">메인으로 돌아가기 &nbsp; →</a></div></section></main>${footer(true)}${contact()}`;
}

function archiveEditorialPage(category, number = 0) {
  const body = category === 'celebrity'
    ? renderCelebrity({pages: ARCHIVE.celebrity, number, archivePhoto, escape})
    : renderArchiveOverview({archive: ARCHIVE, design: DESIGN, sitePath, escape, archivePhoto, photo});
  return header(true) + `<main id="main" class="archive-editorial">${renderArchiveNav(category, sitePath)}${body}</main>` + editorialFooter();
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
  content='<section class="event-post-section"><p class="event-sort">최신글순 ↓</p><div class="event-post-grid">'+EVENT_POSTS.map(p=>'<a class="event-post-card" href="#/event/store/'+p.id+'"><div class="event-original-pending"></div><h2>'+escape(p.title)+'</h2><time>'+p.date+'</time></a>').join('')+'</div></section>';
 }
 return header()+'<main id="main" class="event-main">'+heading+content+'<div class="event-bottom"><a href="#/" class="button secondary">메인으로 돌아가기 &nbsp; →</a></div></main>'+footer()+contact();
}

function parseRoute(hash = location.hash) {
  if (!hash.startsWith('#/') && /\/about\/?$/.test(location.pathname)) return {page:'about', selection:['#brand-intro','#brand-history','#brand-bi'].includes(hash) ? hash.slice(1) : ''};
  if (!hash) {
    const relativePath = location.pathname.startsWith(BASE_PATH)
      ? '/' + location.pathname.slice(BASE_PATH.length)
      : location.pathname;
    const cleanPath = relativePath.replace(/\/+$/, '') || '/';
    if (cleanPath === '/archive' || cleanPath.startsWith('/archive/')) return {page:'archive', selection:'overview', number:0};
    if (cleanPath === '/event' || cleanPath.startsWith('/event/')) return {page:'event', selection:'all', number:0};
    if (cleanPath === '/store' || cleanPath.startsWith('/store/')) return {page:'store', selection:'cheongdam'};
  }
  const [,page='main',selection=page === 'archive' ? 'overview' : 'all'] = hash.replace(/^#/, '').split('/');
  if (page==='about') return {page, selection:['brand-intro','brand-history','brand-bi'].includes(selection) ? selection : ''};
  if (page==='store') return {page,selection:STORE_NAMES.some(x=>x[0]===selection)?selection:'cheongdam'};
  if (page==='archive') return {page, selection:['overview','all','studio','ceremony','lookbook','celebrity'].includes(selection) ? selection : 'overview', number:Math.max(0,Number(hash.replace(/^#/, '').split('/')[3])||0)};
  if (page==='event') return {page, selection:['all','store','package','groom','family'].includes(selection) ? selection : 'store', number:Math.max(0,Number(hash.replace(/^#/, '').split('/')[3])||0)};
  return {page:'main', selection:['experience','rental','store','booking','moments'].includes(selection) ? selection : ''};
}

const SEO_METADATA = {
  about: {title:'브랜드 소개 및 연혁 | HERITZ TAILOR', description:'헤리츠테일러의 브랜드 이야기, 테일러 소개와 브랜드 연혁을 만나보세요.'},
  main: {title:'HERITZ TAILOR | 맞춤예복 & 렌탈', description:'헤리츠테일러의 웨딩 맞춤예복과 정장 렌탈 서비스를 만나보세요. 고객 착용사진, 패키지 안내, 매장 방문 예약을 확인할 수 있습니다.'},
  archive: {
    overview: {title:'Archive | HERITZ TAILOR', description:'헤리츠테일러의 룩북, 셀러브리티 스타일과 고객의 소중한 순간을 만나보세요.'},
    all: {title:'고객 갤러리 | HERITZ TAILOR', description:'헤리츠테일러의 웨딩 수트 고객 갤러리. 스튜디오 촬영과 결혼식 본식에서 맞춤예복과 렌탈 수트를 착용한 고객 사진을 확인하세요.'},
    studio: {title:'스튜디오 촬영 갤러리 | HERITZ TAILOR', description:'헤리츠테일러의 수트를 착용한 고객들의 웨딩 스튜디오 촬영 사진을 확인하세요.'},
    ceremony: {title:'결혼식 본식 갤러리 | HERITZ TAILOR', description:'결혼식 본식에서 헤리츠테일러 웨딩 수트를 착용한 고객들의 소중한 순간을 확인하세요.'},
    lookbook: {title:'웨딩 수트 룩북 | HERITZ TAILOR', description:'헤리츠테일러가 제안하는 웨딩 수트 룩북과 스타일을 살펴보세요.'},
    celebrity: {title:'셀럽 수트 스타일 | HERITZ TAILOR', description:'다양한 셀럽의 헤리츠테일러 수트 스타일과 렌탈 룩을 살펴보세요.'}
  },
  event: {title:'이벤트 및 패키지 안내 | HERITZ TAILOR', description:'헤리츠테일러의 맞춤예복과 정장 렌탈 이벤트 및 패키지 안내를 확인하세요.'},
  store: {title:'매장 위치 및 방문 안내 | HERITZ TAILOR', description:'헤리츠테일러 매장 위치, 연락처, 영업시간과 네이버 예약을 통한 방문 안내를 확인하세요.'}
};
function setMeta(selector, value, attribute='content') {
  let element=document.head.querySelector(selector);
  if (!element) {
    element=document.createElement('meta');
    const match=selector.match(/^meta\[(name|property)="([^"]+)"\]$/);
    if (match) element.setAttribute(match[1],match[2]);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute,value);
}
function updateSEO(route) {
  const entry=route.page==='archive' ? SEO_METADATA.archive[route.selection] || SEO_METADATA.archive.all : SEO_METADATA[route.page] || SEO_METADATA.main;
  document.title=entry.title;
  setMeta('meta[name="description"]',entry.description);
  setMeta('meta[property="og:title"]',entry.title);
  setMeta('meta[property="og:description"]',entry.description);
  setMeta('meta[name="twitter:title"]',entry.title);
  setMeta('meta[name="twitter:description"]',entry.description);
  // Canonicalize the public landing URLs; hash navigation is not an independent indexed page.
  const canonicalURL = route.page === 'about' ? sitePath('about/') : route.page === 'archive'
    ? sitePath('archive/')
    : route.page === 'event'
      ? sitePath('event/')
      : route.page === 'store'
        ? sitePath('store/')
        : sitePath('');
  const absoluteCanonical = new URL(canonicalURL, location.origin).href;
  setMeta('meta[property="og:url"]', absoluteCanonical);
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) canonicalLink.href = absoluteCanonical;
}
let disposeFabricIntro;
let disposeHomeScroll;
let disposeHomeReveal;
let disposeProcessScroll;
let disposeRentalDrag;
let disposeRentalScene;
let disposeAbout;
let disposeStore;
function render() {
  const route=parseRoute();
  if (menu.open) menu.close();
  if (photoDialog.open) photoDialog.close();
  if (currentPage!==route.page || !['main','about'].includes(route.page)) {
    disposeAbout?.();
    disposeStore?.();
    disposeHomeReveal?.();
    disposeRentalScene?.();
    disposeRentalDrag?.();
    disposeProcessScroll?.();
    disposeHomeScroll?.();
    disposeFabricIntro?.();
    app.innerHTML=route.page==='about' ? header(true) + renderAbout(sitePath) + editorialFooter() : route.page==='archive' ? (['celebrity','lookbook'].includes(route.selection) ? archiveSpecialPage(route.selection,route.number) : archivePage(route.selection)) : route.page==='event' ? eventPage(route.selection,route.number) : route.page==='store' ? storePage(route.selection) : mainPage();
    currentPage=route.page;
    disposeStore = route.page === 'store' ? mountStoreSlideshow() : undefined;
    disposeAbout = route.page === 'about' ? mountAbout() : undefined;
    disposeFabricIntro = route.page === 'main' ? mountFabricIntro() : undefined;
    disposeHomeScroll = route.page === 'main' ? mountHomeScroll() : undefined;
    disposeProcessScroll = route.page === 'main' ? mountProcessScroll() : undefined;
    disposeRentalDrag = route.page === 'main' ? mountRentalDrag() : undefined;
    disposeRentalScene = route.page === 'main' ? mountRentalScene() : undefined;
    disposeHomeReveal = ['main','about'].includes(route.page) ? mountHomeReveal() : undefined;
  }
  updateSEO(route);
  requestAnimationFrame(() => {
    if(['main','about'].includes(route.page) && route.selection) document.getElementById(route.selection)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
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
