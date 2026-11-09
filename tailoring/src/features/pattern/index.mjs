export const panels = Object.freeze([
  { id: 'front', label: '앞판', english: 'Front panel', text: '가슴과 앞여밈을 구성하는 앞판, 라펠 안쪽을 마감하는 앞안단입니다. 가슴 다트와 여밈선, 포켓 위치가 정장 앞모습의 균형을 결정합니다.', count: '01 / JACKET · 앞판과 앞안단' },
  { id: 'back', label: '뒤판', english: 'Back panel', text: '등의 곡선을 따라 어깨에서 허리까지 이어지는 패턴입니다. 등 중심선과 허리의 곡선, 밑단 트임을 함께 살펴보세요.', count: '02 / JACKET · 등 중심과 트임' },
  { id: 'side', label: '옆판', english: 'Side panel', text: '앞판과 뒤판 사이를 연결하며 몸통의 입체감을 만드는 패턴입니다. 허리로 들어가는 곡선과 밑단으로 이어지는 선이 옆모습의 실루엣을 잡습니다.', count: '03 / JACKET · 허리와 옆선' },
  { id: 'sleeve', label: '소매', english: 'Sleeves', text: '윗소매와 아랫소매가 만나 팔의 굽음에 맞는 형태를 만듭니다. 소매산의 곡선과 팔꿈치 기준선, 소매 끝의 연결을 살펴보세요.', count: '04 / JACKET · 큰소매와 작은소매' },
  { id: 'collar', label: '칼라', english: 'Collar', text: '윗칼라와 밑칼라가 목을 감싸고 라펠로 이어지는 형태를 만듭니다. 원본의 안카라·겉카라 조각에서 목둘레를 따르는 곡선을 확인할 수 있습니다.', count: '05 / JACKET · 안칼라와 겉칼라' },
  { id: 'pocket', label: '포켓', english: 'Pocket', text: '주머니 입구를 마감하는 입술과 그 위를 덮는 플랩입니다. 작은 조각의 폭과 형태가 포켓의 인상과 마감에 영향을 줍니다.', count: '06 / JACKET · 주머니 입술과 플랩' },
  { id: 'vest', label: '베스트', english: 'Vest', text: '베스트의 앞판과 뒤판을 함께 보여줍니다. 앞여밈과 가슴선, 허리 다트를 통해 셔츠 위로 몸을 감싸는 형태를 구성합니다.', count: '07 / VEST · 앞판과 뒤판' },
  { id: 'trousers', label: '팬츠', english: 'Trousers', text: '팬츠 앞판과 뒤판의 밑위 곡선, 허리 다트와 중심선을 비교해 보세요. 서로 다른 곡선이 엉덩이와 다리의 움직임을 위한 형태로 연결됩니다.', count: '08 / TROUSERS · 앞판과 뒤판' },
]);

import { diagram } from './references.mjs';
export { diagram } from './references.mjs';

export function clamp(value) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

// The sticky section travels from its top to its bottom minus the viewport.
export function scrollProgress(top, height, viewportHeight) {
  const distance = height - viewportHeight;
  return distance > 0 ? clamp(-top / distance) : 0;
}

export function explosionProgress(progress) {
  return 1 - Math.abs(2 * clamp(progress) - 1);
}

let instance = 0;

/** adapter.mount(viewport, {panelIds}) => (Promise of) {setProgress, selectPanel, dispose}.
 * setProgress receives absolute explosion 0..1, never a frame delta.
 */
