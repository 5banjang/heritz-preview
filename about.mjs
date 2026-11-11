const profiles = [
  { name: '서계용', role: '마스터 테일러', career: [
    ['2015–현재', '테일러 아카데미 특임강사'],
    ['', '서울 복장 노동조합 위원장'],
    ['2014–현재', '헤리츠테일러 마스터 테일러'],
    ['1998–2015', 'Novotel Ambassador Hotel 강남 D.Custom Tailor'],
    ['1992–1998', '소공동 보람양복점'],
    ['1977–1992', '명동 Mr. Guy Tailor'],
  ] },
  { name: '이희택', role: '마스터 테일러', career: [
    ['2026–현재', '헤리츠테일러'],
    ['2020–2025', '로페로테일러'],
    ['2005–2020', '이태원 머큐리'],
    ['2003–2005', '르네상스호텔 제왕 양복점'],
    ['1996–2003', '플라지호텔 20세기 양복점'],
    ['1989–1996', '롯데호텔 해창 양복점'],
    ['1983–1989', '소공동 뉴라이프 양복점'],
    ['1980–1983', '시청 AQ 양복점'],
    ['1975–1980', '을지로 광교 로마 양복점'],
  ] },
  { name: '김법곤', role: '마스터 테일러', career: [
    ['2015–현재', '헤리츠테일러 테일러'],
    ['2010–2014', '피치라인'],
    ['1991–2008', '영패션'],
  ] },
];
const history = [
  ['1977–1992', '명동 Mr. Guy Tailor 근무'],
  ['1992–1998', '소공동 보람양복점 근무'],
  ['1998–2015', 'Novotel Ambassador Hotel 강남 D.Custom Tailor 근무'],
  ['2014', '헤리츠테일러 브랜드 런칭'],
  ['2015', '매장 확장 이전'],
  ['2016', '법인 전환'],
];

