/* PatimiKoru v2: presentation and local preview layer. */
const legacy = {showScreen:window.showScreen,switchTab:window.switchTab,enterMainApp:window.enterMainApp,updateUI:window.updateUI,handleRegister:window.handleRegister,handleLogin:window.handleLogin,sendFriendRequest:window.sendFriendRequest,loadFriendRequests:window.loadFriendRequests,sendPrivateMessage:window.sendPrivateMessage,loadChatMessages:window.loadChatMessages,clearChatHistory:window.clearChatHistory,openCoopModal:window.openCoopModal};
const liveDatabase = db;
let previewMode = false;
let taskFilter = 'all';
let storeFilter = 'all';
let feedListener = null;
let friendListener = null;
let gameInterval = null;
let gameIsActive = false;
let gameGeneration = 0;
let gameSeconds = 45;
let posting = false;
let previewPosts = readStorage('patimikoru.preview.posts', []);
let previewChats = readStorage('patimikoru.preview.chats', {});
const localThanks = new Set(readStorage('patimikoru.thanks', []));
const demoPeople = {deniz:{name:'Deniz',seed:'Deniz'},mamadostu:{name:'Ece',seed:'Ece'},patiyolcusu:{name:'Mert',seed:'Mert'}};
const samplePosts = [
  {id:'demo-1',username:'deniz',name:'Deniz',avatar:'https://api.dicebear.com/7.x/bottts/svg?seed=Deniz',text:'Bugün parkın gölgeli köşesine temiz su bıraktım. Küçük bir iyilik, günün en güzel anına dönüştü. 🐾',image:'assets/pati-dostlari.png',date:'Örnek paylaşım',sample:true},
  {id:'demo-2',username:'mamadostu',name:'Ece',avatar:'https://api.dicebear.com/7.x/bottts/svg?seed=Ece',text:'Birlikte yapınca her şey daha güzel. Bu hafta mahalledeki mama noktalarını kontrol etmek için bir dost arıyorum. Kimler var? 🌿',image:'',date:'Örnek paylaşım',sample:true}
];

