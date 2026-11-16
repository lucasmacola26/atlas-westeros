'use strict';
(() => {
const $=id=>document.getElementById(id);
const BOOKS=window.ATLAS_BOOKS;
const DEFAULTS=window.ATLAS_CATALOG;
const CURATED_SCENES=window.ATLAS_CURATED_SCENES||{};
const STORE='atlas-v3';
let characters=[];
let read={book:'acok',chapter:55,mode:'scene',finished:false};
let editId=null;
let db;
let toastTimeout;

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const bk=id=>BOOKS.find(b=>b.id===id)||BOOKS[0];
const bookPosition=id=>BOOKS.findIndex(b=>b.id===id);
const chapterKey=(book,chapter)=>`${book}:${chapter}`;
const comp=(aBook,aChapter,bBook,bChapter)=>bookPosition(aBook)-bookPosition(bBook)||aChapter-bChapter;
const chaptersOf=id=>bk(id).chapters;
const clone=v=>JSON.parse(JSON.stringify(v));
const validSrc=src=>typeof src==='string' && (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(src)||/^\.\/retratos\/(mini|grandes)\/[a-z0-9-]+\.webp$/i.test(src))?src:'';
// O capítulo selecionado pode ainda estar em andamento: nesse caso, escondemos
// qualquer informação introduzida nele e revelamos apenas até o capítulo anterior.
const safeLimit=()=>{
 if(read.finished)return {book:read.book,chapter:read.chapter};
 if(read.chapter>0)return {book:read.book,chapter:read.chapter-1};
 const idx=bookPosition(read.book);
 return idx>0?{book:BOOKS[idx-1].id,chapter:BOOKS[idx-1].chapters.length-1}:null;
};
const safeComp=(book,chapter)=>{const limit=safeLimit();return limit?comp(book,chapter,limit.book,limit.chapter)<=0:false;};
const isKnown=c=>safeComp(c.intro[0],Number(c.intro[1]));
const profile=c=>{
 const result={name:c.name,house:c.house||'',age:c.age||'',role:c.role||'',appearance:c.appearance||'',note:c.note||'',portrait:validSrc(c.portrait),thumb:validSrc(c.thumb)};
 for (const u of (c.updates||[]).slice().sort((a,b)=>comp(a.book,a.chapter,b.book,b.chapter))) {
  if(safeComp(u.book,u.chapter)){
   for(const field of ['name','house','age','role','appearance','note','portrait'])if(typeof u[field]==='string'){result[field]=field==='portrait'?validSrc(u[field]):u[field];if(field==='portrait')result.thumb=result.portrait;}
  }
 }
 return result;
};
const povNames={
  'got:0':'Will','acok:0':'Cressen',
  'affc:11':'Asha Greyjoy','affc:23':'Sansa Stark','affc:34':'Arya Stark','affc:41':'Sansa Stark',
  'adwd:12':'Theon Greyjoy','adwd:20':'Theon Greyjoy','adwd:26':'Asha Greyjoy',
  'adwd:32':'Theon Greyjoy','adwd:37':'Theon Greyjoy','adwd:41':'Theon Greyjoy',
  'adwd:42':'Asha Greyjoy','adwd:45':'Arya Stark','adwd:46':'Theon Greyjoy',
  'adwd:51':'Theon Greyjoy','adwd:62':'Asha Greyjoy','adwd:64':'Arya Stark'
};
const povFor=(book,chapter)=>{
 const key=chapterKey(book,chapter);
 if(povNames[key])return povNames[key];
 const title=chaptersOf(book)[chapter]||'';
 const first=title.split(' ')[0];
 const match=characters.find(c=>c.name.split(' ')[0]===first);
 return match?match.name:'';
};
const isPOV=c=>c.name===povFor(read.book,read.chapter);
const sceneHas=c=>{
 const key=chapterKey(read.book,read.chapter);
 return (c.scenes||[]).includes(key)||isPOV(c);
};
const sceneVisible=c=>sceneHas(c) && (isKnown(c)||isPOV(c));

const notify=message=>{
 const el=$('toast');el.textContent=message;el.classList.remove('hidden');
 clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.add('hidden'),3500);
};
function initDB(){return new Promise((resolve,reject)=>{
 if(!window.indexedDB){reject(new Error('Armazenamento indisponível'));return;}
 const req=indexedDB.open('atlas-westeros-db',1);
 req.onupgradeneeded=()=>{req.result.createObjectStore('kv');};
 req.onsuccess=()=>resolve(req.result);
 req.onerror=()=>reject(req.error);
});}
function dbGet(key){return new Promise((resolve,reject)=>{const tx=db.transaction('kv','readonly');const req=tx.objectStore('kv').get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function dbSet(key,value){return new Promise((resolve,reject)=>{const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
async function save(){
 try{await dbSet(STORE,characters);$('saveIndicator').textContent='biblioteca salva neste aparelho';}
 catch(e){notify('Não foi possível guardar. Exporte um backup.');console.error(e);}
}
function saveProgress(){try{localStorage.setItem('atlas-reading-v1',JSON.stringify(read));}catch(e){}}
function restoreProgress(){try{const p=JSON.parse(localStorage.getItem('atlas-reading-v1')||'null');if(p&&BOOKS.some(b=>b.id===p.book)){read={book:p.book,chapter:Math.min(Math.max(Number(p.chapter)||0,0),chaptersOf(p.book).length-1),mode:['scene','known'].includes(p.mode)?p.mode:'scene',finished:p.finished===true};}}catch(e){}}
function fillBookSelect(node,selected){node.innerHTML=BOOKS.map(b=>`<option value="${b.id}" ${b.id===selected?'selected':''}>${esc(b.short)} · ${esc(b.title)}</option>`).join('');}
function fillChapterSelect(node,book,selected){
 node.innerHTML=chaptersOf(book).map((title,i)=>`<option value="${i}" ${i===Number(selected)?'selected':''}>${i===0?'00 — ':String(i).padStart(2,'0')+' — '}${esc(title)}</option>`).join('');
}
function renderReader(){
 fillBookSelect($('bookSelect'),read.book);fillChapterSelect($('chapterSelect'),read.book,read.chapter);
 const chapTitle=chaptersOf(read.book)[read.chapter];
 $('chapterCaption').textContent=read.chapter===0?'Prólogo':`Capítulo ${read.chapter} · ${chapTitle}`;
 $('chapterCounter').textContent=`${String(read.chapter+1).padStart(2,'0')} / ${chaptersOf(read.book).length}`;
 $('progressFill').style.width=`${((read.chapter+1)/chaptersOf(read.book).length)*100}%`;
 $('prevBtn').disabled=read.chapter===0;$('nextBtn').disabled=read.chapter===chaptersOf(read.book).length-1;
 for(const mode of ['scene','known','archive']){
  const el=$(mode==='scene'?'sceneMode':mode==='known'?'knownMode':'allMode');
  el.classList.toggle('active',read.mode===mode);
  el.setAttribute('aria-pressed',String(read.mode===mode));
 }
 $('directoryTitle').textContent=read.mode==='scene'?'Neste capítulo':read.mode==='known'?'Conhecidos até aqui':'Acervo de retratos';
 $('finishedToggle').checked=read.finished;
 $('spoilerNotice').textContent=read.finished
  ?'Capítulo concluído: fichas até este capítulo liberadas.'
  :'Capítulo em andamento: informações novas deste capítulo permanecem ocultas. A lista de participantes, quando cadastrada, pode antecipar quem aparece.';
 const key=chapterKey(read.book,read.chapter);
 if(read.mode==='scene'){
  $('curationNotice').textContent=CURATED_SCENES[key]||'Elenco ainda não revisado: mostramos o narrador, quando houver retrato. Não é uma lista completa.';
 }else if(read.mode==='known'){
  $('curationNotice').textContent='Fichas liberadas progressivamente por ponto de leitura; etapas ainda em revisão.';
 }else{
  $('curationNotice').textContent='Todos os 67 retratos enviados, inclusive personagens de capítulos futuros. Use com atenção aos spoilers.';
 }
}

function initials(name){return name.split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase();}
function portraitHTML(c,p,extraClass=''){
 return (p.thumb||p.portrait) ? `<img class="portrait ${extraClass}" src="${p.thumb||p.portrait}" loading="lazy" alt="Retrato literário de ${esc(p.name)}" />`:
 `<div class="portrait-placeholder ${extraClass}" role="img" aria-label="Retrato ainda não adicionado"><span>${esc(initials(c.name))}</span></div>`;
}
function renderGallery(){
 const q=$('searchInput').value.trim().toLocaleLowerCase('pt-BR');
 const list=characters.filter(c=>read.mode==='archive'?Boolean(profile(c).portrait):read.mode==='known'?isKnown(c):sceneVisible(c))
 .filter(c=>{const p=profile(c);return `${p.name} ${c.name} ${p.house} ${p.role}`.toLocaleLowerCase('pt-BR').includes(q);})
 .sort((a,b)=>read.mode==='scene'?Number(isPOV(b))-Number(isPOV(a))||a.name.localeCompare(b.name,'pt-BR'):a.name.localeCompare(b.name,'pt-BR'));
 $('characterCount').textContent=list.length;
 $('gallery').innerHTML=list.length?list.map(c=>{
  const p=profile(c);
  return `<button type="button" class="character-card" data-person="${esc(c.id)}" aria-label="Ver ficha de ${esc(p.name)}">
   ${portraitHTML(c,p)}<div class="card-body"><div class="card-subtitle">${esc(p.house||'Sem casa informada')}</div><div class="card-name">${esc(p.name)}</div><div class="card-age">${esc([p.age,p.role].filter(Boolean).join(' · ')||'Idade não informada')}</div><p class="card-note">${esc(p.note||'Descrição ainda não cadastrada.')}</p><div class="card-foot"><span>VER FICHA</span><span>↗</span></div></div></button>`;
 }).join(''):`<div class="empty"><div class="empty-icon">✧</div><h3>${q?'Nenhum resultado':'Este capítulo aguarda curadoria'}</h3><p>${q?'Tente outro nome ou família.':read.mode==='scene'?'Os participantes ainda não foram registrados neste capítulo. Veja “Conhecidos até aqui” ou a coleção de retratos.':'Nenhum personagem disponível para este filtro.'}</p></div>`;
 document.querySelectorAll('[data-person]').forEach(b=>b.addEventListener('click',()=>viewPerson(b.dataset.person)));
}

function render(){renderReader();renderGallery();saveProgress();}
function moveChapter(amount){read.chapter=Math.max(0,Math.min(chaptersOf(read.book).length-1,read.chapter+amount));read.finished=false;read.mode='scene';render();}
function modal(id,show){$(id).classList.toggle('hidden',!show);document.body.style.overflow=show?'hidden':'';}
function closeAll(){for(const id of ['viewOverlay','editOverlay','manageOverlay'])$(id).classList.add('hidden');document.body.style.overflow='';}
function viewPerson(id){
 const c=characters.find(x=>x.id===id);if(!c)return;const p=profile(c);
 $('viewInner').innerHTML=`${p.portrait?`<img class="view-portrait" src="${p.portrait}" alt="Retrato literário de ${esc(p.name)}" />`:`<div class="view-placeholder">${esc(initials(c.name))}</div>`}<div class="view-text"><div class="micro">${esc(p.house||'CASA NÃO INFORMADA')}</div><h2 id="viewTitle">${esc(p.name)}</h2><div class="view-age">${esc([p.age,p.role].filter(Boolean).join(' · ')||'Idade não informada')}</div>${p.appearance?`<p><strong>Aparência:</strong> ${esc(p.appearance)}</p>`:''}<p>${esc(p.note||'Ainda não há notas sobre este personagem.')}</p><button class="view-edit" id="editFromView">Editar ficha ou retrato</button></div>`;
 $('editFromView').addEventListener('click',()=>{closeAll();openEditor(id);});modal('viewOverlay',true);
}
function newId(){return 'person-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
function fillIntroChapter(){fillChapterSelect($('fIntroChap'),$('fIntroBook').value,Math.min(Number($('fIntroChap').value)||0,chaptersOf($('fIntroBook').value).length-1));}
function openEditor(id=null){
 const c=characters.find(x=>x.id===id);editId=c?c.id:null;
 const p=c?profile(c):{house:'',age:'',role:'',appearance:'',note:''};
 $('editDialogTitle').textContent=c?'Editar personagem':'Novo personagem';
 $('fName').value=c?.name||'';$('fHouse').value=p.house;$('fAge').value=p.age;$('fRole').value=p.role;$('fAppearance').value=p.appearance;$('fNote').value=p.note;
 fillBookSelect($('fIntroBook'),c?.intro?.[0]||read.book);
 fillChapterSelect($('fIntroChap'),c?.intro?.[0]||read.book,c?.intro?.[1]??read.chapter);
 $('fScene').checked=c?c.scenes?.includes(chapterKey(read.book,read.chapter))||false:true;
 $('fNewPhase').checked=false;
 $('fNewPhase').disabled=!c;
 $('deleteCharacter').classList.toggle('hidden',!c);
 $('fImage').value='';
 modal('editOverlay',true);
}
function processImage(file){return new Promise((resolve,reject)=>{
 if(!file){resolve(null);return;}
 if(file.size>30*1024*1024){reject(new Error('A imagem deve ter menos de 30 MB.'));return;}
 const reader=new FileReader();reader.onerror=()=>reject(new Error('Não foi possível ler a foto.'));
 reader.onload=()=>{
  const img=new Image();img.onerror=()=>reject(new Error('Este formato de imagem não é suportado. Use JPG ou PNG.'));
  img.onload=()=>{
   const max=1100;const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
   const canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
   const ctx=canvas.getContext('2d');ctx.fillStyle='#182126';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
   resolve(canvas.toDataURL('image/jpeg',0.83));
  };img.src=reader.result;
 };reader.readAsDataURL(file);
});}
async function saveForm(event){
 event.preventDefault();
 const name=$('fName').value.trim(),house=$('fHouse').value.trim(),age=$('fAge').value.trim(),role=$('fRole').value.trim(),appearance=$('fAppearance').value.trim(),note=$('fNote').value.trim();
 const intro=[$('fIntroBook').value,Number($('fIntroChap').value)];
 if(!name){notify('Digite o nome do personagem.');return;}
 const key=chapterKey(read.book,read.chapter);
 const existing=characters.find(c=>c.id===editId);
 let newImage=null;
 try{newImage=await processImage($('fImage').files[0]);}catch(e){notify(e.message);return;}
 if(existing){
  existing.name=name;existing.intro=intro;
  const usePhase=$('fNewPhase').checked && comp(intro[0],intro[1],read.book,read.chapter)<=0;
  if(usePhase){
   existing.updates=existing.updates||[];
   const i=existing.updates.findIndex(u=>u.book===read.book&&u.chapter===read.chapter);
   const update={book:read.book,chapter:read.chapter,house,age,role,appearance,note};
   if(newImage)update.portrait=newImage;
   if(i!==-1){if(!newImage && existing.updates[i].portrait)update.portrait=existing.updates[i].portrait;if(existing.updates[i].name)update.name=existing.updates[i].name;existing.updates[i]=update;}
   else existing.updates.push(update);
  }else{existing.house=house;existing.age=age;existing.role=role;existing.appearance=appearance;existing.note=note;}
  if(newImage && !usePhase){existing.portrait=newImage;existing.thumb=newImage;}
  existing.scenes=existing.scenes||[];
  existing.scenes=existing.scenes.filter(x=>x!==key);
  if($('fScene').checked)existing.scenes.push(key);
 }else{
  characters.push({id:newId(),name,house,age,role,appearance,note,intro,scenes:$('fScene').checked?[key]:[],portrait:newImage||'',thumb:newImage||'',updates:[]});
 }
 await save();closeAll();render();notify('Personagem salvo.');
}
function renderManagement(){
 const list=characters.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 $('manageNotice').textContent=`${list.length} fichas cadastradas, com 67 retratos originais. Esta área administrativa inclui personagens de capítulos posteriores.`;
 $('manageList').innerHTML=list.map(c=>`<div class="manage-item"><span><strong>${esc(c.name)}</strong><small>${esc(c.house||'Sem casa')} · ${esc(bk(c.intro[0]).title)} / ${c.intro[1]===0?'Prólogo':`cap. ${c.intro[1]}`}</small></span><button data-edit="${esc(c.id)}">Editar</button></div>`).join('');
 document.querySelectorAll('[data-edit]').forEach(btn=>btn.addEventListener('click',()=>{closeAll();openEditor(btn.dataset.edit);}));
}
function exportBackup(){
 const backup={format:'atlas-westeros',version:1,exported:new Date().toISOString(),read,characters};
 const blob=new Blob([JSON.stringify(backup)],{type:'application/json'});
 const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=`atlas-westeros-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),3000);
 notify('Backup exportado para salvar em Arquivos.');
}
async function importBackup(event){
 const file=event.target.files?.[0];if(!file)return;
 try{
  const data=JSON.parse(await file.text());
  if(data.format!=='atlas-westeros'||data.version!==1||!Array.isArray(data.characters))throw new Error('Este arquivo não é um backup válido do Atlas.');
  for(const c of data.characters){if(!c.name||!Array.isArray(c.intro)||!BOOKS.some(b=>b.id===c.intro[0])||!Number.isInteger(Number(c.intro[1])))throw new Error('Personagens inválidos no backup.');}
  if(!confirm(`Importar ${data.characters.length} personagens? Isso substitui a coleção deste aparelho.`))return;
  characters=data.characters.map(c=>({...c,id:String(c.id||newId()),name:String(c.name),house:String(c.house||''),age:String(c.age||''),role:String(c.role||''),appearance:String(c.appearance||''),note:String(c.note||''),portrait:validSrc(c.portrait),thumb:validSrc(c.thumb),scenes:Array.isArray(c.scenes)?c.scenes.filter(s=>typeof s==='string'):[],updates:Array.isArray(c.updates)?c.updates:[]}));
  if(data.read&&BOOKS.some(b=>b.id===data.read.book))read={book:data.read.book,chapter:Math.min(Math.max(Number(data.read.chapter)||0,0),chaptersOf(data.read.book).length-1),mode:['scene','known'].includes(data.read.mode)?data.read.mode:'scene',finished:data.read.finished===true};
  await save();closeAll();render();notify('Coleção importada.');
 }catch(e){notify(e.message||'Falha ao ler backup.');}
 finally{event.target.value='';}
}
function installHandlers(){
 $('bookSelect').addEventListener('change',event=>{read.book=event.target.value;read.chapter=0;read.finished=false;read.mode='scene';render();});
 $('chapterSelect').addEventListener('change',event=>{read.chapter=Number(event.target.value);read.finished=false;read.mode='scene';render();});
 $('prevBtn').addEventListener('click',()=>moveChapter(-1));$('nextBtn').addEventListener('click',()=>moveChapter(1));
 $('sceneMode').addEventListener('click',()=>{read.mode='scene';render();});
 $('knownMode').addEventListener('click',()=>{read.mode='known';render();});
 $('allMode').addEventListener('click',()=>{if(!confirm('A coleção completa contém retratos e nomes de capítulos futuros. Abrir todos os retratos?'))return;read.mode='archive';render();});
 $('finishedToggle').addEventListener('change',event=>{read.finished=event.target.checked;render();});
 $('searchInput').addEventListener('input',renderGallery);
 $('manageBtn').addEventListener('click',()=>{renderManagement();modal('manageOverlay',true);});
 $('addQuick').addEventListener('click',()=>openEditor());
 $('viewClose').addEventListener('click',closeAll);$('editClose').addEventListener('click',closeAll);$('manageClose').addEventListener('click',closeAll);
 for(const id of ['viewOverlay','editOverlay','manageOverlay'])$(id).addEventListener('click',e=>{if(e.target===$(id))closeAll();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
 $('fIntroBook').addEventListener('change',()=>{fillChapterSelect($('fIntroChap'),$('fIntroBook').value,0);});
 $('characterForm').addEventListener('submit',saveForm);
 $('deleteCharacter').addEventListener('click',async()=>{const c=characters.find(x=>x.id===editId);if(!c||!confirm(`Excluir ${c.name} e o retrato associado?`))return;characters=characters.filter(x=>x.id!==editId);await save();closeAll();render();notify('Personagem excluído.');});
 $('newCharacter').addEventListener('click',()=>{closeAll();openEditor();});
 $('exportBtn').addEventListener('click',exportBackup);$('importFile').addEventListener('change',importBackup);
 $('resetData').addEventListener('click',async()=>{if(!confirm('Restaurar o acervo original de 67 retratos? Suas edições e imagens adicionais serão perdidas. Exporte um backup primeiro.'))return;characters=clone(DEFAULTS);await save();closeAll();render();notify('Acervo original restaurado.');});
}
async function start(){
 restoreProgress();installHandlers();
 try{
  db=await initDB();const prior=await dbGet(STORE);
  if(prior){characters=prior;}
  else {
   characters=clone(DEFAULTS);
   const old=await dbGet('atlas-v1');
   if(Array.isArray(old))for(const c of old){
    const match=characters.find(x=>x.id===c.id||x.name===c.name);
    if(match && /^data:image\//.test(c.portrait||'')){match.portrait=c.portrait;match.thumb=c.portrait;}
    else if(!match && c.name)characters.push(c);
   }
   await save();
  }
 }
 catch(e){characters=clone(DEFAULTS);$('saveIndicator').textContent='armazenamento indisponível';notify('Seu navegador bloqueou o armazenamento local.');console.error(e);}
 render();
 if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))navigator.serviceWorker.register('./sw.js').catch(console.warn);
}
start();
})();
