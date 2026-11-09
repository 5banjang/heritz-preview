export const storeInfo = Object.freeze({ name: '헤리츠테일러', address: '서울 강남구 압구정로 72길 21, 2층', hours: '11:00–20:00', phone: '02-511-9876', bookingUrl: '' });

// Only direct HTTPS Naver booking destinations; shortened URLs need separate review.
export function safeBookingUrl(value) {
  if (typeof value !== 'string' || !value.trim() || /[\u0000-\u001f\u007f\\]/u.test(value)) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !['booking.naver.com', 'm.booking.naver.com'].includes(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function visitState(data = {}) {
  const info = data ?? {};
  const display = value => typeof value === 'string' && value.trim() ? value.trim() : '준비 중';
  const address = display(info.address), phone = display(info.phone);
  const phoneUrl = /^0\d{1,2}-\d{3,4}-\d{4}$/.test(phone) ? `tel:${phone.replaceAll('-', '')}` : null;
  const mapUrl = address !== '준비 중' ? `https://map.naver.com/p/search/${encodeURIComponent(address)}` : null;
  return { name: typeof info.name === 'string' && info.name.trim() ? info.name.trim() : storeInfo.name,
    address, hours: display(info.hours), phone, phoneUrl, mapUrl, bookingUrl: safeBookingUrl(info.bookingUrl) };
}

export function mount(root, options = {}) {
  if (!root?.ownerDocument) throw new TypeError('visit.mount requires a DOM element');
  const state = visitState(options.storeInfo ?? storeInfo);
  const doc = root.ownerDocument;
  const element = (tag, className, text) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const section = element('section', 'visit-section');
  section.setAttribute('aria-label', '매장 안내 및 예약');
  section.lang = 'ko';
  const intro = element('div', 'visit-intro');
  intro.append(
    element('p', 'visit-eyebrow', '05 / MASTERPIECE'),
    element('h2', 'visit-title', '당신의 한 벌을\n만나는 곳'),
    element('p', 'visit-store-name', state.name),
    element('p', 'visit-description', '한 벌의 옷은 당신을 만날 때 완성됩니다. 매장에서 원단과 디테일을 직접 살펴보세요.')
  );
  const details = element('div', 'visit-details');
  const list = element('dl', 'visit-info');
  for (const [label, value] of [['주소', state.address], ['영업시간', state.hours]]) {
    const row = element('div', 'visit-row');
    row.append(element('dt', 'visit-label', label), element('dd', 'visit-value', value));
    list.append(row);
  }
  const phoneRow = element('div', 'visit-row');
  const phoneValue = element('dd', 'visit-value');
  if (state.phoneUrl) {
    const link = element('a', 'visit-phone', state.phone);
    link.href = state.phoneUrl;
    link.setAttribute('aria-label', `${state.name} 전화하기 ${state.phone}`);
    phoneValue.append(link);
  } else phoneValue.textContent = state.phone;
  phoneRow.append(element('dt', 'visit-label', '전화'), phoneValue);
  list.append(phoneRow);
  const booking = element('div', 'visit-booking');
  if (state.bookingUrl) {
    const link = element('a', 'visit-action', '네이버에서 예약하기 ↗');
    link.href = state.bookingUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', '네이버에서 예약하기 (새 탭)');
    booking.append(link, element('p', 'visit-note', '네이버 예약이 새 탭에서 열립니다.'));
  } else {
    const link = element('a', 'visit-action', '예약 안내 보기 ↗');
    link.href = '../#/main/booking';
    booking.append(link, element('p', 'visit-note', '헤리츠테일러 홈페이지의 예약 안내로 이동합니다.'));
  }
  details.append(list, booking);
  if (state.mapUrl) {
    const map = element('a', 'visit-map-link', '네이버 지도에서 주소 검색 ↗');
    map.href = state.mapUrl;
    map.target = '_blank';
    map.rel = 'noopener noreferrer';
    map.setAttribute('aria-label', '네이버 지도에서 매장 주소 검색 (새 탭)');
    details.append(map);
  }
  section.append(intro, details);
  root.append(section);
  return () => section.remove();
}
