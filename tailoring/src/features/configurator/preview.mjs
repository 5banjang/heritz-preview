import { GROUPS, createState, describe } from './state.mjs';
import { vectors } from './vectors.mjs';

function drawing(group, value, placement = '') {
  const vector = vectors[group][value];
  return `<svg viewBox="${vector.viewBox}" ${placement}>${vector.markup}</svg>`;
}

export function renderDetailIcon(group, value) {
  createState({ [group]: value });
  return drawing(group, value, 'width="84" height="70" aria-hidden="true" style="--suit-line:#000000"');
}

/** Supplied Illustrator paths; color is illustrative, not a fabric or fit simulation. */
export function renderPreview(selection) {
  const state = createState(selection);
  const color = GROUPS.find(group => group.key === 'color').choices.find(choice => choice[0] === state.color)[2];
  return `<svg class="configurator-suit" viewBox="0 0 454 483" role="img" aria-label="2D 정장 구성도: ${describe(state)}" data-lapel="${state.lapel}" data-vent="${state.vent}" data-cuff="${state.cuff}" data-fabric="${state.fabric}" style="--suit-color:${color};--suit-line:#000000">
    ${drawing('lapel', state.lapel, 'x="35" y="32" width="187" height="249"')}
    ${drawing('vent', state.vent, 'x="64" y="295" width="132" height="150"')}
    ${drawing('cuff', state.cuff, 'x="272" y="35" width="119" height="390"')}
  </svg>`;
}
