// User-provided total and representative regions; descriptions remain editorial drafts.
export const totalMeasurements = 15;
export const provenance = Object.freeze({
  status: 'representative',
  label: '15곳의 정밀 측정 · 대표 5곳 안내',
  basis: '총 15곳의 정밀 측정과 목·어깨·상동·중동·힙의 대표 핀은 헤리츠테일러 페이지를 위한 제공 정보입니다.',
  limitation: '5개 대표 부위는 전체 15개 측정 항목의 목록이 아닙니다. 각 핀은 부위를 살펴보기 위한 안내입니다.',
});
const entries = [
  ['neck', '목', '상체', 50, 15, '목을 감싸는 부분을 살펴봅니다. 칼라가 놓이는 위치와 목 주변의 여유를 이해하는 부위입니다.'],
  ['shoulder', '어깨', '상체', 23, 26, '목에서 팔로 이어지는 어깨를 살펴봅니다. 자켓의 어깨선과 전체 균형을 이루는 부분입니다.'],
  ['chest', '상동', '가슴', 50, 39, '가슴 높이의 몸통을 뜻합니다. 상체의 볼륨과 자켓 앞판의 여유를 살펴보는 부위입니다.'],
  ['waist', '중동', '허리', 50, 58, '허리 높이의 몸통을 뜻합니다. 가슴에서 허리로 이어지는 실루엣을 살펴보는 부위입니다.'],
  ['hip', '힙', '하체', 67, 75, '골반과 엉덩이 주변을 살펴봅니다. 자켓 아래쪽과 바지의 균형을 이해하는 부위입니다.'],
];
export const points = Object.freeze(entries.map(([id, title, group, x, y, description], index) =>
  Object.freeze({ id, title, group, x, y, description, number: index + 1, status: 'representative' })));
