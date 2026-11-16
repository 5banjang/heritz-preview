'use strict';

const rentalSuits = [
  { key: 'black', name: '블랙 수트', english: 'Black Suit', image: '../assets/d3de3e589982b1e5ccf2ebcb0805fbb77098cc74.webp' },
  { key: 'blue-gray', name: '블루 그레이 수트', english: 'Blue Gray Suit', image: '../assets/54935bed96ed4558e53f724a0b84f08ceb30510a.webp' },
  { key: 'check', name: '체크 수트', english: 'Check Suit', image: '../assets/a84462cc22d711df29b998123e443d88c0749d75.webp' },
  { key: 'burgundy', name: '버건디 수트', english: 'Burgundy Suit', image: '../assets/113a37a22d63f71ed14e5f6e53f64b0cd9664d71.webp' }
];
const requestedItem = new URLSearchParams(location.search).get('item');
const suitIndex = rentalSuits.findIndex(suit => suit.key === requestedItem);
const suit = rentalSuits[suitIndex];
const viewer = document.getElementById('collection-viewer');
const viewerStage = viewer.querySelector('.viewer-stage');
const viewerCounter = viewer.querySelector('[data-viewer-counter]');
let mode = 'model';
let momentIndex = 0;
let viewerKind = 'moment';
const momentButtons = [...document.querySelectorAll('[data-moment]')];

function garmentMarkup() {
  return `<div class="garment-pending"><span>${suit.english.toUpperCase()}</span><div><strong>의상 단독컷</strong><small>마네킹 촬영본 준비 중</small></div><p>실제 대여 의상 사진이 들어갈 자리입니다.<br>현재 모델컷을 의상 단독컷으로 대체하지 않습니다.</p></div>`;
}

function photoMarkup() {
  return mode === 'model' ? `<img src="${suit.image}" alt="${suit.name} 모델 착용 화보">` : garmentMarkup();
}

function setMode(nextMode) {
  mode = nextMode;
  document.querySelector('.detail-photo').innerHTML = photoMarkup();
  document.querySelectorAll('[data-photo-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.photoMode === mode)));
  const label = mode === 'model' ? '모델 착용컷' : '실제 의상 단독컷';
  const count = mode === 'model' ? '01' : '02';
  document.querySelector('.detail-counter').textContent = `${count} / 02 · ${label}`;
  document.querySelector('.mobile-photo-controls span').textContent = `${label} · ${count} / 02`;
  document.querySelector('.detail-photo').setAttribute('aria-label', `${suit.name} ${label} 크게 보기`);
  if (viewer.open) renderViewer();
}

function renderViewer() {
  viewer.querySelector('.viewer-tabs').hidden = viewerKind !== 'suit';
  if (viewerKind === 'suit') {
    document.getElementById('viewer-title').textContent = suit.name;
    viewerStage.innerHTML = photoMarkup();
    viewerCounter.textContent = `${mode === 'model' ? '01 / 02 · 모델 착용컷' : '02 / 02 · 실제 의상 단독컷'}`;
    viewer.querySelectorAll('[data-viewer-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.viewerMode === mode)));
  } else {
    const source = momentButtons[momentIndex].querySelector('img');
    const image = document.createElement('img');
    image.src = source.src;
    image.alt = source.alt;
    viewerStage.replaceChildren(image);
    document.getElementById('viewer-title').textContent = 'Heritz Moments';
    viewerCounter.textContent = `${momentIndex + 1} / ${momentButtons.length}`;
  }
}

function changePhoto(direction) {
  if (viewerKind === 'suit') setMode(mode === 'model' ? 'garment' : 'model');
  else {
    momentIndex = (momentIndex + direction + momentButtons.length) % momentButtons.length;
    renderViewer();
  }
}

if (suit && document.querySelector('.catalog-grades')) {
  document.title = `${suit.name} | HERITZ RENTAL — 임시 페이지`;
  const previous = rentalSuits[(suitIndex + rentalSuits.length - 1) % rentalSuits.length];
  const next = rentalSuits[(suitIndex + 1) % rentalSuits.length];
  document.getElementById('main').innerHTML = `<section class="detail-content"><a class="button outline detail-back" href="./collection.html">← 컬렉션</a><div class="detail-layout">
    <div class="mobile-detail-title"><h1>${suit.name}</h1><p>${suit.english.toUpperCase()}</p></div>
    <div class="detail-heading"><p class="eyebrow">RENTAL COLLECTION</p><h1>${suit.english}</h1><h2>${suit.name}</h2><p>모델이 입은 분위기와<br>실제 의상 단독컷을 함께 살펴보세요.</p></div>
    <div class="detail-tabs" aria-label="사진 종류"><button class="button outline" data-photo-mode="model" aria-pressed="true">모델 착용</button><button class="button outline" data-photo-mode="garment" aria-pressed="false">의상만 보기</button></div>
    <div class="detail-photo-panel"><button class="detail-photo" type="button" aria-label="${suit.name} 모델 착용컷 크게 보기">${photoMarkup()}</button><div class="mobile-photo-controls"><button data-photo-step aria-label="이전 사진">‹</button><span aria-live="polite">모델 착용컷 · 01 / 02</span><button data-photo-step aria-label="다음 사진">›</button></div><div class="detail-thumbs"><button data-photo-mode="model" aria-pressed="true"><img src="${suit.image}" alt="${suit.name} 모델 착용 썸네일"><span>모델 착용</span></button><button data-photo-mode="garment" aria-pressed="false"><span class="thumb-pending">의상<br>촬영 예정</span><span>의상 단독</span></button><p>같은 라인의<br>사진을 선택하세요.</p></div></div>
    <div class="detail-info"><p class="detail-counter" aria-live="polite">01 / 02 · 모델 착용컷</p><hr><p>해당 라인의 실제 의상은 촬영 후 연결됩니다.<br>정확한 사이즈·대여 일정은 상담에서 확인합니다.</p><p class="screen-hint">모바일에서는 의상 사진을 화면 가득 열고<br>얼굴 아래에 대어 색감과 분위기를 비교해 보세요.</p><a class="button detail-booking" href="https://naver.me/G7ZOAG1j" target="_blank" rel="noopener">N &nbsp; 이 라인 피팅 예약하기 &nbsp; ↗</a><nav class="line-navigation" aria-label="다른 수트"><a class="button outline" href="./collection.html?item=${previous.key}">← 이전 라인</a><a class="button outline" href="./collection.html?item=${next.key}">다음 라인 →</a></nav></div>
  </div></section><footer class="detail-footer"><span>HERITZ TAILOR / RENTAL</span><a href="./">메인으로 ↑</a></footer>`;
  document.querySelectorAll('[data-photo-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.photoMode)));
  document.querySelectorAll('[data-photo-step]').forEach(button => button.addEventListener('click', () => setMode(mode === 'model' ? 'garment' : 'model')));
  document.querySelector('.detail-photo').addEventListener('click', () => {
    viewerKind = 'suit';
    renderViewer();
    viewer.showModal();
  });
}

momentButtons.forEach((button, index) => button.addEventListener('click', () => {
  viewerKind = 'moment';
  momentIndex = index;
  renderViewer();
  viewer.showModal();
}));
viewer.querySelector('[data-viewer-prev]').addEventListener('click', () => changePhoto(-1));
viewer.querySelector('[data-viewer-next]').addEventListener('click', () => changePhoto(1));
viewer.querySelectorAll('[data-viewer-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.viewerMode)));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    changePhoto(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
