import { points, provenance, totalMeasurements } from './content.mjs';

let instance = 0;

export function mount(root, options = {}) {
  if (!root?.ownerDocument) throw new TypeError('measurement.mount requires a DOM element');
  const doc = root.ownerDocument;
  const prefix = `measurement-${++instance}`;
  const el = (tag, className, text) => {
    const node = doc.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const section = el('section', 'measurement');
  const heading = el('h2', 'measurement-title', '몸을 이해하는, 15개의 시선');
  heading.id = `${prefix}-title`;
  section.setAttribute('aria-labelledby', heading.id);
  section.append(el('p', 'measurement-eyebrow', '01 / MEASUREMENT'), heading,
    el('p', 'measurement-lead', `신체 ${totalMeasurements}곳을 정밀하게 측정합니다. 아래에서는 ${points.length}개 대표 부위를 살펴봅니다. 번호를 눌러 부위 안내를 확인하세요.`));
  const notice = el('div', 'measurement-notice');
  notice.append(el('strong', 'measurement-draft', provenance.label), el('p', '', provenance.limitation));
  section.append(notice);

  const layout = el('div', 'measurement-layout');
  const guide = el('div', 'measurement-guide');
  const diagram = el('div', 'measurement-diagram');
  const drawing = el('div', 'measurement-drawing');
  const image = el('img', 'measurement-torso');
  image.src = new URL('../../../assets/measurement/torso-suit.png', import.meta.url).href;
  image.alt = '차콜 정장을 입은 토르소 마네킹. 목부터 어깨, 가슴, 허리, 힙까지 보이는 정면 모습';
  image.width = 1024;
  image.height = 1536;
  image.loading = 'lazy';
  image.decoding = 'async';
  drawing.append(image);
  diagram.append(drawing);
  const buttons = points.map(point => {
    const button = el('button', 'measurement-hotspot', String(point.number).padStart(2, '0'));
    button.type = 'button';
    button.style.left = `${point.x}%`;
    button.style.top = `${point.y}%`;
    button.setAttribute('aria-label', `${point.number}. ${point.title}`);
    button.setAttribute('aria-controls', `${prefix}-detail`);
    diagram.append(button);
    return button;
  });
  guide.append(diagram, el('p', 'measurement-caption', '정장 착용 토르소 이미지 · 핀은 측정 부위 안내입니다.'));

  const panel = el('div', 'measurement-panel');
  const detail = el('div', 'measurement-detail');
  detail.id = `${prefix}-detail`;
  detail.setAttribute('aria-live', 'polite');
  detail.setAttribute('aria-atomic', 'true');
  const count = el('p', 'measurement-counter');
  const title = el('h3', 'measurement-detail-title');
  const description = el('p', 'measurement-description');
  detail.append(count, title, description, el('p', 'measurement-detail-note', '핀은 부위 안내입니다. 실제 치수는 매장에서 측정합니다.'));
  panel.append(detail, el('p', 'measurement-help', '번호 또는 아래 부위를 선택하세요. 번호에서 화살표 키로 이동하고 Home / End로 처음과 끝으로 이동할 수 있습니다.'));
  const list = el('ol', 'measurement-list');
  const listButtons = points.map(point => {
    const item = el('li', 'measurement-list-item');
    const button = el('button', 'measurement-list-button', `${String(point.number).padStart(2, '0')}  ${point.title}`);
    button.type = 'button';
    button.setAttribute('aria-controls', detail.id);
    item.append(button);
    list.append(item);
    return button;
  });
  panel.append(list);
  layout.append(guide, panel);
  section.append(layout);
  const provenanceNote = el('details', 'measurement-provenance');
  provenanceNote.append(el('summary', '', '측정 안내'), el('p', '', provenance.limitation),
    el('p', '', '이 체험은 신체 치수를 입력하거나 수집하지 않습니다.'));
  section.append(provenanceNote);

  let selected = Math.max(0, points.findIndex(point => point.id === options.initialPoint));
  const select = index => {
    selected = index;
    const point = points[index];
    count.textContent = `대표 부위 ${String(point.number).padStart(2, '0')} / ${points.length} · ${point.group}`;
    title.textContent = point.title;
    description.textContent = point.description;
    buttons.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      listButtons[i].setAttribute('aria-pressed', String(i === index));
    });
  };
  const listeners = [];
  const on = (node, event, callback) => {
    node.addEventListener(event, callback);
    listeners.push(() => node.removeEventListener(event, callback));
  };
  buttons.forEach((button, index) => {
    on(button, 'click', () => select(index));
    on(button, 'keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (selected + 1) % points.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (selected + points.length - 1) % points.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = points.length - 1;
      else return;
      event.preventDefault();
      select(next);
      buttons[next].focus();
    });
    on(listButtons[index], 'click', () => select(index));
  });
  select(selected);
  root.append(section);
  return () => {
    listeners.forEach(remove => remove());
    section.remove();
  };
}
