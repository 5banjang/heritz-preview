const escapeAttribute = value => String(value).replace(/[&"<>']/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;', "'": '&#39;' })[character]);

export function renderArchiveNav(active, sitePath) {
  const current = ['all', 'studio', 'ceremony'].includes(active) ? 'customer' : active;
  const links = [
    ['overview', 'Archive', sitePath('archive/')],
    ['lookbook', 'Look book', '#/archive/lookbook'],
    ['celebrity', 'Celebrity', '#/archive/celebrity'],
    ['customer', '고객 갤러리', '#/archive/all'],
  ];
  return `<nav class="archive-category-nav" aria-label="아카이브 카테고리">${links.map(([key, label, href]) => `<a href="${escapeAttribute(href)}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}

export function renderArchiveOverview({ archive, design, escape, archivePhoto, photo }) {
  const lookbook = archive.lookbooks[0];
  return `<section class="archive-overview-intro" aria-labelledby="archive-title">
    <p class="archive-overview-eyebrow">HERITZ TAILOR / ARCHIVE</p>
    <h1 id="archive-title">Archive</h1>
    <div class="archive-overview-deck"><p>옷과 사람, 그 사이의 기록.</p><p>헤리츠의 룩북부터 셀러브리티의 스타일,<br>고객의 소중한 순간까지 만나보세요.</p></div>
  </section>
  <section class="archive-overview-lookbook" aria-labelledby="archive-lookbook-title">
    <div class="archive-overview-copy"><p class="archive-overview-eyebrow">01 / COLLECTION</p><h2 id="archive-lookbook-title">Look book</h2><p>실루엣과 디테일로 전하는 헤리츠의 시선.<br>룩북 속 다양한 수트의 표정을 살펴보세요.</p><a class="archive-overview-link" href="#/archive/lookbook">룩북 살펴보기 <span aria-hidden="true">↗</span></a></div>
    <figure class="archive-overview-image">${archivePhoto(lookbook.photos[0], `헤리츠 룩북 — ${lookbook.title}`, true)}<figcaption>${escape(lookbook.title)}</figcaption></figure>
  </section>
  <section class="archive-overview-celebrity" aria-labelledby="archive-celebrity-title">
    <div class="archive-overview-copy"><p class="archive-overview-eyebrow">02 / PEOPLE</p><h2 id="archive-celebrity-title">Celebrity</h2><p>각자의 개성으로 완성되는 한 벌.<br>셀러브리티와 함께한 스타일을 모았습니다.</p><a class="archive-overview-link" href="#/archive/celebrity">셀러브리티 살펴보기 <span aria-hidden="true">↗</span></a></div>
    <figure class="archive-overview-image">${archivePhoto(archive.celebrity[0][0], '헤리츠 셀러브리티 아카이브', false)}</figure>
  </section>
  <section class="archive-overview-customer" aria-labelledby="archive-customer-title">
    <div class="archive-overview-copy"><p class="archive-overview-eyebrow">03 / MOMENTS</p><h2 id="archive-customer-title">고객 갤러리</h2><p>한 사람의 취향, 두 사람의 특별한 날.<br>스튜디오와 본식에 담긴 고객의 순간을 만나보세요.</p><a class="archive-overview-link" href="#/archive/all">고객 갤러리 살펴보기 <span aria-hidden="true">↗</span></a></div>
    <figure class="archive-overview-image">${photo(design.all[0], '헤리츠 고객 갤러리 — 스튜디오 촬영')}</figure>
  </section>`;
}
