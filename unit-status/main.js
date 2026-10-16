const F = window.MTFDFirebase;
const app = F.initializeApp({apiKey:'AIzaSyDPYL6i6R_PcF8JPqsM6xocVxl2GWOqnTI',authDomain:'madison-twp-build.firebaseapp.com',projectId:'madison-twp-build',storageBucket:'madison-twp-build.firebasestorage.app',messagingSenderId:'386287384294',appId:'1:386287384294:web:4564cdf1069aac4a35ad27'});
const db = F.getFirestore(app);
const board = document.getElementById('units');
let units = [];

function render() {
 board.replaceChildren();
 if (!units.length) {
  const message = document.createElement('p'); message.className = 'empty'; message.textContent = 'No unit status has been reported.'; board.append(message); return;
 }
 for (const unit of units) {
  const card = document.createElement('article'); card.className = 'card ' + ({'In Service':'ready','Limited Service':'limited',OOS:'oos'}[unit.status] || '');
  const title = document.createElement('h2'); title.textContent = unit.unit;
  const status = document.createElement('div'); status.className = 'badge'; status.textContent = unit.status === 'OOS' ? 'Out of service' : unit.status || 'Not reported';
  const location = document.createElement('p'); location.className = 'location'; location.textContent = unit.location || 'Location not reported';
  const notes = document.createElement('p'); notes.className = 'notes'; notes.textContent = unit.comments || '';
  const updated = document.createElement('small'); const date = unit.reported?.toDate?.(); updated.textContent = date ? 'Updated ' + date.toLocaleString() : 'Update time unavailable';
  card.append(title, status, location, notes, updated); board.append(card);
 }
}
F.onSnapshot(F.collection(db, 'unitStatus'), {includeMetadataChanges:true}, snapshot => {
 units = snapshot.docs.map(doc => ({...doc.data(),unit:doc.id})).sort((a,b) => a.unit.localeCompare(b.unit,undefined,{numeric:true}));
 render();
 document.getElementById('connection').textContent = snapshot.metadata.fromCache ? 'Reconnecting · cached data' : 'Live';
}, () => {
 document.getElementById('connection').textContent = 'Connection unavailable';
 if (!units.length) { const message = document.createElement('p'); message.className = 'empty'; message.textContent = 'Unit status is temporarily unavailable.'; board.replaceChildren(message); }
});
window.addEventListener('resize', render);
window.addEventListener('offline', () => { document.getElementById('connection').textContent = 'Offline · last received data'; });



