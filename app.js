
'use strict';
/* Standalone, dependency-free review site. No token or private credentials belong here. */
const CONFIG = Object.freeze({owner:'5banjang',repo:'heritz-preview',version:'v1 · 2026-09-30',figma:'https://www.figma.com/design/zGK9SAgj7rX4h02VWxBeLZ'});
const PHOTOS = [{"id": "studio-01", "category": "studio", "label": "스튜디오 촬영", "en": "STUDIO SHOOT", "guide": "신랑 전신 · 스튜디오 배경", "sourceNode": "35:65"}, {"id": "wedding-01", "category": "wedding", "label": "결혼식 본식", "en": "WEDDING DAY", "guide": "신랑·신부 · 예식장 투샷", "sourceNode": "35:74"}, {"id": "studio-02", "category": "studio", "label": "스튜디오 촬영", "en": "STUDIO SHOOT", "guide": "자연스러운 포즈 · 수트 실루엣", "sourceNode": "35:83"}, {"id": "wedding-02", "category": "wedding", "label": "결혼식 본식", "en": "WEDDING DAY", "guide": "버진로드 · 입장 장면", "sourceNode": "35:93"}, {"id": "studio-03", "category": "studio", "label": "스튜디오 촬영", "en": "STUDIO SHOOT", "guide": "커플 촬영 · 착용 모습", "sourceNode": "35:102"}, {"id": "wedding-03", "category": "wedding", "label": "결혼식 본식", "en": "WEDDING DAY", "guide": "신랑 단독 · 예식 당일", "sourceNode": "35:111"}];
const $ = (s,root=document) => root.querySelector(s);
const $$ = (s,root=document) => Array.from(root.querySelectorAll(s));
const isLocal = ['file:','about:','data:'].includes(location.protocol) || ['localhost','127.0.0.1'].includes(location.hostname);
if(location.protocol === 'file:') document.body.classList.add('local-file');
function repositoryConfig(){
  const match=location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
  const path=location.pathname.split('/').filter(Boolean)[0];
  if(match && path && /^[a-z0-9_.-]+$/i.test(path) && !path.endsWith('.html')) return {owner:match[1],repo:path};
  return {owner:CONFIG.owner,repo:CONFIG.repo};
}
const REPO=repositoryConfig();
const REPO_URL=`https://github.com/${encodeURIComponent(REPO.owner)}/${encodeURIComponent(REPO.repo)}`;
const API_URL=`https://api.github.com/repos/${encodeURIComponent(REPO.owner)}/${encodeURIComponent(REPO.repo)}/issues`;
$('#all-issues-link').href=REPO_URL+'/issues';
const sections=Array.from(document.querySelectorAll('[data-review-id]')).map((el,i)=>({id:el.dataset.reviewId,label:el.dataset.reviewLabel,node:el.dataset.figmaId||'',number:String(i+1).padStart(2,'0')}));
const allSections=[{id:'overall',label:'전체 시안',node:'20:38',number:'00'},...sections,...PHOTOS.map((p,i)=>({id:'photo-'+p.id,label:`고객 사진 ${i+1} / ${p.label}`,node:p.sourceNode,number:'P'+(i+1)}))];
let route={page:'home',section:'home',filter:'all',photo:null};
let reviewContext={id:'overall',label:'전체 시안',url:'',node:'20:38',point:null};
let currentPhoto=null, selectedPhotoIds=PHOTOS.map(p=>p.id), beforeModal=null, toastTimer=null;
let pickMode=false,pickHover=null;
let boardItems=[],boardPage=1,boardHasMore=false,boardBusy=false,boardLoaded=false,boardAbort=null;
function setBodyLock(){ document.body.classList.toggle('modal-open',!!document.querySelector('dialog[open]')); }
function openDialog(el){ if(!el.open){beforeModal=document.activeElement;el.showModal();}setBodyLock(); }
function closeDialog(el){ if(el.open)el.close();setBodyLock(); }
$$('dialog').forEach(d=>d.addEventListener('close',setBodyLock));
function toast(message){ clearTimeout(toastTimer);const t=$('#toast');t.textContent=message;t.hidden=false;toastTimer=setTimeout(()=>t.hidden=true,4500); }
async function copyText(value){
  try{if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(value);return true;}}catch(_){}
  const field=document.createElement('textarea');field.value=value;field.setAttribute('readonly','');field.style.cssText='position:fixed;left:0;top:0;opacity:0;width:1px;height:1px;';
  const parent=document.querySelector('dialog[open]')||document.body;parent.append(field);field.focus();field.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}field.remove();return ok;
}
function baseUrl(){if(!isLocal)return location.origin+location.pathname;return `https://${REPO.owner}.github.io/${REPO.repo}/`;}
function shareUrl(hash=location.hash || '#home'){ return baseUrl()+hash; }
function parseRoute(){
 const raw=location.hash.slice(1)||'home';const split=raw.indexOf('?');const path=split<0?raw:raw.slice(0,split);const params=new URLSearchParams(split<0?'':raw.slice(split+1));const photo=params.get('photo');
 if(path==='gallery'||path.startsWith('gallery/')){const f=path.split('/')[1]||'all';return {page:'gallery',section:'gallery',filter:['studio','wedding'].includes(f)?f:'all',photo:PHOTOS.some(p=>p.id===photo)?photo:null};}
 const known=['home','about','groom','family','rental','rental-styles','experience','store','reviews','moments','booking','main-content','tailoring','header','footer'];
 return {page:'home',section:known.includes(path)?path:'home',filter:'all',photo:PHOTOS.some(p=>p.id===photo)?photo:null};
}
function pinFor(id,number,label){
 const b=document.createElement('button');b.type='button';b.className='feedback-pin';b.dataset.feedback=id;b.setAttribute('aria-label',`${label} 수정 의견 남기기`);const n=document.createElement('strong');n.textContent=number;const t=document.createElement('span');t.textContent='의견 남기기';b.append(n,t);return b;
}
sections.forEach(s=>{const el=$(`[data-review-id="${s.id}"]`);const b=pinFor(s.id,s.number,s.label);if(s.id==='header')b.classList.add('header-pin');el.style.position=el.style.position||'relative';el.append(b);});
allSections.forEach(s=>{const option=document.createElement('option');option.value=s.id;option.textContent=`${s.number} · ${s.label}`;$('#review-section').append(option);});
function renderGallery(filter){
 const photos=PHOTOS.filter(p=>filter==='all'||p.category===filter);selectedPhotoIds=photos.map(p=>p.id);const grid=$('#gallery-grid');grid.replaceChildren();
 photos.forEach(p=>{
  const card=document.createElement('article');card.className='gallery-card';card.dataset.reviewId='photo-'+p.id;card.dataset.reviewLabel=p.label+' / '+p.guide;card.dataset.figmaId=p.sourceNode;
  const image=document.createElement('button');image.type='button';image.className='placeholder gallery-photo';image.dataset.photo=p.id;image.setAttribute('aria-label',p.label+' / '+p.guide+' 크게 보기');
  const cat=document.createElement('span');cat.className='photo-label';cat.textContent=p.en;const guide=document.createElement('p');guide.append(document.createTextNode('[실제 고객 사진]'),document.createElement('br'),document.createTextNode(p.guide));image.append(cat,guide);
  const caption=document.createElement('div');caption.className='gallery-caption';const name=document.createElement('span');name.textContent=p.label;const zoom=document.createElement('button');zoom.type='button';zoom.textContent='↗';zoom.dataset.photo=p.id;zoom.setAttribute('aria-label',p.label+' 사진 크게 보기');caption.append(name,zoom);
  card.append(image,caption,pinFor('photo-'+p.id,'P'+(PHOTOS.indexOf(p)+1),p.label+' 사진'));grid.append(card);
 });
 $$('.filter-btn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
 $('#gallery-count').textContent=`${photos.length}개의 사진 자리 · 사진을 선택해 크게 보세요.`;
}
function renderRoute(initial=false){
 const previous=route;route=parseRoute();
 $('#home-view').hidden=route.page!=='home';$('#gallery-view').hidden=route.page!=='gallery';
 $('#site-footer').classList.toggle('gallery-footer',route.page==='gallery');
 document.title=route.page==='gallery'?'고객 갤러리 | 헤리츠 홈페이지 시안 검토':'헤리츠테일러 | 홈페이지 시안 검토';
 $('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');
 if(route.page==='gallery')renderGallery(route.filter);else selectedPhotoIds=PHOTOS.map(p=>p.id);
 if(!route.photo && $('#photo-dialog').open)closeDialog($('#photo-dialog'));
 const sameView=previous.page===route.page && previous.section===route.section;
 if(initial || !sameView){
  requestAnimationFrame(()=>{
   if(route.page==='gallery'){window.scrollTo({top:0,behavior:'instant'});}
   else if(route.section==='tailoring'){showInfo('TAILORING / Bespoke · Sumizura');}
   else if(route.section==='home'||route.section==='header'){window.scrollTo({top:0,behavior:'instant'});}
   else {const el=document.getElementById(route.section==='footer'?'site-footer':route.section);if(el)el.scrollIntoView({block:'start',behavior:'instant'});}
  });
 }
 if(route.photo)showPhoto(route.photo);
}
function openPhoto(id){
 const hash=route.page==='gallery'?(route.filter==='all'?'gallery':'gallery/'+route.filter):(route.section==='home'?'moments':route.section);
 location.hash=hash+'?photo='+encodeURIComponent(id);
}
function showPhoto(id){
 const p=PHOTOS.find(x=>x.id===id);if(!p)return;currentPhoto=p;
 if(!selectedPhotoIds.includes(id))selectedPhotoIds=PHOTOS.map(x=>x.id);
 $('#photo-title').textContent='고객 착용사진 · '+p.label;$('#photo-category').textContent=p.en;
 $('#photo-guide').replaceChildren(document.createTextNode('[실제 고객 사진 삽입]'),document.createElement('br'),document.createTextNode(p.guide),document.createElement('br'),document.createTextNode('사진의 원래 비율을 유지해 전체가 보이도록 배치'));
 $('#photo-position').textContent=`${selectedPhotoIds.indexOf(id)+1} / ${selectedPhotoIds.length}`;openDialog($('#photo-dialog'));
}
function clearPhoto(){if(!$('#photo-dialog').open && !route.photo)return;closeDialog($('#photo-dialog'));const raw=location.hash.split('?')[0];history.replaceState(null,'',raw||'#home');route.photo=null;currentPhoto=null;}
function movePhoto(delta){if(!currentPhoto)return;const i=selectedPhotoIds.indexOf(currentPhoto.id);openPhoto(selectedPhotoIds[(i+delta+selectedPhotoIds.length)%selectedPhotoIds.length]);}
function contextFor(id,point=null){
 const s=allSections.find(s=>s.id===id)||allSections[0];let hash='#home';
 if(s.id.startsWith('photo-')){const p=PHOTOS.find(p=>'photo-'+p.id===s.id);hash='#gallery/'+p.category+'?photo='+p.id;}
 else if(s.id==='gallery-heading')hash='#gallery';
 else if(s.id==='hero')hash='#home';
 else if(s.id==='overall')hash=location.hash||'#home';
 else if(s.id==='footer')hash='#footer';
 else hash='#'+s.id;
 return {id:s.id,label:s.label,url:shareUrl(hash),node:s.node,point};
}
function updateContextUI(){
 $('#review-section').value=reviewContext.id;$('#review-context-title').textContent=reviewContext.label;
 const point=reviewContext.point?` · 선택 위치 ${reviewContext.point.x}%, ${reviewContext.point.y}%`:'';
 $('#review-context-meta').textContent=`${CONFIG.version} · ${innerWidth} × ${innerHeight}${point}`;
}
function showReview(id='overall',tab='write',point=null){
 cancelPick();if($('#photo-dialog').open)clearPhoto();if($('#info-dialog').open)closeDialog($('#info-dialog'));
 reviewContext=contextFor(id,point);updateContextUI();$('#form-status').textContent='';openDialog($('#review-dialog'));switchReviewTab(tab);
}
function switchReviewTab(tab){
 const write=tab==='write';$('#write-panel').hidden=!write;$('#list-panel').hidden=write;$('#write-tab').setAttribute('aria-selected',String(write));$('#list-tab').setAttribute('aria-selected',String(!write));
 if(!write && !boardLoaded && !boardBusy)loadIssues(true);
}
function issueBody(){
 const title=$('#review-summary').value.trim();const detail=$('#review-detail').value.trim();
 const point=reviewContext.point?`\n- 선택 위치: 영역 왼쪽 기준 ${reviewContext.point.x}%, 위쪽 기준 ${reviewContext.point.y}%`:'';
 return `<!-- heritz-review:v1 -->\n## 수정 제안\n${detail||'(수정 의견을 입력해 주세요)'}\n\n## 검토 정보\n- 요약: ${title||'(요약 없음)'}\n- 영역: ${reviewContext.label}\n- 종류: ${$('#review-kind').value}\n- 중요도: ${$('#review-priority').value}\n- 화면: ${innerWidth} × ${innerHeight}\n- 시안: ${CONFIG.version}${point}\n\n## 해당 위치\n${reviewContext.url}\n${reviewContext.node?'\n## Figma 기준\n'+CONFIG.figma+'?node-id='+reviewContext.node.replace(':','-')+'\n':''}\n---\n※ 검토용 시안에 대한 의견입니다. 실제 고객 개인정보나 비공개 자료를 첨부하지 마세요.`;
}
function makeIssueUrl(){
 const title=`[검토] ${reviewContext.label} — ${$('#review-summary').value.trim()}`;
 const u=new URL(REPO_URL+'/issues/new');u.searchParams.set('title',title);u.searchParams.set('body',issueBody());return u.toString();
}
function showInfo(title){
 $('#info-title').textContent=title;let description;
 if(title==='시안 안내') description='이 페이지는 현재 Figma 메인과 고객 갤러리를 브라우저에서 검토하기 위한 시안입니다.\n\n사진은 용도를 적은 빈자리로 유지했습니다. 실제 후기 확인 전 문구에는 예시 표시를 붙였습니다. 가격·한정 인원·매장 정보·예약 연결 주소는 공개 전 클라이언트 확인이 필요합니다.\n\n완성된 화면은 메인과 고객 갤러리입니다. 다른 하위 페이지는 아직 제작 전입니다. 현재 Figma 섹션 순서를 유지했으며 카테고리별 재배치도 의견으로 남길 수 있습니다.\n\n수정 의견은 GitHub 이슈에 공개됩니다. 검색 제외 요청(noindex)을 넣었지만 비공개 접근 제어는 아닙니다.';
 else if(title.includes('예약'))description='검토용 예약 버튼입니다. 실제 상담 신청이나 결제는 진행되지 않습니다.\n\n예약 서비스와 연결 주소는 클라이언트 확인 후 적용합니다.';
 else if(title==='방문 위치 확인')description='매장 안내 연결 영역입니다.\n\n지점별 주소·영업시간·지도 링크는 클라이언트 확인 후 연결합니다. 현재 화면에서는 지도 서비스를 임의로 연결하지 않았습니다.';
 else description='메뉴 구조를 확인하기 위한 항목입니다. 현재 제작된 화면은 메인페이지와 고객 갤러리이며, 이 상세페이지는 아직 제작 전입니다.\n\n원하는 구성이나 필요한 내용을 수정 의견으로 남겨 주세요.';
 $('#info-description').textContent=description;openDialog($('#info-dialog'));
}
function cancelPick(){pickMode=false;document.body.classList.remove('picking');$('#pick-hint').hidden=true;if(pickHover)pickHover.classList.remove('review-pick-hover');pickHover=null;}
function renderIssues(){
 const list=$('#issues-list');list.replaceChildren();const state=$('#issue-state').value;const items=boardItems.filter(i=>!i.pull_request && (state==='all'||i.state===state));
 if(items.length){$('#board-message').textContent=`불러온 의견 ${boardItems.filter(i=>!i.pull_request).length}개 중 ${items.length}개 표시${boardHasMore?' · 더 이전 의견이 있습니다.':''}`;}
 else if(boardLoaded){$('#board-message').textContent=boardItems.length?'선택한 상태의 의견이 없습니다.':'등록된 의견이 없습니다. 첫 수정 의견을 남겨 주세요.';}
 for(const issue of items){
  if(!Number.isInteger(issue.number)||issue.number<1)continue;
  const article=document.createElement('article');article.className='issue-item';const meta=document.createElement('div');meta.className='issue-meta';const status=document.createElement('span');status.className='issue-state';status.textContent=issue.state==='closed'?'완료 / 닫힘':'열린 의견';const number=document.createElement('span');number.textContent='#'+issue.number;meta.append(status,number);
  const a=document.createElement('a');a.className='issue-title';a.href=REPO_URL+'/issues/'+issue.number;a.target='_blank';a.rel='noopener noreferrer';a.textContent=String(issue.title||'(제목 없음)');
  const body=document.createElement('p');body.className='issue-body';let excerpt=String(issue.body||'').replace(/<!--[\s\S]*?-->/g,'').trim();if(excerpt.includes('## 수정 제안'))excerpt=excerpt.split('## 수정 제안')[1].split('## 검토 정보')[0].trim();body.textContent=excerpt.length>230?excerpt.slice(0,230)+'…':excerpt;
  const foot=document.createElement('div');foot.className='issue-footer';const author=document.createElement('span');const date=new Date(issue.created_at);author.textContent=(issue.user&&issue.user.login?String(issue.user.login):'GitHub 사용자')+' · '+(isNaN(date.getTime())?'':date.toLocaleDateString('ko-KR'));
  const reply=document.createElement('a');reply.href=a.href;reply.target='_blank';reply.rel='noopener noreferrer';reply.textContent='답글 '+(Number.isFinite(issue.comments)?issue.comments:0)+'개 ↗';foot.append(author,reply);article.append(meta,a,body,foot);list.append(article);
 }
 $('#more-issues').hidden=!boardHasMore;
}
async function loadIssues(reset=false){
 if(boardBusy)return;boardBusy=true;$('#refresh-issues').disabled=true;$('#more-issues').disabled=true;const next=reset?1:boardPage+1;
 $('#board-message').textContent='GitHub의 공유 의견을 불러오는 중입니다…';
 boardAbort=new AbortController();const timer=setTimeout(()=>boardAbort.abort(),12000);
 try{
  const u=new URL(API_URL);u.searchParams.set('state','all');u.searchParams.set('sort','created');u.searchParams.set('direction','desc');u.searchParams.set('per_page','100');u.searchParams.set('page',String(next));
  const response=await fetch(u.toString(),{method:'GET',headers:{Accept:'application/vnd.github+json'},signal:boardAbort.signal,cache:'no-store'});
  if(!response.ok){if(response.status===404)throw new Error('저장소가 아직 생성되지 않았거나 공개되지 않았습니다. GitHub에 파일을 올린 뒤 다시 확인해 주세요.');if(response.status===403||response.status===429)throw new Error('GitHub의 비로그인 조회 한도에 도달했거나 접근이 제한되었습니다. 아래 GitHub 링크에서 의견을 확인해 주세요.');throw new Error(`의견을 불러오지 못했습니다 (${response.status}). 아래 GitHub 링크에서 확인해 주세요.`);}
  const data=await response.json();if(!Array.isArray(data))throw new Error('의견 목록 응답 형식이 올바르지 않습니다.');
  boardItems=reset?data:boardItems.concat(data.filter(i=>!boardItems.some(j=>j.id===i.id)));boardPage=next;boardHasMore=data.length===100;boardLoaded=true;renderIssues();
 }catch(err){$('#board-message').textContent=err.name==='AbortError'?'연결이 지연되고 있습니다. 새로고침하거나 GitHub에서 직접 확인해 주세요.':(err instanceof TypeError?'네트워크 연결을 확인해 주세요. GitHub에서 직접 의견을 볼 수도 있습니다.':err.message);if(!boardLoaded){$('#issues-list').replaceChildren();$('#more-issues').hidden=true;}}
 finally{clearTimeout(timer);boardBusy=false;$('#refresh-issues').disabled=false;$('#more-issues').disabled=false;}
}
// Delegated events only act on explicitly labelled controls.
document.addEventListener('click',e=>{
 const target=e.target instanceof Element?e.target:null;if(!target)return;
 if(pickMode && !target.closest('.review-toolbar,.pick-hint,dialog')){const el=target.closest('[data-review-id]');if(el){e.preventDefault();e.stopPropagation();const r=el.getBoundingClientRect();const point={x:Math.max(0,Math.min(100,Math.round((e.clientX-r.left)/r.width*100))),y:Math.max(0,Math.min(100,Math.round((e.clientY-r.top)/r.height*100)))};showReview(el.dataset.reviewId,'write',point);return;}}
 const tailoring=target.closest('a[href="#tailoring"]');if(tailoring){e.preventDefault();showInfo('TAILORING / Bespoke · Sumizura');return;}
 const feedback=target.closest('[data-feedback]');if(feedback){e.preventDefault();showReview(feedback.dataset.feedback);return;}
 const photo=target.closest('[data-photo]');if(photo){e.preventDefault();openPhoto(photo.dataset.photo);return;}
 const filter=target.closest('[data-filter]');if(filter){location.hash=filter.dataset.filter==='all'?'gallery':'gallery/'+filter.dataset.filter;return;}
 const info=target.closest('[data-info]');if(info){e.preventDefault();showInfo(info.dataset.info);return;}
},true);
document.addEventListener('pointermove',e=>{if(!pickMode)return;const target=e.target instanceof Element?e.target:null;const el=target&&!target.closest('.review-toolbar,.pick-hint,dialog')?target.closest('[data-review-id]'):null;if(el===pickHover)return;if(pickHover)pickHover.classList.remove('review-pick-hover');pickHover=el;if(el)el.classList.add('review-pick-hover');});
$('#toggle-review').addEventListener('click',()=>{const on=document.body.classList.toggle('review-mode');$('#toggle-review').setAttribute('aria-pressed',String(on));$('#toggle-review').textContent=on?'검토 모드 ON':'검토 모드 OFF';cancelPick();});
$('#pick-target').addEventListener('click',()=>{document.body.classList.add('review-mode','picking');$('#toggle-review').textContent='검토 모드 ON';$('#toggle-review').setAttribute('aria-pressed','true');pickMode=true;$('#pick-hint').hidden=false;});
$('#cancel-pick').addEventListener('click',cancelPick);
$('#share-page').addEventListener('click',async()=>{if(isLocal){toast('아직 공개되지 않은 파일입니다. GitHub Pages 배포 후 웹주소를 공유해 주세요.');return;}toast(await copyText(shareUrl())?'현재 페이지 링크를 복사했습니다.':'링크 복사에 실패했습니다. 주소창의 주소를 복사해 주세요.');});
$('#open-reviews').addEventListener('click',()=>showReview(route.page==='gallery'?'gallery-heading':'overall','list'));
$('#close-review').addEventListener('click',()=>closeDialog($('#review-dialog')));
$('#write-tab').addEventListener('click',()=>switchReviewTab('write'));$('#list-tab').addEventListener('click',()=>switchReviewTab('list'));
$('.drawer-tabs').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=$('#write-tab').getAttribute('aria-selected')==='true'?'list':'write';switchReviewTab(next);$('#'+next+'-tab').focus();}});
$('#review-section').addEventListener('change',e=>{reviewContext=contextFor(e.target.value);updateContextUI();});
$('#copy-context').addEventListener('click',async()=>{const ok=await copyText(reviewContext.url);toast(ok?(isLocal?'배포 후 사용할 위치 링크를 복사했습니다. 현재는 아직 공개 전입니다.':'선택한 위치의 링크를 복사했습니다.'):'복사하지 못했습니다.');});
$('#copy-feedback').addEventListener('click',async()=>{const ok=await copyText(issueBody());toast(ok?'의견 문구를 복사했습니다. 담당자에게 전달해 주세요. 아직 공동 목록에는 등록되지 않았습니다.':'복사에 실패했습니다. 입력한 내용을 직접 선택해 복사해 주세요.');});
$('#feedback-form').addEventListener('submit',async e=>{
 e.preventDefault();if(!$('#feedback-form').reportValidity())return;let url=makeIssueUrl();
 if(url.length>7600){const copied=await copyText(issueBody());if(!copied){$('#form-status').textContent='내용이 길어 자동 전달이 어렵습니다. 의견 문구 복사 후 GitHub 본문에 붙여 넣어 주세요.';return;}const u=new URL(REPO_URL+'/issues/new');u.searchParams.set('title','[검토] '+$('#review-summary').value.trim());url=u.toString();$('#form-status').textContent='의견 전체를 복사했습니다. GitHub 본문에 붙여 넣고 Submit new issue를 눌러 주세요.';}else $('#form-status').textContent='GitHub 작성 화면을 열었습니다. Submit new issue를 눌러야 공유 목록에 등록됩니다. 등록 후 “공유 의견 목록 → 새로고침”으로 확인하세요.';
 const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.style.display='none';document.body.append(link);link.click();link.remove();
});
$('#refresh-issues').addEventListener('click',()=>loadIssues(true));$('#more-issues').addEventListener('click',()=>loadIssues(false));$('#issue-state').addEventListener('change',renderIssues);
$('#menu-toggle').addEventListener('click',()=>{const panel=$('#mobile-nav');panel.hidden=!panel.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!panel.hidden));$('#menu-toggle').setAttribute('aria-label',panel.hidden?'전체 메뉴 열기':'전체 메뉴 닫기');});
$('#close-photo').addEventListener('click',clearPhoto);$('#photo-dialog').addEventListener('cancel',e=>{e.preventDefault();clearPhoto();});$('#prev-photo').addEventListener('click',()=>movePhoto(-1));$('#next-photo').addEventListener('click',()=>movePhoto(1));$('#photo-feedback').addEventListener('click',()=>{if(currentPhoto)showReview('photo-'+currentPhoto.id);});
$('#about-preview').addEventListener('click',()=>showInfo('시안 안내'));$('#close-info').addEventListener('click',()=>closeDialog($('#info-dialog')));$('#info-feedback').addEventListener('click',()=>{const title=$('#info-title').textContent;showReview('overall');if(!$('#review-summary').value)$('#review-summary').value=title+' 관련 수정 제안';});
document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelPick();if($('#photo-dialog').open){if(e.key==='ArrowRight'){e.preventDefault();movePhoto(1);}if(e.key==='ArrowLeft'){e.preventDefault();movePhoto(-1);}}});
window.addEventListener('hashchange',()=>renderRoute(false));
renderRoute(true);
