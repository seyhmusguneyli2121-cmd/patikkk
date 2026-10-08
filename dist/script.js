
  let db = null;
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyBRBSnvsY6X4E6WNRU0f-S",
      authDomain: "patimikoru.firebaseapp.com",
      projectId: "patimikoru",
      storageBucket: "patimikoru.firebasestorage.app",
      messagingSenderId: "143631667870",
      appId: "1:143631667870:web:c1ac49c21bc32f6168218f"
    };
    if(typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
    }
  } catch(e) {}

  let currentUser = null;
  let selectedAvatarUrl = "";
  let currentChatFriend = "";
  let chatUnsubscribe = null;

  const adminAccounts = {
    "ART_Rojhat": "Adminrojhat_21",
    "ART_Talha": "Admintalha_21",
    "ART_Arjin": "Adminarjin_21"
  };

  const adminAvatarsMap = {
    "ART_Rojhat": "https://api.dicebear.com/7.x/bottts/svg?seed=RoboRojhatCop&backgroundColor=1A202C&eyes=shade&mouth=smile",
    "ART_Talha": "https://api.dicebear.com/7.x/bottts/svg?seed=RoboTalhaAgent&backgroundColor=1A202C&eyes=shade&mouth=diagram",
    "ART_Arjin": "https://api.dicebear.com/7.x/bottts/svg?seed=RoboArjinGuard&backgroundColor=1A202C&eyes=shade&mouth=square"
  };
  
  const animalAvatars = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=Cat",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Dog",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Bird",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Bunny"
  ];

  // Günlere göre değişen görev setleri (Toplam 4 görev havuzu)
  const taskPools = {
    1: [
      { id: 1, title: "Sokak Kedilerini Sev ve Besle", reward: 15 },
      { id: 2, title: "Yaralı veya Susamış Kuş İçin Su Kabı Bırak", reward: 10 },
      { id: 3, title: "Barınaktaki Dostlar İçin Bilgilendirici Paylaşım Yap", reward: 20 },
      { id: 4, title: "Mahalledeki Sokak Kedilerini Kontrol Et", reward: 15 }
    ],
    2: [
      { id: 1, title: "Bir Kediye Kuru Mama ve Süt Ver", reward: 15 },
      { id: 2, title: "Kuşlar İçin Ağaca Ekmek veya Yem As", reward: 10 },
      { id: 3, title: "Sokak Hayvanları İçin Karton Kutu Ev Yap", reward: 25 },
      { id: 4, title: "Parktaki Kedilerin Sağlık Durumunu Gözlemle", reward: 15 }
    ],
    3: [
      { id: 1, title: "Yaralı Gördüğün Bir Kediyi/Köpeği Veterine Bildir", reward: 25 },
      { id: 2, title: "Sokak Köpeklerine Güvenli Bir Yerden Mama Ver", reward: 15 },
      { id: 3, title: "Kuş Yuvası İçin Uygun Bir Alan Hazırla", reward: 15 },
      { id: 4, title: "Çevredeki Hayvanseverlerle Yardımlaşma Konuş", reward: 10 }
    ]
  };

  const storeBadges = [
    { id: 'b1', name: "Minik Pati Rozeti", price: 50, icon: "🐾", type: "badge" },
    { id: 'b2', name: "Sokak Koruyucusu", price: 100, icon: "🛡️", type: "badge" },
    { id: 'b3', name: "Altın Kemik Ödülü", price: 150, icon: "🦴", type: "badge" },
    { id: 'b4', name: "Süper Gönüllü", price: 200, icon: "⭐", type: "badge" },
    { id: 'b5', name: "Kedi Dostu", price: 250, icon: "🐱", type: "badge" },
    { id: 'b6', name: "Köpek Dostu", price: 250, icon: "🐶", type: "badge" },
    { id: 'b7', name: "Doğa Kahramanı", price: 300, icon: "🌿", type: "badge" },
    { id: 'b8', name: "Kalpli Hayvansever", price: 350, icon: "❤️", type: "badge" },
    { id: 'b9', name: "Kral Tacı Rozeti", price: 450, icon: "👑", type: "badge" },
    { id: 'b10', name: "Elmas Hayvan Dostu", price: 600, icon: "💎", type: "badge" }
  ];

  const storeAvatars = [
    { id: 'a1', name: "Aslan Avatarı", price: 80, icon: "🦁", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Lion" },
    { id: 'a2', name: "Panda Avatarı", price: 80, icon: "🐼", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Panda" },
    { id: 'a3', name: "Tilki Avatarı", price: 100, icon: "🦊", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Fox" },
    { id: 'a4', name: "Baykuş Avatarı", price: 120, icon: "🦉", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Owl" },
    { id: 'a5', name: "Kaplan Avatarı", price: 150, icon: "🐯", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Tiger" },
    { id: 'a6', name: "Kurt Avatarı", price: 180, icon: "🐺", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Wolf" },
    { id: 'a7', name: "Ejderha Avatarı", price: 220, icon: "🐲", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Dragon" },
    { id: 'a8', name: "Robot Avatarı", price: 250, icon: "🤖", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Robot" },
    { id: 'a9', name: "Uzaylı Avatarı", price: 300, icon: "👽", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Alien" },
    { id: 'a10', name: "Kral Avatar", price: 400, icon: "👑", url: "https://api.dicebear.com/7.x/bottts/svg?seed=King" }
  ];

  function initRegisterAvatars() {
    const grid = document.getElementById('registerAvatarGrid');
    if(!grid) return;
    grid.innerHTML = "";
    for(let i = 0; i < 4; i++) {
      const url = animalAvatars[i];
      const isSel = i === 0 ? "selected" : "";
      if(i === 0) selectedAvatarUrl = url;
      grid.innerHTML += `<img src="${url}" class="avatar-option ${isSel}" onclick="selectAvatar(this, '${url}')">`;
    }
  }

  function showScreen(screenId) {
    if(chatUnsubscribe) { chatUnsubscribe(); chatUnsubscribe = null; }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if(target) target.classList.add('active');
    if(screenId === 'screenAuthRegister') initRegisterAvatars();
  }

  function selectAvatar(el, url) {
    document.querySelectorAll('.avatar-option').forEach(img => img.classList.remove('selected'));
    el.classList.add('selected');
    selectedAvatarUrl = url;
  }

  function switchTab(screenId, btn) {
    if(chatUnsubscribe) { chatUnsubscribe(); chatUnsubscribe = null; }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if(target) target.classList.add('active');
    if(btn) {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    if(screenId === 'screenDashboard') renderTasks();
    if(screenId === 'screenProfile') updateProfileUI();
    if(screenId === 'screenHome') loadFeed();
    if(screenId === 'screenStore') renderStore();
    if(screenId === 'screenFriends') { loadFriendsList(); loadFriendRequests(); }
    if(screenId === 'screenAdminReports') loadReports();
    if(screenId === 'screenAdminFeedbacks') loadFeedbacks();
  }

  async function handleRegister() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const fullName = document.getElementById('regFullName').value.trim();

    if (!username || !password || !fullName) { alert("Tüm alanları doldurun!"); return; }
    if(adminAccounts[username]) { alert("Bu kullanıcı adı adminlere aittir!"); return; }

    currentUser = { username, password, fullName, avatar: selectedAvatarUrl || animalAvatars[0], points: 100, claimedTasks: [], friends: [], friendRequests: [], inventory: [] };
    if(db) { try { await db.collection('users').doc(username).set(currentUser); } catch(e) {} }
    enterMainApp();
  }

  async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if(!username || !password) { alert("Kullanıcı adı ve şifre girin!"); return; }

    if(db) {
      try {
        const doc = await db.collection('users').doc(username).get();
        if(doc.exists) { currentUser = doc.data(); enterMainApp(); return; }
      } catch(e) {}
    }
    currentUser = { username, fullName: username, avatar: animalAvatars[0], points: 100, claimedTasks: [], friends: [], friendRequests: [], inventory: [] };
    enterMainApp();
  }

  function handleAdminLogin() {
    const username = document.getElementById('adminLoginUsername').value.trim();
    const password = document.getElementById('adminLoginPassword').value.trim();
    if(adminAccounts[username] && adminAccounts[username] === password) {
      currentUser = {
        username: username,
        password: password,
        fullName: "Sistem Yöneticisi (" + username + ")",
        avatar: adminAvatarsMap[username] || animalAvatars[0],
        points: 9999,
        claimedTasks: [],
        friends: [],
        friendRequests: [],
        inventory: []
      };
      enterMainApp();
    } else {
      alert("Hatalı admin bilgileri!");
    }
  }

  function enterMainApp() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screenDashboard').classList.add('active');
    document.getElementById('bottomNav').style.display = 'flex';
    document.getElementById('userPatiBadge').style.display = 'flex';
    if(adminAccounts[currentUser?.username]) currentUser.avatar = adminAvatarsMap[currentUser.username];
    checkDailyReset();
    updateUI();
    renderTasks();
  }

  function checkDailyReset() {
    const now = new Date();
    const todayStr = now.toDateString();
    if(currentUser.lastTaskResetDate !== todayStr) {
      currentUser.lastTaskResetDate = todayStr;
      currentUser.claimedTasks = [];
      updateUI();
    }
  }

  function updateUI() {
    if(!currentUser) return;
    const pts = document.getElementById('headerPoints');
    if(pts) pts.innerText = currentUser.points;
    if(db && !adminAccounts[currentUser.username]) {
      db.collection('users').doc(currentUser.username).set(currentUser, { merge: true }).catch(()=>{});
    }
  }

  function updateProfileUI() {
    if(!currentUser) return;
    let av = currentUser.avatar;
    if(adminAccounts[currentUser.username]) av = adminAvatarsMap[currentUser.username];
    document.getElementById('profileAvatar').src = av;
    document.getElementById('profileFullName').innerText = currentUser.fullName;
    document.getElementById('profileUsername').innerText = "@" + currentUser.username;
    document.getElementById('profilePoints').innerText = currentUser.points;

    const invContainer = document.getElementById('userInventoryContainer');
    if(!invContainer) return;
    invContainer.innerHTML = "";
    if(!currentUser.inventory || currentUser.inventory.length === 0) {
      invContainer.innerHTML = "<span style='font-size:0.75rem; color:#888;'>Henüz envanterinde eşya yok.</span>";
      return;
    }
    currentUser.inventory.forEach(item => {
      if(item.type === 'badge') {
        invContainer.innerHTML += `<div style="background:#FFF0F0; border:1px solid var(--primary); padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:700; color:var(--primary);">${item.icon} ${item.name}</div>`;
      } else if(item.type === 'avatar') {
        invContainer.innerHTML += `<div style="display:flex; align-items:center; gap:4px; background:#EBF5FB; border:1px solid #3498DB; padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:700; color:#3498DB;"><img src="${item.url}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;"> ${item.name} <button class="btn btn-sm" style="padding:2px 4px;font-size:0.6rem;margin-left:4px;" onclick="equipAvatar('${item.url}')">Kuşan</button></div>`;
      }
    });
  }

  function equipAvatar(url) {
    currentUser.avatar = url;
    updateUI();
    updateProfileUI();
    alert("Avatar başarıyla kuşandı! 🐾");
  }

  function renderTasks() {
    checkDailyReset();
    const taskListDiv = document.getElementById('taskList');
    if(!taskListDiv) return;
    taskListDiv.innerHTML = "";
    
    // Günün tarihine göre farklı görev seti seç (1, 2 veya 3)
    const dayNum = (new Date().getDate() % 3) + 1;
    const currentTasks = taskPools[dayNum] || taskPools[1];

    currentTasks.forEach(t => {
      const isCompleted = currentUser.claimedTasks && currentUser.claimedTasks.includes(t.id);
      taskListDiv.innerHTML += `
        <div class="task-card">
          <div class="task-info">
            <div>
              <div class="task-title">${t.title}</div>
              <div class="task-reward">+${t.reward} Pati Puan</div>
            </div>
            <button class="btn btn-sm" ${isCompleted ? 'disabled style="background:#A0AEC0;"' : ''} onclick="verifyTask(${t.id}, ${t.reward})">
              ${isCompleted ? 'Tamamlandı' : 'Kanıtla'}
            </button>
          </div>
          ${!isCompleted ? `<input type="file" id="taskFile${t.id}" accept="image/*" style="font-size:0.75rem; margin-top:4px;">` : ''}
        </div>
      `;
    });
  }

  function verifyTask(taskId, reward) {
    const fileInput = document.getElementById(`taskFile${taskId}`);
    if(!fileInput || fileInput.files.length === 0) { alert("Lütfen kanıt fotoğrafı seçin! 🐾"); return; }
    currentUser.points += reward;
    if(!currentUser.claimedTasks) currentUser.claimedTasks = [];
    currentUser.claimedTasks.push(taskId);
    updateUI();
    renderTasks();
    alert(`Tebrikler! ${reward} Pati Puan kazandın!`);
  }

  function renderStore() {
    const grid = document.getElementById('storeGridContainer');
    if(!grid) return;
    grid.innerHTML = "";
    
    if(!currentUser.inventory) currentUser.inventory = [];

    let html = `<h4 style="font-size:0.85rem; font-weight:800; color:var(--primary); margin-bottom:6px;">🏅 Rozetler (10 Adet)</h4><div class="store-grid">`;
    storeBadges.forEach(b => {
      const isOwned = currentUser.inventory.some(i => i.name === b.name);
      html += `
        <div class="store-item">
          <div style="font-size: 1.5rem;">${b.icon}</div>
          <div style="font-weight: 700; font-size: 0.75rem;">${b.name}</div>
          <div style="font-size: 0.7rem; color: var(--primary); font-weight: 800;">${b.price} Puan</div>
          <button class="btn btn-sm ${isOwned ? '' : 'btn-secondary'}" ${isOwned ? 'disabled style="background:#A0AEC0; color:#fff;"' : `onclick="buyStoreItem(${b.price}, '${b.name}', '${b.icon}')"`}>
            ${isOwned ? 'Satın Alındı' : 'Satın Al'}
          </button>
        </div>
      `;
    });
    html += `</div><h4 style="font-size:0.85rem; font-weight:800; color:var(--secondary); margin:12px 0 6px 0;">🐾 Özel Avatarlar (10 Adet)</h4><div class="store-grid">`;
    storeAvatars.forEach(a => {
      const isOwned = currentUser.inventory.some(i => i.name === a.name);
      html += `
        <div class="store-item">
          <img src="${a.url}" style="width:35px;height:35px;border-radius:50%;object-fit:cover;margin:auto;">
          <div style="font-weight: 700; font-size: 0.75rem;">${a.name}</div>
          <div style="font-size: 0.7rem; color: var(--primary); font-weight: 800;">${a.price} Puan</div>
          <button class="btn btn-sm ${isOwned ? '' : 'btn-secondary'}" ${isOwned ? 'disabled style="background:#A0AEC0; color:#fff;"' : `onclick="buyAvatarItem(${a.price}, '${a.name}', '${a.url}', '${a.icon}')"`}>
            ${isOwned ? 'Satın Alındı' : 'Avatarı Al'}
          </button>
        </div>
      `;
    });
    html += `</div>`;
    grid.innerHTML = html;
  }

  function buyStoreItem(price, name, icon) {
    if(currentUser.points < price) { alert("Yeterli Pati Puanın yok!"); return; }
    currentUser.points -= price;
    if(!currentUser.inventory) currentUser.inventory = [];
    currentUser.inventory.push({ type: 'badge', name, icon });
    updateUI();
    renderStore();
    alert(`Tebrikler! "${name}" rozetini satın aldın ve envanterine eklendi! 🏅`);
  }

  function buyAvatarItem(price, name, url, icon) {
    if(currentUser.points < price) { alert("Yeterli Pati Puanın yok!"); return; }
    currentUser.points -= price;
    if(!currentUser.inventory) currentUser.inventory = [];
    currentUser.inventory.push({ type: 'avatar', name, url, icon });
    updateUI();
    renderStore();
    alert(`Tebrikler! "${name}" avatarını satın aldın! Profilden kuşanabilirsin. 🐾`);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Numara kopyalandı: ${text} 📋`);
    }).catch(() => {
      prompt("Numarayı kopyalamak için seçin:", text);
    });
  }

  function openNearestVetMap() {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        window.open(`https://www.google.com/maps/search/veteriner+kliniği/@${lat},${lon},14z`, '_blank');
      }, () => {
        window.open(`https://www.google.com/maps/search/veteriner+kliniği/`, '_blank');
      });
    } else {
      window.open(`https://www.google.com/maps/search/veteriner+kliniği/`, '_blank');
    }
  }

  async function openFeedbackModal() {
    const txt = prompt("Öneri, istek veya şikayetini yaz:");
    if(!txt || !db) return;
    await db.collection('feedbacks').add({ username: currentUser.username, text: txt, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    alert("Geri bildirimin yöneticilere iletildi!");
  }

  async function addPost() {
    const txt = document.getElementById('feedInput').value.trim();
    const fileInput = document.getElementById('feedImageFile');
    if(!txt && fileInput.files.length === 0) return;

    let av = currentUser.avatar;
    if(adminAccounts[currentUser.username]) av = adminAvatarsMap[currentUser.username];

    if(fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(fileInput.files[0]);
      reader.onload = async function() {
        if(db) await db.collection('posts').add({ username: currentUser.username, avatar: av, text: txt, image: reader.result, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('feedInput').value = ""; document.getElementById('feedImageFile').value = "";
      };
    } else {
      if(db) await db.collection('posts').add({ username: currentUser.username, avatar: av, text: txt, image: "", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
      document.getElementById('feedInput').value = "";
    }
  }

  function loadFeed() {
    const feedContainer = document.getElementById('feedList');
    const actionButtons = document.getElementById('adminActionButtons');
    if(!feedContainer) return;

    const isAdmin = adminAccounts[currentUser?.username];
    if(isAdmin && actionButtons) {
      actionButtons.innerHTML = `
        <button class="btn btn-sm btn-warning" onclick="switchTab('screenAdminReports')">🚨 Şikayetler</button>
        <button class="btn btn-sm btn-info" onclick="switchTab('screenAdminFeedbacks')">💬 Öneriler</button>
      `;
    } else if(actionButtons) {
      actionButtons.innerHTML = "";
    }

    if(db) {
      db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        feedContainer.innerHTML = "";
        snapshot.forEach(doc => {
          const d = doc.data();
          const postId = doc.id;
          let pAv = d.avatar || animalAvatars[0];
          if(adminAccounts[d.username]) pAv = adminAvatarsMap[d.username];

          feedContainer.innerHTML += `
            <div class="feed-card">
              <div class="feed-header">
                <img src="${pAv}" class="feed-avatar">
                <div style="font-weight:700; font-size:0.8rem;">@${d.username}</div>
                <div style="margin-left:auto;">
                  ${isAdmin ? `<button class="btn btn-sm btn-danger" onclick="deletePost('${postId}')">Sil</button>` : `<button class="btn btn-sm btn-warning" onclick="reportPost('${postId}', '${d.username}', '${(d.text||'').replace(/'/g,"\\'")}')">Şikayet</button>`}
                </div>
              </div>
              <div style="font-size:0.85rem;">${d.text || ''}</div>
              ${d.image ? `<img src="${d.image}" class="feed-img">` : ''}
            </div>
          `;
        });
      });
    }
  }

  async function deletePost(postId) {
    if(confirm("Bu gönderiyi silmek istiyor musun?") && db) {
      await db.collection('posts').doc(postId).delete();
    }
  }

  async function reportPost(postId, owner, text) {
    if(confirm(`@${owner} adlı kullanıcının bu gönderisini şikayet etmek istiyor musun?`) && db) {
      await db.collection('reports').add({ postId, postOwner: owner, postText: text, reportedBy: currentUser.username, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
      alert("Şikayet yöneticilere iletildi.");
    }
  }

  function loadReports() {
    const list = document.getElementById('reportsList');
    if(!list || !db) return;
    db.collection('reports').orderBy('timestamp', 'desc').onSnapshot(snap => {
      list.innerHTML = "";
      if(snap.empty) { list.innerHTML = "<p style='font-size:0.8rem; color:#888; text-align:center;'>Şikayet yok.</p>"; return; }
      snap.forEach(doc => {
        const d = doc.data();
        list.innerHTML += `
          <div class="report-card">
            <div style="font-size:0.8rem; font-weight:700; color:var(--primary);">Şikayet Eden: @${d.reportedBy} | Edilen: @${d.postOwner}</div>
            <div style="font-size:0.8rem; background:white; padding:6px; border-radius:6px; margin:6px 0;">"${d.postText || '[Fotoğraf]'}"</div>
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-danger" onclick="deletePost('${d.postId}'); dismissReport('${doc.id}')">Gönderiyi Sil</button>
              <button class="btn btn-sm btn-warning" onclick="warnUser('${d.postOwner}')">⚠️ Uyarı Gönder</button>
              <button class="btn btn-sm btn-admin" onclick="banUser('${d.postOwner}')">🔨 Banla</button>
              <button class="btn btn-sm btn-secondary" onclick="dismissReport('${doc.id}')">Yoksay</button>
            </div>
          </div>
        `;
      });
    });
  }

  async function dismissReport(id) { if(db) await db.collection('reports').doc(id).delete(); }

  async function warnUser(username) {
    const reason = prompt(`@${username} adlı kullanıcıya gönderilecek uyarı mesajı:`);
    if(!reason || !db) return;
    await db.collection('chats').doc(getRoomId(currentUser.username, username)).collection('messages').add({
      sender: currentUser.username, text: `🚨 [YÖNETİCİ UYARISI]: ${reason}`, type: 'text', timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert(`@${username} adlı kullanıcıya uyarı gönderildi.`);
  }

  async function banUser(username) {
    if(confirm(`@${username} adlı kullanıcıyı banlamak istediğinize emin misiniz?`) && db) {
      await db.collection('users').doc(username).delete();
      alert(`@${username} sistemden banlandı.`);
    }
  }

  function loadFeedbacks() {
    const list = document.getElementById('feedbacksList');
    if(!list || !db) return;
    db.collection('feedbacks').orderBy('timestamp', 'desc').onSnapshot(snap => {
      list.innerHTML = "";
      if(snap.empty) { list.innerHTML = "<p style='font-size:0.8rem; color:#888; text-align:center;'>Geri bildirim yok.</p>"; return; }
      snap.forEach(doc => {
        const d = doc.data();
        list.innerHTML += `
          <div class="report-card" style="border-color:#3498DB; background:#EBF5FB;">
            <div style="font-size:0.8rem; font-weight:700; color:#3498DB;">Gönderen: @${d.username}</div>
            <div style="font-size:0.8rem; background:white; padding:6px; border-radius:6px; margin:6px 0;">"${d.text}"</div>
            <button class="btn btn-sm btn-info" onclick="deleteFeedback('${doc.id}')">Okundu / Sil</button>
          </div>
        `;
      });
    });
  }

  async function deleteFeedback(id) { if(db) await db.collection('feedbacks').doc(id).delete(); }

  async function sendFriendRequest() {
    const target = document.getElementById('searchUserField').value.trim();
    if(!target || target === currentUser.username) { alert("Geçersiz."); return; }
    if(db) {
      const ref = db.collection('users').doc(target);
      const snap = await ref.get();
      if(snap.exists) {
        let data = snap.data();
        if(!data.friendRequests) data.friendRequests = [];
        data.friendRequests.push(currentUser.username);
        await ref.set(data, { merge: true });
        alert("Arkadaşlık isteği gönderildi!");
        document.getElementById('searchUserField').value = "";
      } else { alert("Kullanıcı bulunamadı."); }
    }
  }

  function loadFriendRequests() {
    const container = document.getElementById('friendRequestsContainer');
    if(!container || !db) return;
    db.collection('users').doc(currentUser.username).onSnapshot(doc => {
      if(doc.exists) {
        currentUser = doc.data();
        container.innerHTML = "";
        if(currentUser.friendRequests && currentUser.friendRequests.length > 0) {
          currentUser.friendRequests.forEach(req => {
            container.innerHTML += `
              <div class="friend-card" style="background:#FFF5F5;">
                <span style="font-size:0.8rem; font-weight:700;">@${req}</span>
                <button class="btn btn-sm btn-secondary" onclick="acceptFriend('${req}')">Kabul Et</button>
              </div>
            `;
          });
        }
        loadFriendsList();
      }
    });
  }

  async function acceptFriend(req) {
    if(!currentUser.friends) currentUser.friends = [];
    currentUser.friends.push(req);
    currentUser.friendRequests = currentUser.friendRequests.filter(u => u !== req);
    if(db) await db.collection('users').doc(currentUser.username).set(currentUser, { merge: true });
    loadFriendRequests();
  }

  function loadFriendsList() {
    const container = document.getElementById('friendListContainer');
    if(!container) return;
    container.innerHTML = "";
    if(!currentUser.friends || currentUser.friends.length === 0) {
      container.innerHTML = "<p style='font-size:0.75rem; color:#888; text-align:center;'>Henüz arkadaşın yok.</p>";
      return;
    }
    currentUser.friends.forEach(f => {
      container.innerHTML += `
        <div class="friend-card">
          <span style="font-size:0.8rem; font-weight:700;">@${f}</span>
          <button class="btn btn-sm btn-secondary" onclick="openChat('${f}')">Mesaj</button>
        </div>
      `;
    });
  }

  function openChat(friend) {
    currentChatFriend = friend;
    document.getElementById('chatHeaderUsername').innerText = "@" + friend;
    showScreen('screenChat');
    loadChatMessages();
  }

  function getRoomId(u1, u2) { return u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`; }

  function loadChatMessages() {
    const list = document.getElementById('chatMessagesList');
    if(!list || !db) return;
    const roomId = getRoomId(currentUser.username, currentChatFriend);
    db.collection('chats').doc(roomId).collection('messages').orderBy('timestamp', 'asc').onSnapshot(snap => {
      list.innerHTML = "";
      snap.forEach(doc => {
        const m = doc.data();
        const isMe = m.sender === currentUser.username;
        if(m.type === 'coop') {
          const completed = m.completed || false;
          list.innerHTML += `
            <div class="chat-msg ${isMe ? 'sent' : 'received'}">
              <b>🤝 Ortak Görev:</b> ${m.desc} <br><small><i class="fa-solid fa-location-dot"></i> ${m.location || 'Konum belirtilmedi'}</small>
              <div class="coop-card">
                ${completed ? '✅ Tamamlandı (+40 Puan)' : `<input type="file" id="coopFile_${doc.id}" accept="image/*" style="font-size:0.7rem; margin-bottom:4px;"><button class="btn btn-sm btn-secondary" onclick="completeCoop('${roomId}', '${doc.id}')">Kanıt Yükle & Onayla</button>`}
              </div>
            </div>
          `;
        } else {
          list.innerHTML += `<div class="chat-msg ${isMe ? 'sent' : 'received'}">${m.text}</div>`;
        }
      });
      list.scrollTop = list.scrollHeight;
    });
  }

  async function sendPrivateMessage() {
    const input = document.getElementById('chatInput');
    const txt = input.value.trim();
    if(!txt || !db) return;
    const roomId = getRoomId(currentUser.username, currentChatFriend);
    await db.collection('chats').doc(roomId).collection('messages').add({
      sender: currentUser.username, text: txt, type: 'text', timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = "";
  }

  async function clearChatHistory() {
    if(!confirm("Bu sohbetteki tüm mesajları silmek istiyor musun?") || !db) return;
    const roomId = getRoomId(currentUser.username, currentChatFriend);
    const snap = await db.collection('chats').doc(roomId).collection('messages').get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    alert("Sohbet temizlendi.");
  }

  async function openCoopModal() {
    const now = new Date().getTime();
    const lastCoop = currentUser.lastCoopTime || 0;
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    if(now - lastCoop < oneWeekMs) {
      const daysLeft = Math.ceil((oneWeekMs - (now - lastCoop)) / (1000 * 60 * 60 * 24));
      alert(`Ortak görevler haftada bir kez yapılabilir! Tekrar oluşturmak için ${daysLeft} gün beklemelisin.`);
      return;
    }

    const desc = prompt("Ortak görev adı / açıklaması:");
    if(!desc) return;
    const location = prompt("Görev için konum ismi veya adresi girin:");
    if(!location || !db) return;

    currentUser.lastCoopTime = now;
    updateUI();

    const roomId = getRoomId(currentUser.username, currentChatFriend);
    await db.collection('chats').doc(roomId).collection('messages').add({
      sender: currentUser.username, desc, location, type: 'coop', completed: false, timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Haftalık ortak görev gönderildi!");
  }

  async function completeCoop(roomId, msgId) {
    const fileInput = document.getElementById(`coopFile_${msgId}`);
    if(!fileInput || fileInput.files.length === 0) { alert("Kanıt fotoğrafı yüklemelisin! 📸"); return; }
    if(db) {
      await db.collection('chats').doc(roomId).collection('messages').doc(msgId).update({ completed: true });
      currentUser.points += 40; updateUI();
      alert("Görev tamamlandı ve +40 puan eklendi! 🐾");
    }
  }

  function deleteMyAccount() {
    if(confirm("Hesabını silmek istiyor musun?")) {
      currentUser = null;
      document.getElementById('bottomNav').style.display = 'none';
      document.getElementById('userPatiBadge').style.display = 'none';
      showScreen('screenAuthWelcome');
    }
  }

  let matchedPairs = 0;
  function startMemoryGame() {
    const todayStr = new Date().toDateString();
    if(currentUser.lastGameDate === todayStr) {
      alert("Hafıza oyununu günde sadece 1 kez oynayabilirsin! Yarın tekrar dene. 🎮");
      return;
    }

    currentUser.lastGameDate = todayStr;
    updateUI();

    document.getElementById('btnStartGame').style.display = 'none';
    document.getElementById('gameActiveArea').style.display = 'block';
    matchedPairs = 0;
    const icons = ["🐱", "🐶", "🐰", "🦊", "🐼", "🦁", "🐨", "🐯", "🐵", "🐧"];
    let deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    const grid = document.getElementById('memoryGridContainer');
    grid.innerHTML = "";
    deck.forEach((icon, idx) => {
      grid.innerHTML += `<div class="memory-card" id="mcard_${idx}" onclick="flipCard(${idx}, '${icon}')">❓</div>`;
    });
  }
  let flipped = [];
  function flipCard(idx, icon) {
    const el = document.getElementById(`mcard_${idx}`);
    if(el.classList.contains('flipped') || flipped.length >= 2) return;
    el.innerText = icon; el.classList.add('flipped');
    flipped.push({ idx, icon });
    if(flipped.length === 2) {
      setTimeout(() => {
        if(flipped[0].icon === flipped[1].icon) {
          matchedPairs++;
          document.getElementById('memoryMatches').innerText = matchedPairs;
          if(matchedPairs === 10) { currentUser.points += 100; updateUI(); alert("Tebrikler! +100 puan kazandın!"); }
        } else {
          flipped.forEach(f => { const card = document.getElementById(`mcard_${f.idx}`); card.innerText = "❓"; card.classList.remove('flipped'); });
        }
        flipped = [];
      }, 500);
    }
  }
