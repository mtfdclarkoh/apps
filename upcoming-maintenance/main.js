const F = window.MTFDFirebase;
const app = F.initializeApp({apiKey:'AIzaSyDPYL6i6R_PcF8JPqsM6xocVxl2GWOqnTI',authDomain:'madison-twp-build.firebaseapp.com',projectId:'madison-twp-build',storageBucket:'madison-twp-build.firebasestorage.app',messagingSenderId:'386287384294',appId:'1:386287384294:web:4564cdf1069aac4a35ad27'});
const db = F.getFirestore(app);
const board = document.getElementById('tasks');
const text = value => typeof value === 'string' ? value.trim() : '';
let entries = [], upcoming = [], page = 0, received = false, failed = false, dayKey = '', pageStarted = Date.now();

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function updateDay() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part = type => parts.find(item => item.type === type).value;
  const key = `${part('year')}-${part('month')}-${part('day')}`;
  if (key === dayKey) return false;
  dayKey = key;
  upcoming = entries.filter(entry => text(entry.service) && validDate(text(entry.date)) && entry.date >= dayKey)
    .sort((a,b) => a.date.localeCompare(b.date) || text(a.service).localeCompare(text(b.service)) || a.id.localeCompare(b.id));
  page = 0;
  return true;
}

function element(tag, className, content) {
  const node = document.createElement(tag); node.className = className; node.textContent = content; return node;
}

function render() {
  board.replaceChildren(); pageStarted = Date.now();
  const pages = Math.ceil(upcoming.length / 4);
  document.getElementById('count').textContent = received ? `${upcoming.length} scheduled service${upcoming.length === 1 ? '' : 's'} · today and upcoming` : '';
  document.getElementById('pagination').textContent = pages > 1 ? `Page ${page + 1} of ${pages} · rotates automatically` : '';
  if (!upcoming.length) {
    board.append(element('p', 'empty', received ? 'No upcoming maintenance scheduled.' : failed ? 'Maintenance is temporarily unavailable.' : 'Loading maintenance…'));
    return;
  }
  for (const entry of upcoming.slice(page * 4, page * 4 + 4)) {
    const today = entry.date === dayKey;
    const card = element('article', `card${today ? ' today' : ''}`, '');
    const date = new Date(`${entry.date}T12:00:00Z`);
    const schedule = element('div', 'schedule', '');
    const dateLabel = element('time', '', date.toLocaleDateString('en-US', {timeZone:'UTC',weekday:'short',month:'short',day:'numeric',year:'numeric'}));
    dateLabel.dateTime = entry.date;
    schedule.append(dateLabel, element('span', 'badge', today ? 'Today' : 'Upcoming'));
    const body = element('div', 'task-body', '');
    body.append(element('h2', '', text(entry.service)), element('p', 'detail', `Vendor · ${text(entry.vendor) || 'Not specified'}`), element('p', 'detail', `Location · ${text(entry.location) || 'Not specified'}`));
    card.append(schedule, body); board.append(card);
  }
}

updateDay();
F.onSnapshot(F.collection(db, 'maintenance'), {includeMetadataChanges:true}, snapshot => {
  entries = snapshot.docs.map(doc => ({...doc.data(), id:doc.id}));
  received = true; failed = false; dayKey = ''; updateDay(); render();
  document.getElementById('connection').textContent = snapshot.metadata.fromCache ? 'Reconnecting · cached data' : 'Live';
}, () => {
  failed = true;
  document.getElementById('connection').textContent = received ? 'Connection unavailable · last received data' : 'Connection unavailable';
  render();
});

setInterval(() => {
  if (updateDay()) render();
  const elapsed = Date.now() - pageStarted;
  let longestScroll = 0;
  for (const body of board.querySelectorAll('.task-body')) {
    const distance = Math.max(0, body.scrollHeight - body.clientHeight);
    longestScroll = Math.max(longestScroll, distance);
    body.scrollTop = Math.min(distance, Math.max(0, elapsed - 4000) * 0.025);
  }
  if (elapsed >= Math.max(20000, 8000 + longestScroll / 0.025)) {
    page = (page + 1) % Math.max(1, Math.ceil(upcoming.length / 4)); render();
  }
}, 100);
window.addEventListener('offline', () => { document.getElementById('connection').textContent = received ? 'Offline · last received data' : 'Offline · waiting for connection'; });