export function renderAbout(sitePath) {
  return `<main id="main" class="about-main">
    <nav class="about-rail" aria-label="브랜드 페이지 목차"><a href="#brand-intro" aria-current="location"><span>01</span>브랜드 소개</a><a href="#brand-history"><span>02</span>브랜드 연혁</a><a href="#brand-bi"><span>03</span>B.I Guide</a></nav>
    <section id="brand-intro" class="about-intro" aria-labelledby="about-title">
      <div class="about-opening"><img class="about-cover" src="${sitePath('assets/about/store-hero-1920.webp')}" srcset="${sitePath('assets/about/store-hero-960.webp')} 960w, ${sitePath('assets/about/store-hero-1920.webp')} 1920w" sizes="100vw" alt="헤리츠테일러 매장의 피팅 공간과 전시된 수트" width="1901" height="1267" fetchpriority="high" decoding="async"><p class="about-kicker">Heritz Tailor</p><h1 id="about-title">한 편의 영화처럼,<br>두 분의 시작에.</h1><p class="about-promise">두분의 결혼이 한 편의 영화 같을 수 있도록 헤리츠테일러의 수트가 함께 하겠습니다.</p><span class="about-edition">브랜드 소개</span></div>
      <div class="about-story"><figure><img src="${sitePath('tailoring/assets/hero/tailoring-work.jpg')}" alt="수트를 만드는 테일러의 작업 모습" width="1600" height="1067" decoding="async"><figcaption>한 사람을 위한 한 벌의 과정.</figcaption></figure><div class="about-prose"><h2>좋은 수트의 기준은,<br>입는 사람입니다.</h2><p>두 분의 결혼이 한 편의 영화처럼 오래도록 기억될 수 있도록, 헤리츠테일러의 수트가 함께하겠습니다. 헤리츠테일러는 클래식한 수트의 품격을 바탕으로 개인의 취향과 개성을 담은 웨딩 스타일을 제안합니다. 인생의 새로운 시작을 앞둔 당신에게 가장 잘 어울리는 한 벌을 고민하며, 두 사람이 함께하는 장면을 더욱 아름답게 완성하고자 합니다.</p><p>헤리츠테일러는 좋은 수트의 기준을 입는 사람에게서 찾습니다. 고객의 체형과 움직임, 평소의 취향과 예식의 분위기를 세심하게 살피고 원단과 색상, 실루엣과 디테일까지 조화롭게 제안합니다. 상담부터 스타일을 완성하는 과정까지 각 선택에 필요한 설명을 더해, 수트가 익숙하지 않은 고객도 자신에게 어울리는 방향을 찾을 수 있도록 돕습니다. 격식을 갖춘 외형과 자연스러운 착용감이 어우러지는 것, 그것이 헤리츠테일러가 추구하는 수트의 가치입니다.</p><p>시간이 지나도 빛을 잃지 않는 스타일과 변함없는 정성으로, 두 분의 시작을 함께하고 앞으로 이어질 삶의 소중한 장면에도 어울리는 수트를 제안하겠습니다.</p></div></div>
      <section class="about-people" aria-labelledby="people-title"><div class="about-section-heading"><p>한 벌을 만드는 사람들</p><h2 id="people-title">Master Tailor</h2></div><div class="about-profiles">${profiles.map(person => `<article class="about-profile"><div class="about-portrait" role="img" aria-label="${person.name} 개인 사진 준비 중"><span>개인 사진 준비 중</span></div><p class="about-role">${person.role}</p><h3>${person.name}</h3><ul class="about-career">${person.career.map(([date, text]) => `<li>${date ? `<span>${date}</span>` : ''}<p>${text}</p></li>`).join('')}</ul></article>`).join('')}</div></section>
    </section>
    <section id="brand-history" class="about-history" aria-labelledby="history-title"><div class="about-history-heading"><p>브랜드 연혁</p><h2 id="history-title">시간이 쌓여,<br>한 벌의 품격으로.</h2><p class="about-history-note">테일러의 발자취에서<br>헤리츠테일러의 시작까지.</p></div><ol>${history.map(([date, text]) => `<li><span class="about-year">${date}</span><p>${text}</p></li>`).join('')}</ol><a class="about-home" href="${sitePath('')}">메인페이지로 돌아가기</a></section>
    <section id="brand-bi" class="about-bi" aria-labelledby="bi-title">
      <div class="about-bi-heading"><p>헤리츠테일러의 브랜드 아이덴티티</p><h2 id="bi-title">B.I Guide</h2><p class="about-bi-intro">헤리츠테일러의 로고는 브랜드의 이름과 정체성을 전하는 시각적 요소입니다. 매체와 공간에 맞는 구성을 선택하되, 로고의 형태와 비례를 일관되게 유지합니다.</p></div>
      <article class="about-logo"><figure><img src="${sitePath('assets/brand/heritz-horizontal.svg')}" alt="HERITZ TAILOR 아래에 SINCE 1977이 배치된 가로형 로고" loading="lazy" decoding="async"></figure><div><h3>가로형 로고</h3><p class="about-logo-en">Horizontal logo</p><p>HERITZ TAILOR의 영문명과 SINCE 1977을 함께 배치한 구성입니다. 긴 가로 비례를 살릴 수 있는 공간에 사용합니다.</p></div></article>
      <article class="about-logo"><figure class="about-logo-combination"><img src="${sitePath('assets/brand/heritz-combination.svg')}" alt="상단 심볼과 두 줄의 HERITZ TAILOR 영문명이 결합된 로고" loading="lazy" decoding="async"></figure><div><h3>심볼 조합형 로고</h3><p class="about-logo-en">Combination logo</p><p>상단 심볼과 두 줄의 영문명을 결합한 구성입니다. 심볼과 브랜드 이름이 하나의 형태로 읽히도록 원본의 배치와 간격을 유지합니다.</p></div></article>
      <article class="about-logo"><figure class="about-logo-wordmark"><img src="${sitePath('assets/brand/heritz-wordmark.png')}" alt="세리프 서체의 HERITZ TAILOR 워드마크" loading="lazy" decoding="async"></figure><div><h3>워드마크 로고</h3><p class="about-logo-en">Wordmark logo</p><p>세리프 서체로 브랜드 이름을 표현한 구성입니다. 글자의 형태와 간격, 가로 비례를 유지해 사용합니다.</p></div></article>
      <div class="about-bi-usage"><h3>로고 사용 안내</h3><p>로고를 가로 또는 세로로 늘리거나, 일부 요소를 임의로 재배치하지 않습니다. 복잡한 사진이나 무늬 위에서는 로고가 명확하게 보이는 공간을 확보해 주세요.</p><a class="about-bi-download" href="${sitePath('assets/brand/heritz-logo.ai')}" download="HERITZ-TAILOR-logo.ai">로고 원본 다운로드 <span>AI</span></a></div>
    </section>
  </main>`;
}

export function mountAbout(root = document.querySelector('.about-main')) {
  if (!root) return;
  const links = [...root.querySelectorAll('.about-rail a')];
  const sections = links.map(link => root.querySelector(link.getAttribute('href')));
  let frame;
  const update = () => {
    frame = undefined;
    const active = sections.reduce((current, section, index) => section.getBoundingClientRect().top <= window.innerHeight * .4 ? index : current, 0);
    links.forEach((link, i) => i === active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
  };
  const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (frame !== undefined) cancelAnimationFrame(frame);
  };
}
