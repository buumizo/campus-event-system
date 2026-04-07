/* ── DATA ─────────────────────────────────────────────── */
const EVENTS = [
  {
    id: 1, emoji: '💻', category: 'workshop',
    title: 'Introduction to Machine Learning',
    date: 'Sat, 12 Apr 2025', time: '09:00–12:00',
    location: 'ICTC Lab 3', seats: 4, capacity: 30,
    rating: 4.6, reviews: 18,
    description: 'A hands-on workshop covering ML fundamentals using Python & scikit-learn.',
    organiser: 'ICTAZ Association',
  },
  {
    id: 2, emoji: '🎤', category: 'seminar',
    title: 'Entrepreneurship in the Digital Age',
    date: 'Mon, 14 Apr 2025', time: '14:00–16:00',
    location: 'Business School Auditorium', seats: 22, capacity: 80,
    rating: 4.2, reviews: 34,
    description: 'Hear from young Zambian entrepreneurs about building startups in Africa.',
    organiser: 'ZCASEBA Association',
  },
  {
    id: 3, emoji: '⚽', category: 'sports',
    title: 'Inter-Faculty Football Tournament',
    date: 'Sat, 19 Apr 2025', time: '08:00–17:00',
    location: 'Main Sports Ground', seats: 0, capacity: 120,
    rating: 4.8, reviews: 55,
    description: '6 faculties compete in a full-day football knockout — come watch or play!',
    organiser: 'ZUSA Sports Department',
  },
  {
    id: 4, emoji: '🎭', category: 'club',
    title: 'Drama Club: "Echoes of Zambia" Show',
    date: 'Fri, 25 Apr 2025', time: '18:30–20:30',
    location: 'Great East Hall', seats: 12, capacity: 150,
    rating: 4.9, reviews: 41,
    description: 'An original play exploring Zambian history, culture, and identity.',
    organiser: 'ZCAS Drama Club',
  },
  {
    id: 5, emoji: '🔬', category: 'seminar',
    title: 'Climate Change & Food Security in Zambia',
    date: 'Wed, 23 Apr 2025', time: '10:00–12:00',
    location: 'Natural Sciences Block A', seats: 17, capacity: 50,
    rating: 4.4, reviews: 12,
    description: 'Panel of researchers discuss climate impacts on Zambian agriculture.',
    organiser: 'Dept. of Environmental Sciences',
  },
  {
    id: 6, emoji: '🎨', category: 'club',
    title: 'Art Exhibition: "Visions of Tomorrow"',
    date: 'Thu, 24 Apr 2025', time: '10:00–16:00',
    location: 'Room 123 Levy Building', seats: 40, capacity: 200,
    rating: 4.7, reviews: 28,
    description: 'Student artworks spanning paintings, sculpture, and digital art.',
    organiser: 'ZCAS Art Society',
  },
];

let registeredEvents = new Set(); // IDs of events user registered for
let feedbackGiven = new Set();    // IDs of events user gave feedback on
let currentFilter = 'all';
let currentEventId = null;
let currentStarRating = 0;

const STAR_LABELS = ['','Terrible','Poor','Okay','Good','Excellent!'];

