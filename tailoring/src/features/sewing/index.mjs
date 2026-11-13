export const details = Object.freeze([
  { id: 'pick-stitch', region: '라펠 가장자리', name: '픽스티치', english: 'Pick-Stitch', text: '라펠 가장자리를 따라 작은 땀이 이어지는 스티치입니다. 가장자리의 선을 정돈하며 은은한 디테일을 더합니다. 실제 땀의 간격과 표현은 원단과 작업 방식에 따라 달라집니다.', viewBox: '330 55 220 310' },
  { id: 'pad-stitching', region: '라펠 안쪽', name: '팔자뜨기', english: 'Pad-Stitch', text: '겉감과 심지(Canvas)를 손바느질로 연결해 라펠의 입체적인 볼륨을 만드는 기법입니다. 여러 땀이 쌓이며 라펠이 자연스럽게 돌아 접히는 형태를 돕습니다. 그림은 안쪽의 바느질을 드러내어 설명합니다.', viewBox: '190 100 190 330' },
].map(Object.freeze));

import { illustration } from './illustration.mjs';
export const diagramUrl = new URL('../../../assets/sewing/stitching-diagram.svg', import.meta.url).href;
export const diagram = `<svg viewBox="0 0 690 900" class="sewing-diagram" role="img" aria-label="픽 스티치와 팔자뜨기 위치를 보여주는 원본 벡터 2D 개념도">
  <image href="${illustration}" width="690" height="900"/>
</svg>`;

let instance = 0;
export function mount(root, options = {}) {
  if (!root?.ownerDocument || typeof root.append !== 'function') throw new TypeError('sewing.mount requires a DOM element');
  const doc = root.ownerDocument;
  const prefix = `sewing-${++instance}`;
  const section = doc.createElement('section');
  section.className = 'sewing';
  section.lang = 'ko';
  section.setAttribute('aria-labelledby', `${prefix}-heading`);
  section.innerHTML = `
    <header class="sewing-header">
      <p class="sewing-kicker">04 / STITCHING</p>
      <h2 id="${prefix}-heading" class="sewing-heading">보이지 않는 땀,<br>드러나는 곡선.</h2>
      <p class="sewing-intro">가장자리의 픽 스티치와 안쪽의 팔자뜨기. 두 지점을 선택해 각 스티치를 살펴보세요.</p>
    </header>
    <div class="sewing-layout">
      <div class="sewing-visual">
        <p class="sewing-kicker">STITCHING / DETAIL STUDY</p>
        <div class="sewing-drawing">${diagram}
        </div>
        <p class="sewing-caption">아래에서 스티치를 선택하면 해당 부분이 확대됩니다.</p>
        <div class="sewing-points" role="group" aria-label="부위 목록">
          <button type="button" class="sewing-point" data-sewing-index="-1" aria-pressed="true" aria-controls="${prefix}-detail">전체보기</button>
          ${details.map((item,index)=>`<button type="button" class="sewing-point" data-sewing-index="${index}" aria-pressed="false" aria-controls="${prefix}-detail">${item.name} (${item.english})</button>`).join('')}
        </div>
      </div>
      <div class="sewing-detail" id="${prefix}-detail" role="region" aria-label="선택한 바느질 설명" aria-live="polite" aria-atomic="true">
        <p class="sewing-detail-region"></p><p class="sewing-english" lang="en"></p>
        <h3 class="sewing-detail-title"></h3><p class="sewing-description"></p>
        <figure class="sewing-photo"><img class="sewing-photo-image" src="${new URL('../../../assets/sewing/pad-stitching.jpg', import.meta.url).href}" width="721" height="960" alt="라펠 안쪽 심지에 팔자 모양의 손바느질이 반복된 팔자뜨기 실제 작업 사진" loading="lazy" hidden><div class="sewing-photo-empty" role="img"></div><figcaption></figcaption></figure>
        <p class="sewing-note"></p>
      </div>
    </div>`;
  const buttons = [...section.querySelectorAll('[data-sewing-index]')];
  function select(index) {
    const item=details[index];
    if(!item && index !== -1)return;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.sewingIndex)===index)));
    section.dataset.selected=item?.id ?? 'all';
    section.querySelector('.sewing-detail').hidden=!item;
    section.querySelector('.sewing-diagram').setAttribute('viewBox',item?.viewBox ?? '0 0 690 900');
    section.querySelector('.sewing-diagram').setAttribute('aria-label',item ? item.name+' 확대 2D 개념도' : '정장 재킷 전체 2D 개념도');
    if(!item)return;
    section.querySelector('.sewing-detail-region').textContent=`0${index+1} / ${item.region}`;
    section.querySelector('.sewing-english').textContent=item.english;
    section.querySelector('.sewing-detail-title').textContent=item.name;
    section.querySelector('.sewing-description').textContent=item.text;
    section.querySelector('.sewing-photo').dataset.stitch=item.id;
    const isPad=item.id==='pad-stitching';
    const photo=section.querySelector('.sewing-photo-image');
    photo.src=new URL(`../../../assets/sewing/${item.id}.jpg`, import.meta.url).href;
    photo.width=isPad ? 721 : 960;
    photo.height=isPad ? 960 : 720;
    photo.alt=isPad ? '라펠 안쪽 심지에 팔자 모양의 손바느질이 반복된 팔자뜨기 실제 작업 사진' : '짙은 정장 라펠 가장자리를 따라 이어진 픽스티치 실제 작업 사진';
    photo.hidden=false;
    section.querySelector('.sewing-photo-empty').hidden=true;
    section.querySelector('.sewing-photo figcaption').textContent=`${item.name} 실제 사진`;
    section.querySelector('.sewing-note').textContent=isPad
      ? '2D 개념도는 스티치의 위치와 역할을 안내합니다. 실제 작업 사진에서 라펠 안쪽 심지에 이어지는 팔자뜨기를 살펴보세요.'
      : '2D 개념도는 스티치의 위치와 역할을 안내합니다. 실제 작업 사진에서 라펠 가장자리를 따라 이어지는 픽스티치를 살펴보세요.';
  }
  const onClick=event=>{
    const button=event.target.closest?.('[data-sewing-index]');
    if(button&&section.contains(button))select(Number(button.dataset.sewingIndex));
  };
  section.addEventListener('click',onClick);
  const initial=details.findIndex(item=>item.id===options.initialDetail);
  select(initial);
  root.append(section);
  return ()=>{section.removeEventListener('click',onClick);section.remove();};
}
