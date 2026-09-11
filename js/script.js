/**
 * script.js - To-Do List Life Dashboard
 *
 * Structure:
 *   1. LocalStorage Keys
 *   2. DOM References
 *   3. State
 *   4. Greeting and DateTime
 *   5. Custom Name
 *   6. Theme (Light / Dark)
 *   7. Pomodoro Timer
 *   8. To-Do List
 *   9. Quick Links
 *  10. Init
 */

'use strict';

/* ============================================================
   1. LocalStorage Keys
============================================================ */
const KEYS = {
  theme:      'ldb_theme',
  name:       'ldb_name',
  tasks:      'ldb_tasks',
  quicklinks: 'ldb_quicklinks',
};


/* ============================================================
   2. DOM References
============================================================ */
const dom = {
  clock:          document.getElementById('clock'),
  dateDisplay:    document.getElementById('date-display'),
  greeting:       document.getElementById('greeting'),

  nameForm:       document.getElementById('name-form'),
  nameInput:      document.getElementById('name-input'),
  nameSaveBtn:    document.getElementById('name-save-btn'),

  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIcon:      document.querySelector('#theme-toggle-btn .theme-icon'),
  themeLabel:     document.querySelector('#theme-toggle-btn .theme-label'),

  timerDisplay:      document.getElementById('timer-display'),
  timerMinutes:      document.getElementById('timer-minutes'),
  timerSeconds:      document.getElementById('timer-seconds'),
  timerStartBtn:     document.getElementById('timer-start-btn'),
  timerStopBtn:      document.getElementById('timer-stop-btn'),
  timerResetBtn:     document.getElementById('timer-reset-btn'),
  timerNotification: document.getElementById('timer-notification'),

  todoForm:      document.getElementById('todo-form'),
  todoInput:     document.getElementById('todo-input'),
  todoAddBtn:    document.getElementById('todo-add-btn'),
  todoError:     document.getElementById('todo-error'),
  todoList:      document.getElementById('todo-list'),
  todoEmpty:     document.getElementById('todo-empty'),

  quicklinksForm:      document.getElementById('quicklinks-form'),
  quicklinkLabelInput: document.getElementById('quicklink-label-input'),
  quicklinkUrlInput:   document.getElementById('quicklink-url-input'),
  quicklinkAddBtn:     document.getElementById('quicklink-add-btn'),
  quicklinksError:     document.getElementById('quicklinks-error'),
  quicklinksList:      document.getElementById('quicklinks-list'),
  quicklinksEmpty:     document.getElementById('quicklinks-empty'),
};


/* ============================================================
   3. State
============================================================ */
const state = {
  /** @type {'light'|'dark'} */
  theme: 'light',

  /** @type {string} */
  userName: '',

  /**
   * Timer state
   * @type {{ intervalId: number|null, remaining: number, running: boolean }}
   */
  timer: {
    intervalId: null,
    remaining: 25 * 60,
    running: false,
  },

  /**
   * Task list
   * @type {Array<{ id: string, text: string, done: boolean }>}
   */
  tasks: [],

  /**
   * Quick links
   * @type {Array<{ id: string, label: string, url: string }>}
   */
  quicklinks: [],
};


/* ============================================================
   4. Greeting and DateTime
============================================================ */

/**
 * Return the time-of-day greeting phrase.
 * @returns {string}
 */
function getGreetingPhrase() {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 18) return 'Good Afternoon';
  if (hour >= 18 && hour < 22) return 'Good Evening';
  return 'Good Night'; // 22:00 - 04:59
}

/**
 * Build the full greeting string, appending the saved name if present.
 * @returns {string}
 */
function buildGreeting() {
  const phrase = getGreetingPhrase();
  return state.userName ? phrase + ', ' + state.userName + '!' : phrase + '!';
}

/**
 * Update the clock, date, and greeting in the DOM.
 */
function updateDateTime() {
  const now = new Date();

  // Clock: HH:MM:SS
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  dom.clock.textContent = hh + ':' + mm + ':' + ss;
  dom.clock.setAttribute('datetime', now.toISOString());

  // Date in Indonesian locale: e.g. "Jumat, 11 September 2026"
  dom.dateDisplay.textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });

  // Greeting
  dom.greeting.textContent = buildGreeting();
}

function initDateTime() {
  updateDateTime();
  setInterval(updateDateTime, 1000);
}


/* ============================================================
   5. Custom Name
============================================================ */

