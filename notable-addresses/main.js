const F = window.MTFDFirebase;
const app = F.initializeApp({apiKey:'AIzaSyDPYL6i6R_PcF8JPqsM6xocVxl2GWOqnTI',authDomain:'madison-twp-build.firebaseapp.com',projectId:'madison-twp-build',storageBucket:'madison-twp-build.firebasestorage.app',messagingSenderId:'386287384294',appId:'1:386287384294:web:4564cdf1069aac4a35ad27'});
const db = F.getFirestore(app);
const board = document.getElementById('addresses');
const connection = document.getElementById('connection');
const priorityOrder = {Red:0,Yellow:1,Green:2};
let addresses = [];
function message(text) {
 const element = document.createElement('p'); element.className = 'empty'; element.textContent = text; board.replaceChildren(element);
}
function render() {
 if (!addresses.length) { message('No notable addresses have been reported.'); return; }
 board.replaceChildren();
 for (const address of addresses) {
  const card = document.createElement('article');
  card.className = 'card ' + ({Red:'red',Yellow:'yellow',Green:'green'}[address.priority] || '');
  const header = document.createElement('div'); header.className = 'card-header';
  const title = document.createElement('h2'); title.textContent = address.address || 'Address not provided';
  const priority = document.createElement('span'); priority.className = 'priority'; priority.textContent = address.priority ? `${address.priority} priority` : 'Priority not specified';
  const note = document.createElement('p'); note.className = 'note'; note.textContent = address.note || 'No additional notes.';
  header.append(title, priority); card.append(header, note); board.append(card);
 }
}
F.onSnapshot(F.collection(db, 'addressNotes'), {includeMetadataChanges:true}, snapshot => {
 addresses = snapshot.docs.map(doc => doc.data()).sort((a,b) =>
  ((priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)) ||
  String(a.address || '').localeCompare(String(b.address || ''), undefined, {numeric:true}));
 render();
 connection.textContent = snapshot.metadata.fromCache ? 'Reconnecting · cached data' : 'Live';
}, () => {
 connection.textContent = 'Connection unavailable';
 if (!addresses.length) message('Notable addresses are temporarily unavailable.');
});
window.addEventListener('offline', () => { connection.textContent = 'Offline · last received data'; });
