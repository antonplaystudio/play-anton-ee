const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const modal = $('#authModal');
const form = $('#authForm');
const modeTabs = $$('.auth-tab');
let authMode = 'login';
let toastTimer;

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}
function openModal(mode = 'login') {
  setAuthMode(mode);
  $('#formMessage').textContent = '';
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#username').focus(), 80);
}
function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}
function setAuthMode(mode) {
  authMode = mode;
  modeTabs.forEach(tab => tab.classList.toggle('selected', tab.dataset.mode === mode));
  const registering = mode === 'register';
  $('#modalTitle').textContent = registering ? 'Создай свой профиль' : 'С возвращением!';
  $('#modalSubtitle').textContent = registering ? 'Придумай имя игрока и пароль для демо-профиля.' : 'Войди в свой игровой профиль на этом устройстве.';
  $('#emailWrap').classList.toggle('hidden', !registering);
  $('#email').required = false;
  $('#password').autocomplete = registering ? 'new-password' : 'current-password';
  $('#authSubmit').innerHTML = registering ? 'Создать профиль <span>→</span>' : 'Войти в игру <span>→</span>';
  $('#formMessage').textContent = '';
}
function getUsers() {
  try { return JSON.parse(localStorage.getItem('antonUsers') || '{}'); }
  catch { return {}; }
}
function saveUsers(users) {
  localStorage.setItem('antonUsers', JSON.stringify(users));
}
function setLoggedIn(username) {
  localStorage.setItem('antonCurrentUser', username);
  updateHeader();
  closeModal();
  showToast(`Добро пожаловать, ${username}! GG 🎮`);
}
function updateHeader() {
  const current = localStorage.getItem('antonCurrentUser');
  $('#userPill').classList.toggle('hidden', !current);
  $('#loginOpen').classList.toggle('hidden', !!current);
  $('#registerOpen').classList.toggle('hidden', !!current);
  if (current) {
    $('#userName').textContent = current;
    $('.avatar').textContent = current.trim().charAt(0).toUpperCase();
  }
}
$('#loginOpen').addEventListener('click', () => openModal('login'));
$('#registerOpen').addEventListener('click', () => openModal('register'));
$('#communityJoin').addEventListener('click', () => openModal(localStorage.getItem('antonCurrentUser') ? 'login' : 'register'));
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
modeTabs.forEach(tab => tab.addEventListener('click', () => setAuthMode(tab.dataset.mode)));

form.addEventListener('submit', event => {
  event.preventDefault();
  const username = $('#username').value.trim();
  const password = $('#password').value;
  const email = $('#email').value.trim();
  const message = $('#formMessage');
  if (username.length < 2) { message.textContent = 'Имя должно содержать минимум 2 символа.'; return; }
  if (password.length < 4) { message.textContent = 'Пароль должен содержать минимум 4 символа.'; return; }
  const users = getUsers();
  const key = username.toLowerCase();
  if (authMode === 'register') {
    if (users[key]) { message.textContent = 'Это имя уже занято на этом устройстве. Выбери другое или войди.'; return; }
    // This is a local demo only. Do not use a real password here.
    users[key] = { username, password, email };
    saveUsers(users);
    setLoggedIn(username);
  } else {
    if (!users[key]) { message.textContent = 'Профиль не найден на этом устройстве. Сначала зарегистрируйся.'; return; }
    if (users[key].password !== password) { message.textContent = 'Пароль не подходит. Попробуй ещё раз.'; return; }
    setLoggedIn(users[key].username);
  }
});
$('#logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('antonCurrentUser');
  updateHeader();
  showToast('Ты вышел из профиля. До встречи, игрок!');
});
$$('.game-action').forEach(button => button.addEventListener('click', () => {
  const game = button.dataset.game;
  $('#noticeTitle').textContent = `${game} выбрана!`;
  $('#noticeText').textContent = 'Это демо-карточка: здесь можно подключить настоящую игру или ссылку на неё.';
  $('#gameNotice').classList.add('notice-active');
  showToast(`Выбрана игра: ${game} 🎮`);
}));
$('#noticeClose').addEventListener('click', () => {
  $('#noticeTitle').textContent = 'Готов к игре?';
  $('#noticeText').textContent = 'Нажми на стрелку у карточки, чтобы выбрать игру.';
});
$('#discoverBtn').addEventListener('click', () => {
  $('#games').scrollIntoView({ behavior: 'smooth' });
  showToast('Выбирай своё следующее приключение ✦');
});
$('#menuToggle').addEventListener('click', () => {
  const nav = $('#nav');
  const open = nav.classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', String(open));
});
$$('#nav a').forEach(link => link.addEventListener('click', () => {
  $('#nav').classList.remove('open');
  $('#menuToggle').setAttribute('aria-expanded', 'false');
}));
updateHeader();