function loadName() {
  const saved = localStorage.getItem(KEYS.name) || '';
  state.userName = saved;
  dom.nameInput.value = saved;
}

/** @param {SubmitEvent} e */
function handleNameSubmit(e) {
  e.preventDefault();
  const val = dom.nameInput.value.trim();
  // Allow empty string to clear a saved name
  state.userName = val;
  if (val) {
    localStorage.setItem(KEYS.name, val);
  } else {
    localStorage.removeItem(KEYS.name);
  }
  dom.greeting.textContent = buildGreeting();
}

function initName() {
  loadName();
  dom.nameForm.addEventListener('submit', handleNameSubmit);
}


/* ============================================================
   6. Theme (Light / Dark)
============================================================ */

/** @param {'light'|'dark'} theme */
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);

  const isDark = theme === 'dark';
  dom.themeToggleBtn.setAttribute('aria-pressed', String(isDark));

  if (isDark) {
    dom.themeIcon.textContent  = '\u2600';
    dom.themeLabel.textContent = 'Light Mode';
    dom.themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
  } else {
    dom.themeIcon.innerHTML    = '&#127769;';
    dom.themeLabel.textContent = 'Dark Mode';
    dom.themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
  }
}

function loadTheme() {
  const saved = localStorage.getItem(KEYS.theme) || 'light';
  applyTheme(saved);
}

function handleThemeToggle() {
  const next = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem(KEYS.theme, next);
  applyTheme(next);
}

function initTheme() {
  loadTheme();
  dom.themeToggleBtn.addEventListener('click', handleThemeToggle);
}


/* ============================================================
   7. Pomodoro Timer
============================================================ */

/**
 * Format total seconds as { minutes, seconds } zero-padded strings.
 * @param {number} totalSeconds
 * @returns {{ minutes: string, seconds: string }}
 */
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return {
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

/** Render the current remaining time in the DOM. */
function renderTimer() {
  const { minutes, seconds } = formatTime(state.timer.remaining);
  dom.timerMinutes.textContent = minutes;
  dom.timerSeconds.textContent = seconds;
}

/** Sync Start/Stop button disabled states with running state. */
function updateTimerButtons() {
  dom.timerStartBtn.disabled = state.timer.running;
  dom.timerStopBtn.disabled  = !state.timer.running;
}

/** Called every second while the timer runs. */
function timerTick() {
  state.timer.remaining -= 1;
  renderTimer();

  if (state.timer.remaining <= 0) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    state.timer.running    = false;
    updateTimerButtons();
    dom.timerNotification.classList.remove('sr-only');
    dom.timerNotification.classList.add('is-visible');
  }
}

function startTimer() {
  if (state.timer.running) return;
  dom.timerNotification.classList.add('sr-only');
  dom.timerNotification.classList.remove('is-visible');
  state.timer.running    = true;
  state.timer.intervalId = setInterval(timerTick, 1000);
  updateTimerButtons();
}

function stopTimer() {
  if (!state.timer.running) return;
  clearInterval(state.timer.intervalId);
  state.timer.intervalId = null;
  state.timer.running    = false;
  updateTimerButtons();
}

function resetTimer() {
  clearInterval(state.timer.intervalId);
  state.timer.intervalId = null;
  state.timer.running    = false;
  state.timer.remaining  = 25 * 60;
  renderTimer();
  updateTimerButtons();
  dom.timerNotification.classList.add('sr-only');
  dom.timerNotification.classList.remove('is-visible');
}

function initTimer() {
  renderTimer();
  updateTimerButtons();
  dom.timerStartBtn.addEventListener('click', startTimer);
  dom.timerStopBtn.addEventListener('click', stopTimer);
  dom.timerResetBtn.addEventListener('click', resetTimer);
}


/* ============================================================
   8. To-Do List
============================================================ */

/** Persist task list to LocalStorage. */
function saveTasks() {
  localStorage.setItem(KEYS.tasks, JSON.stringify(state.tasks));
}

/** Load tasks from LocalStorage into state. */
function loadTasks() {
  try {
    const raw = localStorage.getItem(KEYS.tasks);
    state.tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.tasks = [];
  }
}

/** Show or hide the empty-state message. */
function updateTodoEmpty() {
  dom.todoEmpty.style.display = state.tasks.length === 0 ? 'block' : 'none';
}

