const STORAGE_KEY = 'daily-challenge-progress-v1';
const CHALLENGES = [
  {
    id: 1,
    title: 'Walk 15 minutes outside',
    description: 'Take a brisk walk or a short outdoor reset. Focus on breathing and clear thinking.',
    tag: 'Movement'
  },
  {
    id: 2,
    title: 'Drink 2 liters of water',
    description: 'Stay hydrated throughout the day and make water your main source of refreshment.',
    tag: 'Health'
  },
  {
    id: 3,
    title: 'Read 10 pages',
    description: 'Read a chapter or ten pages from a book, article, or lesson that helps you grow.',
    tag: 'Learning'
  },
  {
    id: 4,
    title: 'No phone for 30 minutes',
    description: 'Put your phone away for a focused work or relaxation block with no distractions.',
    tag: 'Focus'
  },
  {
    id: 5,
    title: 'Write a gratitude note',
    description: 'Write down three things you appreciate today and reflect on why they matter.',
    tag: 'Mindset'
  },
  {
    id: 6,
    title: 'Do 20 minutes of stretching',
    description: 'Use a short yoga or mobility routine to loosen up your body and reduce stress.',
    tag: 'Wellbeing'
  },
  {
    id: 7,
    title: 'Clean one small area',
    description: 'Tidy one focused space, like a desk, shelf, or your bedside table.',
    tag: 'Routine'
  },
  {
    id: 8,
    title: 'Send one encouraging message',
    description: 'Reach out to someone and share a kind note, appreciation, or motivation.',
    tag: 'Connection'
  },
  {
    id: 9,
    title: 'Practice deep breathing',
    description: 'Take five slow breath cycles and reset your energy for the next task.',
    tag: 'Calm'
  },
  {
    id: 10,
    title: 'Plan tomorrow',
    description: 'Outline the top three priorities you want to complete tomorrow.',
    tag: 'Planning'
  }
];

const MAX_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const state = {
  startDate: getStartDate(),
  completed: getInitialProgress(),
  currentDay: getCurrentDayIndex()
};

const elements = {
  todayTitle: document.getElementById('today-title'),
  dayNumber: document.getElementById('day-number'),
  streakCount: document.getElementById('streak-count'),
  completedCount: document.getElementById('completed-count'),
  progressPercent: document.getElementById('progress-percent'),
  challengeTag: document.getElementById('challenge-tag'),
  challengeDescription: document.getElementById('challenge-description'),
  completeBtn: document.getElementById('complete-btn'),
  nextBtn: document.getElementById('next-btn'),
  resetBtn: document.getElementById('reset-btn'),
  dayList: document.getElementById('day-list')
};

function getStartDate() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start;
}

function getCurrentDayIndex() {
  const now = new Date();
  const diff = Math.floor((now - state.startDate) / DAY_MS);
  return Math.max(0, Math.min(diff, MAX_DAYS - 1));
}

function getInitialProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.completed));
}

function getChallengeForDay(dayNumber) {
  const challengeIndex = (dayNumber - 1) % CHALLENGES.length;
  return CHALLENGES[challengeIndex];
}

function getDayNumberLabel(dayNumber) {
  return `Day ${dayNumber}`;
}

function isComplete(dayNumber) {
  return Boolean(state.completed[dayNumber]);
}

function getStreakCount() {
  let streak = 0;
  for (let i = 1; i <= MAX_DAYS; i += 1) {
    if (isComplete(i)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function updateStats() {
  const totalDays = MAX_DAYS;
  const completedTotal = Object.keys(state.completed).length;
  const percent = Math.round((completedTotal / totalDays) * 100);

  elements.dayNumber.textContent = String(state.currentDay + 1);
  elements.completedCount.textContent = String(completedTotal);
  elements.progressPercent.textContent = `${percent}%`;
  elements.streakCount.textContent = String(getStreakCount());
}

function renderChallenge() {
  const dayNumber = state.currentDay + 1;
  const challenge = getChallengeForDay(dayNumber);

  elements.todayTitle.textContent = challenge.title;
  elements.challengeTag.textContent = challenge.tag;
  elements.challengeDescription.textContent = challenge.description;
  elements.completeBtn.textContent = isComplete(dayNumber)
    ? 'Completed today'
    : 'Mark as done';
  elements.completeBtn.disabled = isComplete(dayNumber);
}

function renderDayList() {
  const list = [];

  for (let dayNumber = 1; dayNumber <= MAX_DAYS; dayNumber += 1) {
    const challenge = getChallengeForDay(dayNumber);
    const complete = isComplete(dayNumber);
    const active = dayNumber === state.currentDay + 1;

    const item = document.createElement('div');
    item.className = `day-item ${active ? 'active' : ''} ${complete ? 'done' : ''}`;

    item.innerHTML = `
      <div class="day-badge">${dayNumber}</div>
      <div class="day-content">
        <p class="day-name">${getDayNumberLabel(dayNumber)} - ${challenge.title}</p>
        <p class="day-summary">${challenge.description}</p>
      </div>
      <div class="day-status ${complete ? 'done' : ''}">${complete ? 'Done' : active ? 'Current' : 'Locked'}</div>
    `;

    item.addEventListener('click', () => {
      state.currentDay = Math.min(dayNumber - 1, MAX_DAYS - 1);
      render();
    });

    list.push(item);
  }

  elements.dayList.innerHTML = '';
  list.forEach((item) => elements.dayList.appendChild(item));
}

function render() {
  state.currentDay = Math.min(state.currentDay, MAX_DAYS - 1);
  updateStats();
  renderChallenge();
  renderDayList();
}

function toggleCurrentDayCompletion() {
  const dayNumber = state.currentDay + 1;
  if (!state.completed[dayNumber]) {
    state.completed[dayNumber] = true;
    saveProgress();
  }
  render();
}

function resetProgress() {
  const confirmReset = window.confirm('Reset all saved progress and start over?');
  if (!confirmReset) return;

  state.completed = {};
  saveProgress();
  state.currentDay = getCurrentDayIndex();
  render();
}

function nextDay() {
  state.currentDay = Math.min(state.currentDay + 1, MAX_DAYS - 1);
  render();
}

elements.completeBtn.addEventListener('click', toggleCurrentDayCompletion);
elements.nextBtn.addEventListener('click', nextDay);
elements.resetBtn.addEventListener('click', resetProgress);

render();