function icon(name){return `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;}
function escapeText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function safeImage(value){if(value==='assets/pati-dostlari.png')return value;try{const url=new URL(value,location.href);return /^(https?:|data:)/.test(url.protocol)?escapeText(url.href):'';}catch{return '';}}
function readStorage(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function writeStorage(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
function persistPreview(){if(previewMode&&currentUser){writeStorage('patimikoru.preview.user',currentUser);}}
function emptyState(title,text,action=''){return `<div class="empty-state">${icon('paw')}<h3>${escapeText(title)}</h3><p>${escapeText(text)}</p>${action}</div>`;}
function loadingState(){return '<div class="loading-state"><span class="spinner"></span>Hikâyeler yükleniyor…</div>';}
function toast(message){const el=document.createElement('div');el.className='toast';el.innerHTML=icon('check')+'<span>'+escapeText(message)+'</span>';document.getElementById('toastRegion').append(el);setTimeout(()=>el.remove(),5000);}
window.alert = toast;

function syncScreen(screenId){
  const app = !screenId.startsWith('screenAuth');
  document.body.classList.toggle('is-app',app);
  document.body.dataset.screen=screenId;
  document.querySelector('.member-actions').hidden=!app;
  document.getElementById('previewNotice').hidden=!(app&&previewMode);
  document.getElementById('previewBadge').hidden=!previewMode;
  document.getElementById('bottomNav').style.display=app?'flex':'none';
  if(app){
    document.querySelectorAll('.nav-item').forEach(button=>{const target=button.getAttribute('onclick').match(/screen\w+/)?.[0];const active=target===screenId||(screenId==='screenChat'&&target==='screenFriends');button.classList.toggle('active',active);button.setAttribute('aria-current',active?'page':'false');});
  }
  if(screenId!=='screenHome'&&feedListener){feedListener();feedListener=null;}
  if(screenId!=='screenFriends'&&friendListener){friendListener();friendListener=null;}
  if(screenId==='screenGame')prepareGame();
  window.scrollTo(0,0);
}
window.showScreen=function(screenId){legacy.showScreen(screenId);syncScreen(screenId);};
window.switchTab=function(screenId,btn){if(!currentUser){showScreen('screenAuthWelcome');return;}legacy.switchTab(screenId,btn);syncScreen(screenId);};
window.enterMainApp=function(){legacy.enterMainApp();syncScreen('screenDashboard');updateUI();};
window.updateUI=function(){
  legacy.updateUI();
  if(!currentUser)return;
  const firstName=String(currentUser.fullName||currentUser.username).split(' ')[0];
  document.getElementById('dashboardName').textContent=firstName;
  document.getElementById('memberName').textContent=firstName;
  document.getElementById('composerName').textContent=currentUser.fullName||currentUser.username;
  document.getElementById('memberAvatar').src=currentUser.avatar||animalAvatars[0];
  document.getElementById('composerAvatar').src=currentUser.avatar||animalAvatars[0];
  for(const id of ['dashboardPoints','storePoints'])document.getElementById(id).textContent=currentUser.points;
  const tasks=todaysTasks();const done=tasks.filter(t=>currentUser.claimedTasks?.includes(t.id)).length;
  document.getElementById('taskProgressLabel').textContent=`${done} / ${tasks.length}`;
  document.getElementById('taskProgress').style.width=`${100*done/tasks.length}%`;
  document.getElementById('navTaskCount').textContent=tasks.length-done;
  document.getElementById('progressMessage').textContent=done===tasks.length?'Bugünü iyilikle tamamladın. İyi ki varsın!':done?'Harika gidiyorsun. Her adım çok değerli.':'Her iyilik bir adımla başlar.';
  document.getElementById('todayDate').textContent=new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',weekday:'long'}).format(new Date()).toLocaleUpperCase('tr-TR');
  persistPreview();
};
function goHome(){currentUser?switchTab('screenDashboard'):showScreen('screenAuthWelcome');}
function logout(){
  if(chatUnsubscribe){chatUnsubscribe();chatUnsubscribe=null;}
  if(feedListener){feedListener();feedListener=null;}
  if(friendListener){friendListener();friendListener=null;}
  if(gameInterval){clearInterval(gameInterval);gameInterval=null;}
  gameIsActive=false;gameGeneration++;
  persistPreview();currentUser=null;previewMode=false;db=liveDatabase;
  document.getElementById('userPatiBadge').style.display='none';
  showScreen('screenAuthWelcome');
}
function startPreview(screenId='screenDashboard'){
  previewMode=true;db=null;taskFilter='all';storeFilter='all';
  for(const selector of ['#dailyTasks .filter-chip','.store-tabs .filter-chip'])document.querySelectorAll(selector).forEach((button,index)=>button.classList.toggle('active',index===0));
  currentUser=readStorage('patimikoru.preview.user',null)||{username:'patidostu',fullName:'Pati Dostu',avatar:animalAvatars[0],points:250,claimedTasks:[],friends:['deniz','mamadostu'],friendRequests:[],inventory:[]};
  enterMainApp();if(screenId!=='screenDashboard')switchTab(screenId);
}
function resetPreview(){logout();for(const key of ['patimikoru.preview.user','patimikoru.preview.posts','patimikoru.preview.chats']){try{localStorage.removeItem(key);}catch{}}previewPosts=[];previewChats={};startPreview();toast('Önizleme turu sıfırlandı. Yeniden keşfedebilirsin.');}
function togglePassword(id,button){const input=document.getElementById(id);input.type=input.type==='password'?'text':'password';button.setAttribute('aria-label',input.type==='password'?'Şifreyi göster':'Şifreyi gizle');button.setAttribute('aria-pressed',input.type==='text');}
window.initRegisterAvatars=function(){
  const grid=document.getElementById('registerAvatarGrid');grid.replaceChildren();selectedAvatarUrl=animalAvatars[0];
  animalAvatars.forEach((url,index)=>{const img=document.createElement('img');img.src=url;img.alt=['Kedi avatarı','Köpek avatarı','Kuş avatarı','Tavşan avatarı'][index];img.className='avatar-option'+(!index?' selected':'');img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-pressed',!index?'true':'false');const select=()=>{document.querySelectorAll('.avatar-option').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-pressed','false');});img.classList.add('selected');img.setAttribute('aria-pressed','true');selectedAvatarUrl=url;};img.addEventListener('click',select);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});grid.append(img);});
};
// Keep the existing Firebase collection model and registration flow.
window.handleRegister=async function(){try{await legacy.handleRegister();}catch{toast('Hesap oluşturulamadı. Biraz sonra yeniden deneyebilirsin.');}};
window.handleLogin=async function(){try{await legacy.handleLogin();}catch{toast('Giriş tamamlanamadı. Biraz sonra yeniden deneyebilirsin.');}};

// More practical names for two tasks in the original task pool.
taskPools[2][0].title='Bir Kedi İçin Uygun Mama ve Temiz Su Bırak';
taskPools[2][1].title='Kuşlar İçin Uygun Bir Yere Yem Bırak';
function todaysTasks(){return taskPools[(new Date().getDate()%3)+1]||taskPools[1];}
function taskCategory(task){if(/paylaş|bilgilendir|hayvansever|yardımlaş/i.test(task.title))return 'community';if(/mama|besle|su |su$|yem/i.test(task.title))return 'food';return 'care';}
function filterTasks(filter,button){taskFilter=filter;document.querySelectorAll('#dailyTasks .filter-chip').forEach(el=>el.classList.toggle('active',el===button));renderTasks();}
window.renderTasks=function(){
  if(!currentUser)return;checkDailyReset();
  const tasks=todaysTasks().filter(t=>taskFilter==='all'||taskCategory(t)===taskFilter);
  document.getElementById('taskList').innerHTML=tasks.map(t=>{
    const complete=currentUser.claimedTasks?.includes(t.id);const category=taskCategory(t);const labels={food:'MAMA & SU',care:'BAKIM & KORUMA',community:'TOPLULUK'};const symbols={food:/su/i.test(t.title)?'water':'bowl',care:'shield',community:'users'};const colors={food:'peach',care:'sage',community:'lavender'};
    return `<article class="task-card ${complete?'completed':''}"><span class="task-symbol ${colors[category]}">${icon(complete?'check':symbols[category])}</span><div class="task-body"><div class="task-info"><div><div class="task-category">${labels[category]}</div><h3 class="task-title">${escapeText(t.title)}</h3></div><span class="task-reward">+${t.reward} Pati</span></div><p class="task-description">${complete?'Bugüne güzel bir iz bıraktın. İyi ki varsın.':'Yaptığın iyiliğin bir fotoğrafını ekle ve görevini tamamla.'}</p>${complete?`<span class="completed-label">${icon('check')} Tamamlandı</span>`:`<div class="task-actions"><label class="file-button" for="taskFile${t.id}">${icon('photo')}<span id="taskLabel${t.id}">Fotoğraf ekle</span></label><input class="sr-only" type="file" id="taskFile${t.id}" accept="image/*" onchange="updateTaskFile(${t.id})"><button class="btn btn-sm" onclick="verifyTask(${t.id},${t.reward})">Görevi tamamla</button></div>`}</div></article>`;
  }).join('')||emptyState('Bu kategoride görev yok.','Diğer görevleri görmek için Tümü filtresine dönebilirsin.');
  updateUI();
};
function updateTaskFile(id){const input=document.getElementById(`taskFile${id}`);document.getElementById(`taskLabel${id}`).textContent=input.files[0]?.name||'Fotoğraf ekle';}
function filterStore(filter,button){storeFilter=filter;document.querySelectorAll('.store-tabs .filter-chip').forEach(el=>el.classList.toggle('active',el===button));renderStore();}
window.renderStore=function(){
  if(!currentUser)return;currentUser.inventory??=[];
  function section(items,type,title){return `<h2 class="store-section-title">${title} <small>${items.length} farklı seçenek</small></h2><div class="store-grid">${items.map(item=>{const owned=currentUser.inventory.some(i=>i.name===item.name);const afford=currentUser.points>=item.price;return `<article class="store-item ${owned?'owned':''}">${owned?`<span class="owned-label" title="Koleksiyonunda">${icon('check')}</span>`:''}<span class="store-item-icon">${type==='badge'?item.icon:`<img src="${safeImage(item.url)}" alt="${escapeText(item.name)}" loading="lazy">`}</span><h4>${escapeText(item.name)}</h4><span class="store-price"><strong>${item.price}</strong> Pati puanı</span><button class="btn ${owned?'btn-secondary':'btn-outline'}" ${owned?'disabled':''} onclick="${type==='badge'?`buyStoreItem(${item.price},'${item.name}','${item.icon}')`:`buyAvatarItem(${item.price},'${item.name}','${item.url}','${item.icon}')`}">${owned?'Koleksiyonunda':afford?'Koleksiyonuma ekle':'Pati biriktir'}</button></article>`;}).join('')}</div>`;}
  document.getElementById('storeGridContainer').innerHTML=(storeFilter!=='avatar'?section(storeBadges,'badge','İyilik rozetleri'):'')+(storeFilter!=='badge'?section(storeAvatars,'avatar','Sana özel avatarlar'):'');
  document.getElementById('storePoints').textContent=currentUser.points;
};
window.updateProfileUI=function(){
  if(!currentUser)return;
  document.getElementById('profileAvatar').src=currentUser.avatar||animalAvatars[0];
  document.getElementById('profileFullName').textContent=currentUser.fullName;
  document.getElementById('profileUsername').textContent='@'+currentUser.username;
  document.getElementById('profilePoints').textContent=currentUser.points;
  document.getElementById('profileTaskCount').textContent=currentUser.claimedTasks?.length||0;
  const items=currentUser.inventory||[];
  const el=document.getElementById('userInventoryContainer');
  el.innerHTML=items.length?items.map(item=>item.type==='badge'?`<div class="inventory-badge"><span>${escapeText(item.icon)}</span>${escapeText(item.name)}</div>`:`<div class="inventory-avatar"><img src="${safeImage(item.url)}" alt="${escapeText(item.name)}"><strong>${escapeText(item.name)}</strong><button class="btn btn-sm" data-avatar="${escapeText(item.url)}">${currentUser.avatar===item.url?'Kuşanıldı':'Kuşan'}</button></div>`).join(''):emptyState('İlk rozetin seni bekliyor.','Görevlerden Pati biriktir, iyiliğinin hatırasını seç.','<button class="btn btn-outline" onclick="switchTab(\'screenStore\')">Rozetleri keşfet '+icon('arrow')+'</button>');
  el.querySelectorAll('[data-avatar]').forEach(button=>button.addEventListener('click',()=>equipAvatar(button.dataset.avatar)));
};
window.deleteMyAccount=function(){if(confirm('Bu cihazdaki oturumunu kapatmak ister misin?'))logout();};

function updateFeedFile(){const input=document.getElementById('feedImageFile');document.getElementById('feedFileLabel').textContent=input.files[0]?.name||'Fotoğraf ekle';}
function renderPosts(posts){
  const list=document.getElementById('feedList');
  if(!posts.length){list.innerHTML=emptyState('İlk hikâyeyi sen yaz.','Yaptığın güzel bir şeyi paylaş, iyiliğe birlikte başlayalım.');return;}
  const postMap=new Map(posts.map(p=>[p.id,p]));
  list.innerHTML=posts.map(p=>`<article class="feed-card"><div class="feed-header"><img class="feed-avatar" src="${safeImage(p.avatar||animalAvatars[0])}" alt="${escapeText(p.name||p.username)} avatarı"><div class="feed-author"><strong>${escapeText(p.name||'@'+p.username)}</strong><small>${escapeText(p.date||'Topluluktan bir hikâye')}</small></div>${!p.sample&&!previewMode?`<button class="text-button feed-more" data-report="${escapeText(p.id)}">Bildir</button>`:''}</div><p class="feed-text">${escapeText(p.text)}</p>${p.image?`<img class="feed-img" src="${safeImage(p.image)}" alt="Paylaşım fotoğrafı" loading="lazy">`:''}<div class="feed-footer"><button data-thanks="${escapeText(p.id)}" class="${localThanks.has(p.id)?'liked':''}" aria-pressed="${localThanks.has(p.id)}">${icon('heart')} ${localThanks.has(p.id)?'Teşekkür ettin':'Teşekkür et'}</button>${p.sample?'<span class="sample-label">Önizleme · örnek hikâye</span>':''}</div></article>`).join('');
  list.querySelectorAll('[data-thanks]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.thanks;localThanks.has(id)?localThanks.delete(id):localThanks.add(id);writeStorage('patimikoru.thanks',[...localThanks]);renderPosts(posts);}));
  list.querySelectorAll('[data-report]').forEach(button=>button.addEventListener('click',()=>{const p=postMap.get(button.dataset.report);reportPost(p.id,p.username,p.text);}));
}
window.loadFeed=function(){
  const actions=document.getElementById('adminActionButtons');
  actions.innerHTML=adminAccounts[currentUser?.username]?'<button class="btn btn-sm btn-warning" onclick="switchTab(\'screenAdminReports\')">Şikayetler</button><button class="btn btn-sm btn-info" onclick="switchTab(\'screenAdminFeedbacks\')">Geri bildirimler</button>':'';
  if(feedListener){feedListener();feedListener=null;}
  if(previewMode){renderPosts([...previewPosts,...samplePosts]);return;}
  if(!db){document.getElementById('feedList').innerHTML=emptyState('Topluluğa şu anda bağlanamıyoruz.','Bağlantın olduğunda hikâyeler burada görünecek.');return;}
  document.getElementById('feedList').innerHTML=loadingState();
  feedListener=db.collection('posts').orderBy('timestamp','desc').onSnapshot(snapshot=>{const posts=snapshot.docs.map(doc=>{const p=doc.data();return {...p,id:doc.id,date:p.timestamp?.toDate?new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).format(p.timestamp.toDate()):'Az önce'};});renderPosts(posts);},()=>{document.getElementById('feedList').innerHTML=emptyState('Akış yüklenemedi.','Bağlantı tekrar kurulduğunda yeniden deneyebilirsin.','<button class="btn btn-outline" onclick="loadFeed()">Yeniden dene</button>');});
};
async function readPostImage(file){
  if(!file)return '';if(!file.type.startsWith('image/'))throw new Error('Lütfen bir fotoğraf seç.');if(file.size>10*1024*1024)throw new Error('10 MB’den küçük bir fotoğraf seç.');
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Fotoğraf okunamadı.'));reader.readAsDataURL(file);});
  const image=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Bu fotoğraf açılamadı.'));im.src=data;});
  const canvas=document.createElement('canvas');const ratio=Math.min(1,1000/image.width,1000/image.height);canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.7);
}
window.addPost=async function(){
  if(posting||!currentUser)return;
  const input=document.getElementById('feedInput');const file=document.getElementById('feedImageFile');const text=input.value.trim();
  if(!text&&!file.files.length){toast('Önce bir hikâye yaz veya fotoğraf ekle.');input.focus();return;}
  posting=true;const button=document.querySelector('.composer-actions .btn');button.disabled=true;button.textContent='Paylaşılıyor…';
  try{
    const image=await readPostImage(file.files[0]);
    const post={username:currentUser.username,name:currentUser.fullName,avatar:currentUser.avatar,text,image};
    if(previewMode){previewPosts.unshift({...post,id:'local-'+Date.now(),date:'Az önce · bu cihazda',sample:true});writeStorage('patimikoru.preview.posts',previewPosts);loadFeed();}
    else{if(!db)throw new Error('Topluluğa şu anda bağlanamıyoruz.');await db.collection('posts').add({...post,timestamp:firebase.firestore.FieldValue.serverTimestamp()});}
    input.value='';file.value='';updateFeedFile();toast(previewMode?'Önizleme hikâyen bu cihazda eklendi.':'Hikâyen toplulukla paylaşıldı. İyi ki varsın!');
  }catch(error){toast(error.message||'Paylaşım tamamlanamadı. Yeniden deneyebilirsin.');}
  finally{posting=false;button.disabled=false;button.innerHTML='Hikâyemi paylaş '+icon('arrow');}
};

window.loadFriendsList=function(){
  const container=document.getElementById('friendListContainer');const friends=currentUser?.friends||[];
  container.innerHTML=friends.length?friends.map(friend=>{const person=previewMode?demoPeople[friend]:null;return `<article class="friend-card"><div class="friend-card-main"><img src="https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(friend)}" alt="${escapeText(friend)} avatarı"><div><strong>${escapeText(person?.name||'@'+friend)}</strong><small>${previewMode?'Önizleme dostu · ':''}@${escapeText(friend)}</small></div></div><button class="btn btn-sm btn-outline" data-chat="${escapeText(friend)}">${icon('message')} Sohbet et</button></article>`;}).join(''):emptyState('İyilik dostlarla daha güzel.','Bir arkadaşının kullanıcı adını girerek ilk bağlantını kur.');
  container.querySelectorAll('[data-chat]').forEach(button=>button.addEventListener('click',()=>openChat(button.dataset.chat)));
};
window.loadFriendRequests=function(){
  const container=document.getElementById('friendRequestsContainer');
  if(friendListener){friendListener();friendListener=null;}
  if(previewMode||!db){container.innerHTML='';return;}
  friendListener=db.collection('users').doc(currentUser.username).onSnapshot(doc=>{
    if(!doc.exists)return;currentUser=doc.data();
    container.innerHTML=(currentUser.friendRequests||[]).map(friend=>`<div class="friend-card sage"><div><strong>@${escapeText(friend)}</strong><p class="task-description">Seninle iyilik dostu olmak istiyor.</p></div><button class="btn btn-sm" data-accept="${escapeText(friend)}">Kabul et</button></div>`).join('');
    container.querySelectorAll('[data-accept]').forEach(button=>button.addEventListener('click',()=>acceptFriend(button.dataset.accept)));
    loadFriendsList();
  },()=>toast('Arkadaşlık istekleri şu anda yüklenemiyor.'));
};
window.sendFriendRequest=async function(){
  const input=document.getElementById('searchUserField');const target=input.value.trim();if(!target)return;
  if(previewMode){if(target===currentUser.username){toast('Kendi kendine arkadaşlık isteği gönderemezsin.');return;}toast(`Önizleme: @${target} için istek oluşturuldu. Gerçek bir kullanıcıya gönderilmedi.`);input.value='';return;}
  try{await legacy.sendFriendRequest();}catch{toast('İstek gönderilemedi. Yeniden deneyebilirsin.');}
};
function renderPreviewChat(){
  const key=currentChatFriend;previewChats[key]??=[{text:'Merhaba! Bugün birlikte bir iyilik yapalım mı? 🌿',sender:key},{text:'Harika olur. Mahalledeki su kaplarını kontrol edebiliriz.',sender:currentUser.username}];
  const list=document.getElementById('chatMessagesList');
  list.innerHTML=previewChats[key].map(message=>`<div class="chat-msg ${message.sender===currentUser.username?'sent':'received'}">${escapeText(message.text)}</div>`).join('');list.scrollTop=list.scrollHeight;
}
window.loadChatMessages=function(){
  if(previewMode){renderPreviewChat();return;}
  const list=document.getElementById('chatMessagesList');
  if(!db){list.innerHTML=emptyState('Sohbete şu anda bağlanamıyoruz.','Bağlantını kontrol edip yeniden deneyebilirsin.');return;}
  const room=getRoomId(currentUser.username,currentChatFriend);
  if(chatUnsubscribe)chatUnsubscribe();
  chatUnsubscribe=db.collection('chats').doc(room).collection('messages').orderBy('timestamp','asc').onSnapshot(snapshot=>{
    list.innerHTML=snapshot.docs.map(doc=>{const m=doc.data();return `<div class="chat-msg ${m.sender===currentUser.username?'sent':'received'}">${m.type==='coop'?`<strong>Ortak görev</strong><br>${escapeText(m.desc)}<br><small>${escapeText(m.location||'Konum belirtilmedi')}</small><div class="coop-card">${m.completed?'Tamamlandı · +40 Pati':`<input type="file" id="coopFile_${escapeText(doc.id)}" accept="image/*"><button class="btn btn-sm" data-coop="${escapeText(doc.id)}">Fotoğrafla tamamla</button>`}</div>`:escapeText(m.text)}</div>`;}).join('');
    list.querySelectorAll('[data-coop]').forEach(button=>button.addEventListener('click',()=>completeCoop(room,button.dataset.coop)));list.scrollTop=list.scrollHeight;
  },()=>{list.innerHTML=emptyState('Mesajlar yüklenemedi.','Biraz sonra sohbete yeniden girebilirsin.');});
};
window.sendPrivateMessage=async function(){
  const input=document.getElementById('chatInput');const text=input.value.trim();if(!text)return;
  if(previewMode){previewChats[currentChatFriend]??=[];previewChats[currentChatFriend].push({sender:currentUser.username,text});writeStorage('patimikoru.preview.chats',previewChats);input.value='';renderPreviewChat();return;}
  try{await legacy.sendPrivateMessage();}catch{toast('Mesaj gönderilemedi. Yeniden deneyebilirsin.');}
};
window.clearChatHistory=async function(){if(previewMode){if(confirm('Bu önizleme sohbetini temizlemek ister misin?')){previewChats[currentChatFriend]=[];writeStorage('patimikoru.preview.chats',previewChats);renderPreviewChat();}return;}try{await legacy.clearChatHistory();}catch{toast('Sohbet temizlenemedi.');}};
window.openCoopModal=async function(){if(previewMode){toast('Ortak görevleri dostlarınla gerçek hesabından planlayabilirsin.');return;}try{await legacy.openCoopModal();}catch{toast('Ortak görev oluşturulamadı.');}};
window.openFeedbackModal=function(){document.getElementById('feedbackDialog').showModal();document.getElementById('feedbackText').focus();};
async function submitFeedback(){const input=document.getElementById('feedbackText');const text=input.value.trim();if(!text)return;try{if(!previewMode){if(!db)throw new Error();await db.collection('feedbacks').add({username:currentUser.username,text,timestamp:firebase.firestore.FieldValue.serverTimestamp()});}document.getElementById('feedbackDialog').close();input.value='';toast(previewMode?'Önizleme: geri bildirim akışını tamamladın. Mesaj gönderilmedi.':'Fikrin bize ulaştı. Teşekkür ederiz!');}catch{toast('Geri bildirim gönderilemedi. Biraz sonra yeniden dene.');}}

function prepareGame(){
  const button=document.getElementById('btnStartGame');
  if(gameIsActive)return;
  const played=currentUser?.lastGameDate===new Date().toDateString();
  button.style.display='inline-flex';button.disabled=played;
  button.innerHTML=played?'Bugünkü oyununu oynadın. Yarın görüşürüz!':'Oyuna başla '+icon('arrow');
  if(!played){document.getElementById('gameActiveArea').style.display='none';document.getElementById('gameResult').innerHTML='';}
}
window.startMemoryGame=function(){
  if(!currentUser||gameIsActive)return;const today=new Date().toDateString();if(currentUser.lastGameDate===today){toast('Bugünkü oyununu oynadın. Yarın yeniden buluşalım!');return;}
  currentUser.lastGameDate=today;updateUI();gameIsActive=true;gameGeneration++;matchedPairs=0;flipped=[];gameSeconds=45;
  document.getElementById('btnStartGame').style.display='none';document.getElementById('gameActiveArea').style.display='block';document.getElementById('memoryMatches').textContent='0';document.getElementById('gameTimer').textContent='45';document.getElementById('gameResult').innerHTML='';
  const animals=['🐱','🐶','🐰','🦊','🐼','🦁','🐨','🐯','🐵','🐧'];const deck=[...animals,...animals];for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  const grid=document.getElementById('memoryGridContainer');grid.innerHTML=deck.map((animal,index)=>`<button class="memory-card" id="mcard_${index}" aria-label="${index+1}. kartı çevir" data-animal="${animal}" data-index="${index}">${icon('paw')}</button>`).join('');grid.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>flipCard(Number(button.dataset.index),button.dataset.animal)));
  if(gameInterval)clearInterval(gameInterval);gameInterval=setInterval(()=>{gameSeconds--;document.getElementById('gameTimer').textContent=gameSeconds;if(gameSeconds<=0)finishGame(false);},1000);
};
window.flipCard=function(index,animal){
  const card=document.getElementById(`mcard_${index}`);if(!gameIsActive||card.classList.contains('flipped')||flipped.length>=2)return;
  card.textContent=animal;card.classList.add('flipped');card.setAttribute('aria-label',animal);flipped.push({index,animal});
  if(flipped.length===2){const turn=gameGeneration;setTimeout(()=>{if(turn!==gameGeneration||!gameIsActive)return;const pair=[...flipped];if(pair[0].animal===pair[1].animal){pair.forEach(p=>{const el=document.getElementById(`mcard_${p.index}`);el.classList.add('matched');el.disabled=true;});matchedPairs++;document.getElementById('memoryMatches').textContent=matchedPairs;flipped=[];if(matchedPairs===10)finishGame(true);}else{pair.forEach(p=>{const el=document.getElementById(`mcard_${p.index}`);el.innerHTML=icon('paw');el.classList.remove('flipped');el.setAttribute('aria-label',`${p.index+1}. kartı çevir`);});flipped=[];}},500);}
};
function finishGame(won){
  gameIsActive=false;if(gameInterval){clearInterval(gameInterval);gameInterval=null;}
  document.querySelectorAll('.memory-card').forEach(card=>card.disabled=true);
  if(won){currentUser.points+=100;updateUI();toast('Harikasın! İyilik kumbarana 100 Pati eklendi.');}
  document.getElementById('gameResult').innerHTML=`<p class="game-result">${won?'Tüm dostları buldun! +100 Pati 🐾':`Süre doldu. ${matchedPairs} çift buldun. Yarın yeniden buluşalım!`}</p>`;
}

const shortLabels=['Görevler','Akış','Dostlar','Mağaza','Oyun','Destek','Profil'];document.querySelectorAll('.nav-item').forEach((button,i)=>button.dataset.short=shortLabels[i]);
syncScreen('screenAuthWelcome');
