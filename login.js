// Sayfa yüklendiğinde kayıtlı kullanıcı bilgilerini yükle
document.addEventListener('DOMContentLoaded', function() {
  const savedLogin = localStorage.getItem('savedLogin');
  if (savedLogin) {
    const {username, password, remember} = JSON.parse(savedLogin);
    if (remember) {
      document.getElementById('login-username').value = username;
      document.getElementById('login-password').value = password;
      document.getElementById('remember-login').checked = true;
    }
  }
  
  const savedVip = localStorage.getItem('savedVip');
  if (savedVip) {
    const {username, password, remember} = JSON.parse(savedVip);
    if (remember) {
      document.getElementById('vip-username').value = username;
      document.getElementById('vip-password').value = password;
      document.getElementById('remember-vip').checked = true;
    }
  }
});

// Tab geçişleri
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// LocalStorage kullanıcılar
let users = JSON.parse(localStorage.getItem('users') || '[]');

// Mesaj gösterme fonksiyonu
function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = 'message ' + type;
  element.style.display = 'block';
  
  setTimeout(() => {
    element.style.display = 'none';
  }, 4000);
}

// Kayıt Ol
document.getElementById('reg-btn').addEventListener('click', () => {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const remember = document.getElementById('remember-register').checked;
  
  if(!username || !password){ 
    showMessage('reg-message', 'Lütfen tüm alanları doldurun', 'error');
    return; 
  }
  
  if(users.some(u=>u.username===username)){ 
    showMessage('reg-message', 'Bu kullanıcı adı zaten kullanılıyor', 'error');
    return; 
  }
  
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 10);
  
  users.push({
    username, 
    password, 
    expiry: expiry.toISOString().split('T')[0]
  });
  
  localStorage.setItem('users', JSON.stringify(users));
  
  if (remember) {
    localStorage.setItem('savedLogin', JSON.stringify({username, password, remember}));
  }
  
  showMessage('reg-message', 'Kayıt başarılı! Giriş yapabilirsiniz', 'success');
  
  document.getElementById('reg-username').value = '';
  document.getElementById('reg-password').value = '';
  document.getElementById('remember-register').checked = false;
});

// Giriş Yap
document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const remember = document.getElementById('remember-login').checked;
  const user = users.find(u=>u.username===username && u.password===password);
  
  if(user){
    if (remember) {
      localStorage.setItem('savedLogin', JSON.stringify({username, password, remember}));
    } else {
      localStorage.removeItem('savedLogin');
    }
    
    localStorage.setItem('userType','local');
    localStorage.setItem('currentUser', username);
    showMessage('login-message', `Hoş geldiniz ${username}!`, 'success');
    
    setTimeout(() => {
      window.location.href = 'panel1.html';
    }, 800);
  } else {
    showMessage('login-message', 'Kullanıcı adı veya şifre hatalı', 'error');
  }
});

// VIP Giriş
document.getElementById('vip-btn').addEventListener('click', () => {
  const inputUsername = document.getElementById('vip-username').value.trim();
  const inputPassword = document.getElementById('vip-password').value.trim();
  const remember = document.getElementById('remember-vip').checked;

  if (remember) {
    localStorage.setItem('savedVip', JSON.stringify({username: inputUsername, password: inputPassword, remember}));
  } else {
    localStorage.removeItem('savedVip');
  }

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vThpWs-7bWEnaXSDf0-4Kw5ouvm_lcJr2rodoUDJD-5892WaMjPjrjyIJUDT8QuhBfJzadUnpCBabNy/pub?output=csv')
    .then(res=>res.text())
    .then(data=>{
      const rows = data.split('\n').slice(1);
      let found = false;
      let expired = false;

      rows.forEach(r=>{
        const [u, p, expiry] = r.split(',');
        if(u.trim()===inputUsername && p.trim()===inputPassword){
          const now = new Date();
          const expiryDate = new Date(expiry.trim());
          if(now > expiryDate) expired = true;
          else found = true;
        }
      });

      if(expired) {
        showMessage('vip-message', 'VIP süreniz dolmuş!', 'error');
      } else if(found){
        localStorage.setItem('userType','vip');
        localStorage.setItem('currentUser', inputUsername);
        showMessage('vip-message', `VIP hoş geldiniz ${inputUsername}!`, 'success');
        
        setTimeout(() => {
          window.location.href = 'panel2.html';
        }, 800);
      } else {
        showMessage('vip-message', 'VIP kullanıcı bulunamadı', 'error');
      }
    }).catch(() => {
      showMessage('vip-message', 'Sunucuya bağlanılamadı', 'error');
    });
});