/**
 * Build a single task <li> element.
 * @param {{ id: string, text: string, done: boolean }} task
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (task.done ? ' todo-item--done' : '');
  li.dataset.id = task.id;

  // Circular complete-toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'todo-item__toggle';
  toggleBtn.setAttribute('aria-label', task.done ? 'Mark as incomplete' : 'Mark as complete');
  toggleBtn.setAttribute('aria-pressed', String(task.done));
  toggleBtn.textContent = task.done ? '\u2713' : '';
  toggleBtn.addEventListener('click', function () { toggleTask(task.id); });

  // Task text
  const span = document.createElement('span');
  span.className = 'todo-item__text';
  span.textContent = task.text;

  // Action buttons wrapper
  const actions = document.createElement('div');
  actions.className = 'todo-item__actions';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn--sm btn--edit';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.textContent = '\u270F';
  editBtn.addEventListener('click', function () { startEditTask(task.id, li); });

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'btn btn--sm btn--delete';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.textContent = '\uD83D\uDDD1';
  delBtn.addEventListener('click', function () { deleteTask(task.id); });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  li.appendChild(toggleBtn);
  li.appendChild(span);
  li.appendChild(actions);
  return li;
}

/** Re-render the full task list from state. */
function renderTasks() {
  dom.todoList.innerHTML = '';
  state.tasks.forEach(function (task) {
    dom.todoList.appendChild(createTaskElement(task));
  });
  updateTodoEmpty();
}

/** @param {string} msg */
function showTodoError(msg) {
  dom.todoError.textContent = msg;
  dom.todoError.hidden = false;
}

function clearTodoError() {
  dom.todoError.textContent = '';
  dom.todoError.hidden = true;
}

/** @param {SubmitEvent} e */
function handleAddTask(e) {
  e.preventDefault();
  const text = dom.todoInput.value.trim();

  if (!text) {
    showTodoError('Please enter a task.');
    return;
  }

  // Prevent duplicates (case-insensitive)
  const duplicate = state.tasks.some(function (t) {
    return t.text.toLowerCase() === text.toLowerCase();
  });
  if (duplicate) {
    showTodoError('This task already exists.');
    return;
  }

  clearTodoError();
  state.tasks.push({ id: generateId(), text: text, done: false });
  saveTasks();
  renderTasks();
  dom.todoInput.value = '';
  dom.todoInput.focus();
}

/** @param {string} taskId */
function toggleTask(taskId) {
  const task = state.tasks.find(function (t) { return t.id === taskId; });
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  renderTasks();
}

/** @param {string} taskId */
function deleteTask(taskId) {
  state.tasks = state.tasks.filter(function (t) { return t.id !== taskId; });
  saveTasks();
  renderTasks();
}

/**
 * Switch a task row into inline-edit mode.
 * @param {string} taskId
 * @param {HTMLLIElement} li
 */
function startEditTask(taskId, li) {
  const task = state.tasks.find(function (t) { return t.id === taskId; });
  if (!task) return;

  const span    = li.querySelector('.todo-item__text');
  const actions = li.querySelector('.todo-item__actions');

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-item__edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', 'Edit task text');

  li.replaceChild(input, span);
  actions.style.display = 'none';
  input.focus();
  input.select();

  let committed = false;

  function commit() {
    if (committed) return;
    committed = true;
    confirmEditTask(taskId, input.value, li, actions);
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter')  { ev.preventDefault(); commit(); }
    if (ev.key === 'Escape') { ev.preventDefault(); committed = true; cancelEditTask(li, task.text, actions); }
  });
}

/**
 * Commit an inline edit.
 * @param {string} taskId
 * @param {string} newText
 * @param {HTMLLIElement} li
 * @param {HTMLElement} actions
 */
function confirmEditTask(taskId, newText, li, actions) {
  const trimmed = (newText || '').trim();
  const task = state.tasks.find(function (t) { return t.id === taskId; });
  if (!task) return;
  if (!trimmed) {
    cancelEditTask(li, task.text, actions);
    return;
  }
  // Prevent editing into a duplicate of another task
  var isDuplicate = state.tasks.some(function (t) {
    return t.id !== taskId && t.text.toLowerCase() === trimmed.toLowerCase();
  });
  if (isDuplicate) {
    // Keep the inline input active and show a friendly message
    showTodoError('A task with that name already exists.');
    var inp = li.querySelector('.todo-item__edit-input');
    if (inp) { inp.focus(); inp.select(); }
    // Reset committed flag so blur does not re-fire commit
    return;
  }
  clearTodoError();
  task.text = trimmed;
  saveTasks();
  renderTasks();
}