export function mount(root, options = {}) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const id = `pattern-${++instance}`;
  const section = doc.createElement('section');
  section.className = `pattern-section${options.modelAdapter ? ' pattern-with-model' : ''}`;
  section.lang = 'ko';
  section.setAttribute('aria-labelledby', `${id}-title`);
  section.innerHTML = `
    <div class="pattern-sticky">
      <header class="pattern-header">
        <p class="pattern-eyebrow">03 / PATTERN</p>
        <h2 id="${id}-title">한 벌을 이루는 구조</h2>
        <p>선과 곡선에 담긴 테일러링의 구조. 여덟 가지 구성 요소를 선택해 원본 패턴을 살펴보세요.</p>
      </header>
      <section class="pattern-bespoke" aria-labelledby="${id}-bespoke-title">
        <div class="pattern-bespoke-copy">
          <p class="pattern-eyebrow">BESPOKE / INDIVIDUAL PATTERN</p>
          <h3 id="${id}-bespoke-title">한 사람의 몸에서 시작하는<br>한사람만의 패턴</h3>
          <p>비스포크는 수 세기에 걸쳐 이어져 온 테일러링의 가장 오래된 언어입니다.</p>
          <p>마스터 테일러가 직접 몸을 읽고, 한 사람만을 위한 패턴을 그리고, 대부분의 땀을 손으로 놓습니다.</p>
          <p>서두르지 않은 시간이 옷의 결이 되고, 그 결이 입는 이의 품격으로 이어집니다.</p>
        </div>
        <figure class="pattern-bespoke-photo">
          <img src="${new URL('../../../assets/references/pattern/bespoke-drafting.jpg', import.meta.url).href}" width="1901" height="1267" alt="테일러가 자와 연필을 사용해 종이 위에 개인 패턴을 제도하는 작업 모습" loading="lazy" decoding="async">
        </figure>
      </section>
      <ol class="pattern-process" aria-label="비스포크 패턴 제작 과정">
        <li><span>01 / MEASURE</span><h4>치수와 체형의 이해</h4><p>둘레와 길이, 어깨의 경사와 자세를 함께 살펴봅니다.</p></li>
        <li><span>02 / DRAFT</span><h4>개인을 위한 제도</h4><p>신체의 특징과 착용 여유를 각 패턴의 선과 곡선에 반영합니다.</p></li>
        <li><span>03 / REFINE</span><h4>가봉과 패턴 보정</h4><p>착용 상태에서 균형을 확인하고, 필요한 부분을 정교하게 다듬습니다.</p></li>
      </ol>
      <div class="pattern-layout">
        <div class="pattern-preview">
          <div class="pattern-sheet-header"><span>PATTERN STUDY</span><span>JACKET / VEST / TROUSERS</span></div>
          <div class="pattern-viewport" aria-label="정장 패턴 원본 구성도">${diagram}</div>
          <div class="pattern-sheet-footer"><span class="pattern-legend">빨간 선 · 선택한 패턴</span><span>NOT TO SCALE</span></div>
          <p class="pattern-status" role="status">원본 패턴의 구성과 선을 보여주는 참고 도면입니다. 화면 표시 비율은 실제 재단 축척과 다릅니다.</p>
        </div>
        <div class="pattern-details">
          <p class="pattern-index-label">COMPONENT INDEX <span>01 — 08</span></p>
          <p class="pattern-hint">부위를 선택하면 해당 패턴의 선이 빨간색으로 표시됩니다.</p>
          <fieldset class="pattern-controls" ${options.modelAdapter ? '' : 'hidden'}>
            <legend>구조 살펴보기</legend>
            <label><input class="pattern-auto" type="checkbox" checked> 스크롤과 연결</label>
            <label for="${id}-range">분해 정도 <output class="pattern-value" for="${id}-range">0%</output></label>
            <input id="${id}-range" class="pattern-range" type="range" min="0" max="100" step="1" value="0">
            <div class="pattern-actions"><button type="button" data-progress="0">조립</button><button type="button" data-progress="1">분해</button></div>
          </fieldset>
          <p class="pattern-motion" ${options.modelAdapter ? '' : 'hidden'}></p>
          <div class="pattern-panels" role="group" aria-label="패턴 구성 선택">${panels.map((panel,index) => `<button type="button" data-panel="${panel.id}" aria-pressed="${panel.id === 'front'}" aria-controls="${id}-explanation"><span class="pattern-index-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span>${panel.label}<small lang="en">${panel.english}</small></span></button>`).join('')}</div>
          <div id="${id}-explanation" class="pattern-explanation" aria-live="polite"><p class="pattern-panel-count"></p><h3 class="pattern-panel-title"></h3><p class="pattern-panel-copy"></p></div>
          <p class="pattern-note">선 하나의 차이가 만드는 실루엣.<br>각 조각의 역할과 연결을 살펴보세요.</p>
        </div>
      </div>
    </div>`;
  root.append(section);
  const get = selector => section.querySelector(selector);
  const viewport = get('.pattern-viewport');
  const status = get('.pattern-status');
  const auto = get('.pattern-auto');
  if (!options.modelAdapter) auto.checked = false;
  const range = get('.pattern-range');
  const media = win.matchMedia('(prefers-reduced-motion: reduce)');
  const removers = [];
  let disposed = false;
  let model;
  let progress = 0;
  let selected = 'front';
  let frame = null;
  function listen(target, type, callback, settings) {
    target.addEventListener(type, callback, settings);
    removers.push(() => target.removeEventListener(type, callback, settings));
  }
  function release(candidate) {
    try { candidate?.dispose?.(); } catch { /* Keep section cleanup available if renderer disposal fails. */ }
  }
  function fail() {
    const previous = model;
    model = undefined;
    release(previous);
    viewport.innerHTML = diagram;
    status.hidden = false;
    status.textContent = '3D를 불러오거나 표시하지 못했습니다. 부위 설명과 직접 조작은 계속 사용할 수 있습니다.';
    selectPanel(panels.find(panel => panel.id === selected));
  }
  function updateModel() {
    if (!model) return;
    try {
      model.setProgress(progress);
      model.selectPanel(selected);
    } catch { fail(); }
  }
  function setProgress(value) {
    progress = clamp(value);
    range.value = String(Math.round(progress * 100));
    get('.pattern-value').textContent = `${Math.round(progress * 100)}%`;
    updateModel();
  }
  function measure() {
    frame = null;
    if (disposed || !auto.checked || media.matches) return;
    const bounds = section.getBoundingClientRect();
    setProgress(explosionProgress(scrollProgress(bounds.top, bounds.height, win.innerHeight)));
  }
  function schedule() {
    if (frame === null && !disposed) frame = win.requestAnimationFrame(measure);
  }
  function manual(value) {
    auto.checked = false;
    setProgress(value);
  }
  function motionChanged() {
    auto.disabled = media.matches;
    if (media.matches) auto.checked = false;
    section.classList.toggle('pattern-reduced', media.matches);
    get('.pattern-motion').textContent = media.matches
      ? '동작 줄이기 사용 중: 스크롤 애니메이션은 꺼져 있습니다. 버튼 또는 슬라이더로 정적인 상태를 확인하세요.'
      : '슬라이더는 방향키로도 조작할 수 있습니다.';
    schedule();
  }
  function selectPanel(panel) {
    selected = panel.id;
    get('.pattern-panel-title').textContent = panel.label;
    get('.pattern-panel-copy').textContent = panel.text;
    get('.pattern-panel-count').textContent = panel.count;
    section.querySelectorAll('[data-panel]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.panel === selected)));
    section.querySelectorAll('[data-part]').forEach(part => part.classList.toggle('pattern-active', part.dataset.part === selected));
    updateModel();
  }
  listen(range, 'input', () => manual(Number(range.value) / 100));
  listen(auto, 'change', schedule);
  section.querySelectorAll('[data-progress]').forEach(button => listen(button, 'click', () => manual(Number(button.dataset.progress))));
  section.querySelectorAll('[data-panel]').forEach(button => listen(button, 'click', () => selectPanel(panels.find(panel => panel.id === button.dataset.panel))));
  listen(win, 'scroll', schedule, { passive: true });
  listen(win, 'resize', schedule);
  listen(media, 'change', motionChanged);
  const observer = win.ResizeObserver ? new win.ResizeObserver(schedule) : null;
  observer?.observe(section);
  motionChanged();
  selectPanel(panels[0]);
  if (options.modelAdapter) {
    viewport.replaceChildren();
    status.textContent = '3D 모델을 불러오는 중입니다.';
    Promise.resolve().then(() => disposed ? null : options.modelAdapter.mount(viewport, { panelIds: panels.map(panel => panel.id) })).then(candidate => {
      if (disposed) { release(candidate); return; }
      if (!candidate || !['setProgress', 'selectPanel', 'dispose'].every(key => typeof candidate[key] === 'function')) {
        release(candidate);
        throw new Error('Invalid pattern model adapter');
      }
      model = candidate;
      status.textContent = '3D 검토용 샘플 — 실제 패턴 대응과 시각 품질은 사용자 검토 전입니다.';
      updateModel();
    }).catch(() => { if (!disposed) fail(); });
  }
  return () => {
    if (disposed) return;
    disposed = true;
    removers.forEach(remove => remove());
    observer?.disconnect();
    if (frame !== null) win.cancelAnimationFrame(frame);
    release(model);
    model = undefined;
    section.remove();
  };
}
