const F = window.MTFDFirebase;
const app = F.initializeApp({apiKey:'AIzaSyDPYL6i6R_PcF8JPqsM6xocVxl2GWOqnTI',authDomain:'madison-twp-build.firebaseapp.com',projectId:'madison-twp-build',storageBucket:'madison-twp-build.firebasestorage.app',messagingSenderId:'386287384294',appId:'1:386287384294:web:4564cdf1069aac4a35ad27'});
const db = F.getFirestore(app);
const board = document.getElementById('tasks');
let tasks = [], todayTasks = [], page = 0, received = false, failed = false, dayKey = '';
let pageStarted = Date.now();
const text = value => typeof value === 'string' ? value.trim() : '';

function updateDay() {
  // The station is in Ohio; schedules must not depend on the display device's timezone.
  const now = new Date();
  const key = now.toLocaleDateString('en-US', {timeZone:'America/New_York'});
  if (key === dayKey) return false;
  dayKey = key;
  document.getElementById('date').textContent = now.toLocaleDateString('en-US', {timeZone:'America/New_York',weekday:'long',month:'long',day:'numeric'});
  const weekday = now.toLocaleDateString('en-US', {timeZone:'America/New_York',weekday:'long'}).toLowerCase();
  todayTasks = tasks.filter(task => {
    const days = (Array.isArray(task.day) ? task.day : [task.day]).map(value => text(value).toLowerCase());
    return text(task.task) && (days.includes('daily') || days.includes(weekday));
  }).sort((a,b) => text(a.assignee).localeCompare(text(b.assignee)) || text(a.task).localeCompare(text(b.task)) || a.id.localeCompare(b.id));
  page = 0;
  return true;
}

function render() {
  board.replaceChildren();
  pageStarted = Date.now();
  const pages = Math.ceil(todayTasks.length / 4);
  document.getElementById('count').textContent = received ? `${todayTasks.length} task${todayTasks.length === 1 ? '' : 's'} scheduled today` : '';
  document.getElementById('pagination').textContent = pages > 1 ? `Page ${page + 1} of ${pages} · rotates automatically` : '';
  if (!todayTasks.length) {
    const message = document.createElement('p'); message.className = 'empty';
    message.textContent = received ? 'No tasks scheduled for today.' : failed ? 'Daily tasks are temporarily unavailable.' : 'Loading daily tasks…';
    board.append(message); return;
  }
  for (const task of todayTasks.slice(page * 4, page * 4 + 4)) {
    const card = document.createElement('article'); card.className = 'card';
    const body = document.createElement('div'); body.className = 'task-body';
    const title = document.createElement('h2'); title.textContent = text(task.task); body.append(title);
    const assignment = document.createElement('div'); assignment.className = 'assignment';
    const assignee = document.createElement('span'); assignee.textContent = text(task.assignee) || 'Station crew';
    const badge = document.createElement('span'); badge.className = 'badge';
    const days = Array.isArray(task.day) ? task.day : [task.day];
    badge.textContent = days.some(day => text(day).toLowerCase() === 'daily') ? 'Daily' : 'Today';
    assignment.append(assignee, badge); card.append(body, assignment); board.append(card);
  }
}

updateDay();
F.onSnapshot(F.collection(db, 'dailyTasks'), {includeMetadataChanges:true}, snapshot => {
  tasks = snapshot.docs.map(doc => ({...doc.data(),id:doc.id}));
  received = true; failed = false; dayKey = ''; updateDay(); render();
  document.getElementById('connection').textContent = snapshot.metadata.fromCache ? 'Reconnecting · cached data' : 'Live';
}, () => {
  failed = true;
  document.getElementById('connection').textContent = received ? 'Connection unavailable · last received data' : 'Connection unavailable';
  render();
});
// Keep long descriptions readable without touch, mouse, or a clipped final line.
setInterval(() => {
  if (updateDay()) render();
  const elapsed = Date.now() - pageStarted;
  let longestScroll = 0;
  for (const body of board.querySelectorAll('.task-body')) {
    const distance = body.scrollHeight - body.clientHeight;
    longestScroll = Math.max(longestScroll, distance);
    body.scrollTop = Math.min(distance, Math.max(0, elapsed - 4000) * 0.025);
  }
  if (elapsed >= Math.max(20000, 8000 + longestScroll / 0.025)) {
    page = (page + 1) % Math.max(1, Math.ceil(todayTasks.length / 4)); render();
  }
}, 100);
window.addEventListener('offline', () => { document.getElementById('connection').textContent = 'Offline · last received data'; });