/**
 * Cancel an inline edit, restoring the original text.
 * @param {HTMLLIElement} li
 * @param {string} originalText
 * @param {HTMLElement} actions
 */
function cancelEditTask(li, originalText, actions) {
  const input = li.querySelector('.todo-item__edit-input');
  if (!input) return;
  const span = document.createElement('span');
  span.className = 'todo-item__text';
  span.textContent = originalText;
  li.replaceChild(span, input);
  actions.style.display = '';
}

function initTodo() {
  loadTasks();
  renderTasks();
  dom.todoForm.addEventListener('submit', handleAddTask);
  dom.todoInput.addEventListener('input', clearTodoError);
}


/* ============================================================
   9. Quick Links
============================================================ */

/** Persist quick-links to LocalStorage. */
function saveQuicklinks() {
  localStorage.setItem(KEYS.quicklinks, JSON.stringify(state.quicklinks));
}

/** Load quick-links from LocalStorage into state. */
function loadQuicklinks() {
  try {
    const raw = localStorage.getItem(KEYS.quicklinks);
    state.quicklinks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.quicklinks = [];
  }
}

/** Show or hide the empty-state message. */
function updateQuicklinksEmpty() {
  dom.quicklinksEmpty.style.display = state.quicklinks.length === 0 ? 'block' : 'none';
}

/**
 * Build a single quick-link <li> element.
 * @param {{ id: string, label: string, url: string }} link
 * @returns {HTMLLIElement}
 */
function createQuicklinkElement(link) {
  const li = document.createElement('li');
  li.className = 'quicklink-item';
  li.dataset.id = link.id;

  const anchor = document.createElement('a');
  anchor.href = link.url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.className = 'quicklink-item__anchor';
  anchor.textContent = link.label;

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'btn btn--sm btn--delete';
  delBtn.setAttribute('aria-label', 'Delete ' + link.label + ' link');
  delBtn.textContent = '\uD83D\uDDD1';
  delBtn.addEventListener('click', function () { deleteQuicklink(link.id); });

  li.appendChild(anchor);
  li.appendChild(delBtn);
  return li;
}

/** Re-render the full quick-links list from state. */
function renderQuicklinks() {
  dom.quicklinksList.innerHTML = '';
  state.quicklinks.forEach(function (link) {
    dom.quicklinksList.appendChild(createQuicklinkElement(link));
  });
  updateQuicklinksEmpty();
}

/** @param {string} msg */
function showQuicklinksError(msg) {
  dom.quicklinksError.textContent = msg;
  dom.quicklinksError.hidden = false;
}

function clearQuicklinksError() {
  dom.quicklinksError.textContent = '';
  dom.quicklinksError.hidden = true;
}

/** @param {SubmitEvent} e */
function handleAddQuicklink(e) {
  e.preventDefault();
  const label = dom.quicklinkLabelInput.value.trim();
  const url   = dom.quicklinkUrlInput.value.trim();

  if (!label) {
    showQuicklinksError('Please enter a link name.');
    return;
  }
  if (!url) {
    showQuicklinksError('Please enter a URL.');
    return;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showQuicklinksError('URL must start with http:// or https://');
    return;
  }

  clearQuicklinksError();
  state.quicklinks.push({ id: generateId(), label: label, url: url });
  saveQuicklinks();
  renderQuicklinks();
  dom.quicklinkLabelInput.value = '';
  dom.quicklinkUrlInput.value   = '';
  dom.quicklinkLabelInput.focus();
}

/** @param {string} linkId */
function deleteQuicklink(linkId) {
  state.quicklinks = state.quicklinks.filter(function (l) { return l.id !== linkId; });
  saveQuicklinks();
  renderQuicklinks();
}

function initQuicklinks() {
  loadQuicklinks();
  renderQuicklinks();
  dom.quicklinksForm.addEventListener('submit', handleAddQuicklink);
  dom.quicklinkLabelInput.addEventListener('input', clearQuicklinksError);
  dom.quicklinkUrlInput.addEventListener('input', clearQuicklinksError);
}


/* ============================================================
   10. Init
============================================================ */

/** @returns {string} */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

document.addEventListener('DOMContentLoaded', function () {
  initTheme();      // run first to avoid theme flash
  initDateTime();
  initName();
  initTimer();
  initTodo();
  initQuicklinks();
});
