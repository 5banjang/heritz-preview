import { GROUPS, createState, select, describe } from './state.mjs';

import { renderPreview, renderDetailIcon } from './preview.mjs';

let instance = 0;


/** Browser-local style choices; the 2D schematic is not a realistic garment render. */
export function mount(root, options = {}) {
  let state = createState(options.initialState);
  if (options.onChange !== undefined && typeof options.onChange !== 'function') throw new TypeError('onChange must be a function');
  const doc = root.ownerDocument;
  const prefix = `configurator-${++instance}`;
  const section = doc.createElement('section');
  section.className = 'configurator';
  section.setAttribute('aria-labelledby', `${prefix}-title`);
  section.innerHTML = `
    <header class="configurator-header">
      <p class="configurator-eyebrow">YOUR PERSONAL SELECTION</p>
      <h2 id="${prefix}-title">작은 선택이 만드는 차이.</h2>
      <p>원단부터 바지 밑단까지, 원하는 조합을 골라보세요.</p>
    </header>
    <div class="configurator-layout">
      <div class="configurator-viewport" role="region" aria-label="선택한 스타일 요약">
        <div class="configurator-simulation"></div>
        <div class="configurator-color-study" aria-hidden="true"><span>2D STYLE / COLOR</span><span class="configurator-selected-color"></span></div>
        <div class="configurator-selection-card">
          <p class="configurator-eyebrow">MY SELECTION</p>
          <h3>나의 스타일 노트</h3>
          <dl class="configurator-selected-details"></dl>
          <p class="configurator-caption">임시 2D 구성도입니다. 컬러·라펠·카브라와 뒷면 트임을 비교할 수 있습니다. 원단 브랜드는 이름만 반영하며 실제 질감·핏·색상을 재현하지 않습니다.</p>
        </div>
        <p class="configurator-pending">제공해 주신 SVG 원본의 라펠·트임·바지 경로를 사용한 2D 도식입니다. 3D 미리보기는 준비 중입니다.</p>
      </div>
      <div class="configurator-controls">
        <p class="configurator-note" id="${prefix}-note">각 항목에서 하나씩 선택하면 2D 구성도와 스타일 노트에 바로 반영됩니다.</p>
        <div class="configurator-groups" aria-describedby="${prefix}-note"></div>
        <div class="configurator-summary"><span>현재 선택</span><p role="status" aria-live="polite" aria-atomic="true"></p></div>
        <button type="button" class="configurator-reset">기본 선택으로 돌아가기 ↺</button>
      </div>
    </div>`;
  const groups = section.querySelector('.configurator-groups');
  const summary = section.querySelector('[role="status"]');
  const selectedDetails = section.querySelector('.configurator-selected-details');
  const colorStudy = section.querySelector('.configurator-color-study');
  const colorLabel = section.querySelector('.configurator-selected-color');
  const reset = section.querySelector('.configurator-reset');
  const simulation = section.querySelector('.configurator-simulation');
  const detailValues = new Map();
  const radios = [];
  for (const group of GROUPS) {
    const term = doc.createElement('dt');
    term.textContent = group.label;
    const detail = doc.createElement('dd');
    selectedDetails.append(term, detail);
    detailValues.set(group.key, detail);
    const fieldset = doc.createElement('fieldset');
    fieldset.className = 'configurator-group';
    fieldset.dataset.group = group.key;
    const legend = doc.createElement('legend');
    legend.textContent = group.label;
    fieldset.append(legend);
    for (const [value, label, color] of group.choices) {
      const choice = doc.createElement('label');
      choice.className = 'configurator-choice';
      const input = doc.createElement('input');
      input.type = 'radio';
      input.name = `${prefix}-${group.key}`;
      input.value = value;
      input.dataset.key = group.key;
      input.checked = state[group.key] === value;
      radios.push(input);
      const caption = doc.createElement('span');
      caption.className = 'configurator-choice-caption';
      if (['lapel', 'vent', 'cuff'].includes(group.key)) {
        const icon = doc.createElement('span');
        icon.className = 'configurator-detail-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = renderDetailIcon(group.key, value);
        caption.append(icon);
      }
      if (color) {
        const swatch = doc.createElement('span');
        swatch.className = 'configurator-color';
        swatch.style.backgroundColor = color;
        swatch.setAttribute('aria-hidden', 'true');
        caption.append(swatch);
      }
      caption.append(doc.createTextNode(label));
      choice.append(input, caption);
      fieldset.append(choice);
    }
    groups.append(fieldset);
  }
  function renderSelection() {
    simulation.innerHTML = renderPreview(state);
    for (const group of GROUPS) {
      const choice = group.choices.find(([value]) => value === state[group.key]);
      detailValues.get(group.key).textContent = choice[1];
      if (group.key === 'color') {
        colorStudy.style.backgroundColor = choice[2];
        colorLabel.textContent = choice[1];
        colorStudy.dataset.light = String(choice[0] === 'light-grey');
      }
    }
    summary.textContent = describe(state);
  }
  renderSelection();
  const change = event => {
    const input = event.target;
    if (input.tagName !== 'INPUT' || input.type !== 'radio' || !input.checked || !input.dataset.key) return;
    state = select(state, input.dataset.key, input.value);
    renderSelection();
    options.onChange?.(state);
  };
  const resetSelection = () => {
    state = createState();
    for (const radio of radios) radio.checked = state[radio.dataset.key] === radio.value;
    renderSelection();
    options.onChange?.(state);
  };
  section.addEventListener('change', change);
  reset.addEventListener('click', resetSelection);
  root.append(section);
  return () => {
    section.removeEventListener('change', change);
    reset.removeEventListener('click', resetSelection);
    section.remove();
  };
}
