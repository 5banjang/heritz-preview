// Labels preserve the brief; they are not verified store inventory or tailoring claims.
export const GROUPS = Object.freeze([
  { key: 'fabric', label: '원단', choices: [['retini', '레티니'], ['howard-hardy', '하워드하디'], ['drape', '드레이프'], ['scabal', '스카발']] },
  { key: 'color', label: '컬러', choices: [['black', '블랙', '#0a0a0a'], ['charcoal', '차콜', '#141414'], ['dark-navy', '다크네이비', '#0a0914'], ['light-grey', '라이트 그레이', '#b7b7b3']] },
  { key: 'lapel', label: '라펠', choices: [['notched', '노치드'], ['peaked', '피크드'], ['shawl', '숄']] },
  { key: 'vent', label: '트임', choices: [['double-vent', '더블 벤트'], ['vent', '벤트'], ['slit', '슬릿']] },
  { key: 'cuff', label: '바지 밑단', choices: [['none', '기본'], ['turned-up', '카브라']] },
].map(group => Object.freeze({ ...group, choices: Object.freeze(group.choices.map(Object.freeze)) })));

export const DEFAULT_STATE = Object.freeze(Object.fromEntries(GROUPS.map(group => [group.key, group.choices[0][0]])));

export function createState(initial = {}) {
  if (!initial || typeof initial !== 'object' || Array.isArray(initial)) throw new TypeError('Expected selection object');
  for (const [key, value] of Object.entries(initial)) {
    const group = GROUPS.find(group => group.key === key);
    if (!group?.choices.some(choice => choice[0] === value)) throw new RangeError(`Invalid selection: ${key}`);
  }
  return Object.freeze({ ...DEFAULT_STATE, ...initial });
}

export function select(state, key, value) {
  return createState({ ...state, [key]: value });
}

export function describe(state) {
  const valid = createState(state);
  return GROUPS.map(group => group.choices.find(choice => choice[0] === valid[group.key])[1]).join(' · ');
}
