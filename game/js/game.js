// Clean, restored implementation
const ball = document.getElementById('ball');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const area = document.getElementById('game-area');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const finalScoreEl = document.getElementById('final-score');
const resetBtn = document.getElementById('reset-btn');

let score = 0;
const DURATION_MS = 60 * 1000; // 60 秒
let startTime = null; // ms timestamp when game started
let rafId = null;
let gameRunning = false;

function moveBall() {
  if (!area || !ball) return;
  const maxX = Math.max(0, area.clientWidth - ball.clientWidth);
  const maxY = Math.max(0, area.clientHeight - ball.clientHeight);
  ball.style.left = Math.random() * maxX + 'px';
  ball.style.top = Math.random() * maxY + 'px';
}

ball && ball.addEventListener('click', () => {
  if (!gameRunning) return;
  score++;
  scoreEl && (scoreEl.textContent = score);
  try { sessionStorage.setItem('game_score', String(score)); } catch (e) { }
  moveBall();
});

function updateTime() {
  if (!gameRunning || !startTime) return;
  const now = Date.now();
  const elapsed = now - startTime;
  const remainingMs = DURATION_MS - elapsed;
  const remainingSec = Math.ceil(Math.max(0, remainingMs) / 1000);
  timeEl && (timeEl.textContent = remainingSec);
  if (remainingMs <= 0) {
    endGame();
    return;
  }
  rafId = requestAnimationFrame(updateTime);
}

function startTimer() {
  startTime = Date.now();
  try {
    sessionStorage.setItem('game_start', String(startTime));
    sessionStorage.setItem('game_running', '1');
    sessionStorage.setItem('game_score', String(score));
  } catch (e) { }
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(updateTime);
}

startBtn && startBtn.addEventListener('click', () => {
  startOverlay && startOverlay.classList.add('hidden');
  gameRunning = true;
  score = 0;
  scoreEl && (scoreEl.textContent = score);
  moveBall();
  startTimer();
});

function endGame() {
  gameRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  startTime = null;
  try {
    sessionStorage.removeItem('game_start');
    sessionStorage.removeItem('game_running');
    sessionStorage.removeItem('game_score');
  } catch (e) { }
  finalScoreEl && (finalScoreEl.textContent = score);
  overlay && overlay.classList.remove('hidden');
}

resetBtn && resetBtn.addEventListener('click', () => {
  overlay && overlay.classList.add('hidden');
  startOverlay && startOverlay.classList.remove('hidden');
});

// Try to restore running game from sessionStorage (supports tab switch / refresh)
(function tryRestore() {
  try {
    const savedRunning = sessionStorage.getItem('game_running');
    const savedStart = sessionStorage.getItem('game_start');
    const savedScore = sessionStorage.getItem('game_score');
    if (savedRunning === '1' && savedStart) {
      const s = Number(savedStart);
      const elapsed = Date.now() - s;
      if (elapsed < DURATION_MS) {
        startTime = s;
        gameRunning = true;
        score = Number(savedScore) || 0;
        scoreEl && (scoreEl.textContent = score);
        moveBall();
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateTime);
      } else {
        sessionStorage.removeItem('game_start');
        sessionStorage.removeItem('game_running');
        sessionStorage.removeItem('game_score');
      }
    }
  } catch (e) { }
})();

// initial UI
timeEl && (timeEl.textContent = Math.ceil(DURATION_MS / 1000));