/* ── RENDER CARDS ──────────────────────────────────────── */
function renderGrid() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const grid  = document.getElementById('events-grid');
  const count = document.getElementById('event-count');

  let filtered = EVENTS.filter(e => {
    const matchCat = currentFilter === 'all' || e.category === currentFilter;
    const matchQ   = !query || e.title.toLowerCase().includes(query)
                             || e.organiser.toLowerCase().includes(query);
    return matchCat && matchQ;
  });

  count.textContent = `${filtered.length} event${filtered.length !== 1 ? 's' : ''}`;
  grid.innerHTML = '';

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="emoji">🔍</div><p>No events match your search.</p></div>`;
    return;
  }

  filtered.forEach(ev => {
    const isReg  = registeredEvents.has(ev.id);
    const isFull = ev.seats === 0 && !isReg;
    const stars  = '★'.repeat(Math.round(ev.rating)) + '☆'.repeat(5 - Math.round(ev.rating));
    const btnLabel = isReg ? '✓ Registered' : (isFull ? 'Full' : 'Register');
    const btnClass = isReg ? 'registered' : (isFull ? 'full' : '');

    const card = document.createElement('div');
    card.className = 'event-card';
    card.setAttribute('role','article');
    card.setAttribute('aria-label', ev.title);
    card.innerHTML = `
      <div class="card-thumb" style="background:${thumbColor(ev.category)}">
        ${ev.emoji}
        <span class="card-tag">${capitalize(ev.category)}</span>
        <span class="card-seats">${isFull ? 'Full' : ev.seats + ' spots left'}</span>
      </div>
      <div class="card-body">
        <h3>${ev.title}</h3>
        <div class="card-meta">
          <span><span class="ico">📅</span>${ev.date}</span>
          <span><span class="ico">⏰</span>${ev.time}</span>
          <span><span class="ico">📍</span>${ev.location}</span>
          <span><span class="ico">👤</span>${ev.organiser}</span>
        </div>
      </div>
      <div class="card-footer">
        <div>
          <span class="card-stars">${stars}</span>
          <span class="card-rating-label">${ev.rating} (${ev.reviews})</span>
        </div>
        <button class="register-btn ${btnClass}"
          onclick="event.stopPropagation(); openRegister(${ev.id})"
          ${btnClass === 'full' ? 'disabled' : ''}
          aria-label="${isReg ? 'Already registered for ' : 'Register for '}${ev.title}">
          ${btnLabel}
        </button>
      </div>
    `;
    card.addEventListener('click', () => showEventDetail(ev.id));
    grid.appendChild(card);
  });
}

function thumbColor(cat) {
  return { workshop:'#eef1fd', seminar:'#fff4ef', sports:'#edfbf3', club:'#fdf5ee' }[cat] || '#f0f0f0';
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── FILTER / SEARCH ──────────────────────────────────── */
function setFilter(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGrid();
}
function filterEvents() { renderGrid(); }

/* ── SCREEN NAVIGATION ────────────────────────────────── */
function goHome() {
  document.getElementById('screen-home').classList.add('active');
  document.getElementById('screen-my').classList.remove('active');
  updateBottomNav('home');
}
function goMyEvents() {
  document.getElementById('screen-home').classList.remove('active');
  document.getElementById('screen-my').classList.add('active');
  updateBottomNav('my');
  renderMyEvents();
}
function updateBottomNav(active) {
  document.querySelectorAll('.bnav-item').forEach((el, i) => {
    el.classList.toggle('active',
      (active === 'home' && i % 3 === 0) || (active === 'my' && i % 3 === 1));
  });
}

/* ── EVENT DETAIL (simplified — opens register directly) ── */
function showEventDetail(id) {
  openRegister(id);
}

/* ── REGISTER MODAL ───────────────────────────────────── */
function openRegister(id) {
  const ev = EVENTS.find(e => e.id === id);
  currentEventId = id;

  if (registeredEvents.has(id)) {
    showToast('You\'re already registered for this event!');
    return;
  }
  if (ev.seats === 0) { showToast('Sorry, this event is full.'); return; }

  document.getElementById('reg-emoji').textContent      = ev.emoji;
  document.getElementById('reg-event-name').textContent = ev.title;
  document.getElementById('reg-event-meta').textContent = `${ev.date} · ${ev.time} · ${ev.location}`;
  document.getElementById('reg-form-area').style.display = '';
  document.getElementById('reg-success').style.display   = 'none';
  // Pre-fill name for demo
  document.getElementById('reg-name').value  = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-program').value = '';
  document.getElementById('reg-special').value = '';
  clearErr('row-name'); clearErr('row-email');
  openModal('modal-register');
}

function submitRegistration() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  let valid = true;

  if (!name) { setErr('row-name'); valid = false; }
  if (!email || !email.includes('@')) { setErr('row-email'); valid = false; }
  if (!valid) return;

  registeredEvents.add(currentEventId);
  const ev = EVENTS.find(e => e.id === currentEventId);
  if (ev.seats > 0) ev.seats--;

  document.getElementById('reg-form-area').style.display = 'none';
  document.getElementById('reg-success').style.display   = 'block';
  renderGrid(); // refresh card state
}

/* ── FEEDBACK MODAL ───────────────────────────────────── */
function openFeedback(id) {
  const ev = EVENTS.find(e => e.id === id);
  currentEventId = id;
  currentStarRating = 0;

  document.getElementById('fb-emoji').textContent      = ev.emoji;
  document.getElementById('fb-event-name').textContent = ev.title;
  document.getElementById('fb-event-meta').textContent = `${ev.date} · ${ev.organiser}`;
  document.getElementById('fb-form-area').style.display = '';
  document.getElementById('fb-success').style.display   = 'none';
  document.getElementById('fb-text').value = '';
  resetStars();
  document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('selected'));
  openModal('modal-feedback');
}

function setStar(n) {
  currentStarRating = n;
  const btns = document.querySelectorAll('#star-picker button');
  btns.forEach((b, i) => b.classList.toggle('lit', i < n));
  document.getElementById('star-label').textContent = STAR_LABELS[n];
}
function resetStars() {
  currentStarRating = 0;
  document.querySelectorAll('#star-picker button').forEach(b => b.classList.remove('lit'));
  document.getElementById('star-label').textContent = 'Tap a star to rate';
}
function toggleTag(el) { el.classList.toggle('selected'); }

function submitFeedback() {
  if (!currentStarRating) {
    showToast('Please select a star rating first!');
    return;
  }
  feedbackGiven.add(currentEventId);
  document.getElementById('fb-form-area').style.display = 'none';
  document.getElementById('fb-success').style.display   = 'block';
  renderMyEvents();
}

/* ── MY EVENTS SCREEN ─────────────────────────────────── */
function renderMyEvents() {
  const list  = document.getElementById('my-events-list');
  const empty = document.getElementById('my-empty');

  if (registeredEvents.size === 0) {
    empty.style.display = 'flex';
    list.querySelectorAll('.my-event-row').forEach(el => el.remove());
    return;
  }
  empty.style.display = 'none';
  list.querySelectorAll('.my-event-row').forEach(el => el.remove());

  registeredEvents.forEach(id => {
    const ev = EVENTS.find(e => e.id === id);
    const hasFb = feedbackGiven.has(id);
    // treat first 2 as "attended" for demo
    const isAttended = id <= 2;

    const row = document.createElement('div');
    row.className = 'my-event-row';
    row.innerHTML = `
      <div class="my-event-emoji">${ev.emoji}</div>
      <div class="my-event-info">
        <h4>${ev.title}</h4>
        <p>${ev.date} · ${ev.time} · ${ev.location}</p>
      </div>
      <div class="my-event-actions">
        <span class="event-status ${isAttended ? 'status-attended' : 'status-upcoming'}">
          ${isAttended ? '✓ Attended' : 'Upcoming'}
        </span>
        ${isAttended ? `<button class="feedback-btn ${hasFb ? 'done' : ''}"
          onclick="${hasFb ? '' : 'openFeedback(' + id + ')'} "
          ${hasFb ? 'disabled' : ''}>
          ${hasFb ? '✓ Reviewed' : '⭐ Give Feedback'}
        </button>` : ''}
      </div>
    `;
    list.appendChild(row);
  });
}

/* ── MODAL HELPERS ────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
});

/* ── ERROR HELPERS ────────────────────────────────────── */
function setErr(rowId) { document.getElementById(rowId).classList.add('has-error'); }
function clearErr(rowId) { document.getElementById(rowId).classList.remove('has-error'); }

/* ── TOAST ────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── INIT ─────────────────────────────────────────────── */
renderGrid();