export function renderCelebrity({ pages, number = 0, archivePhoto, escape }) {
  const page = Math.min(pages.length || 1, Math.max(1, Number.isInteger(number) ? number : 1));
  const photos = pages[page - 1] || [];
  const offset = pages.slice(0, page - 1).reduce((total, entries) => total + entries.length, 0);

  return `<section class="archive-celebrity-content" aria-labelledby="archive-celebrity-title">
    <header class="archive-celebrity-heading">
      <p class="archive-celebrity-eyebrow">HERITZ ARCHIVE / CELEBRITY</p>
      <h1 id="archive-celebrity-title">Celebrity</h1>
      <p class="archive-celebrity-intro">헤리츠테일러와 함께한 셀럽들의 스타일을 만나보세요.</p>
    </header>
    ${photos.length ? `<div class="archive-celebrity-grid">${photos.map((photo, index) => {
      const entry = String(offset + index + 1).padStart(2, '0');
      return `<figure class="archive-celebrity-entry">
        ${archivePhoto(photo, photo.caption.join(' · ') || `Celebrity 사진 ${entry}`, index === 0)}
        <figcaption class="archive-celebrity-caption">
          <span class="archive-celebrity-number">${entry}</span>
          <div class="archive-celebrity-copy">${photo.caption.map(line => `<p>${escape(line)}</p>`).join('')}</div>
        </figcaption>
      </figure>`;
    }).join('')}</div>` : '<p class="archive-celebrity-empty">등록된 사진이 없습니다.</p>'}
    ${pages.length > 1 ? `<nav class="archive-celebrity-pagination" aria-label="Celebrity 페이지">${pages.map((_, index) => `<a href="#/archive/celebrity/${index + 1}" aria-label="${index + 1} 페이지"${index + 1 === page ? ' aria-current="page"' : ''}>${String(index + 1).padStart(2, '0')}</a>`).join('')}</nav>` : ''}
  </section>`;
}
