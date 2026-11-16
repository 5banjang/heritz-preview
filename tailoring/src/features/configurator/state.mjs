// Labels preserve the brief; they are not verified store inventory or tailoring claims.
export const GROUPS = Object.freeze([
  { key: 'color', label: '컬러', choices: [['black', '블랙', '#000000'], ['charcoal', '차콜', '#0c0c0c'], ['dark-navy', '다크네이비', '#040414'], ['light-grey', '라이트 그레이', '#94979b']] },
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
