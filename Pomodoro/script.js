let workDuration = parseInt(localStorage.getItem("workDuration")) || 25;
let shortBreak = parseInt(localStorage.getItem("shortBreak")) || 5;
let longBreak = parseInt(localStorage.getItem("longBreak")) || 15;
let autoStartNext = JSON.parse(localStorage.getItem("autoStartNext")) ?? true;
let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled")) ?? true; // 🔊 新規

let currentSession = 0;
let maxSessions = 4;
let timeLeft = workDuration * 60;
let totalTime = timeLeft;
let timer = null;
let isWork = true;

const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");
const progressBar = document.getElementById("progress-bar");
const beep = document.getElementById("beep");

// 通知権限確認
if ("Notification" in window) {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

// 通知関数
function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body: body, icon: "icon.png" });
  }
}

function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timerDisplay.textContent = `${min}:${sec.toString().padStart(2, "0")}`;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  progressBar.style.width = `${progress}%`;
}

function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      if (soundEnabled) beep.play(); // 🔊 音ON/OFF対応
      nextPhase();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  currentSession = 0;
  isWork = true;
  timeLeft = workDuration * 60;
  totalTime = timeLeft;
  updateProgress();
  updateTimerDisplay();
  statusDisplay.textContent = "Work Time";
}

function skipTimer() {
  clearInterval(timer);
  timer = null;
  nextPhase();
}

function nextPhase() {
  if (isWork) {
    currentSession++;
    if (currentSession % maxSessions === 0) {
      timeLeft = longBreak * 60;
      statusDisplay.textContent = "Long Break";
      sendNotification("休憩タイム", "長めの休憩です。リラックスしましょう！");
    } else {
      timeLeft = shortBreak * 60;
      statusDisplay.textContent = "Short Break";
      sendNotification("休憩タイム", "少し休憩しましょう。");
    }
  } else {
    timeLeft = workDuration * 60;
    statusDisplay.textContent = "Work Time";
    sendNotification("作業再開", "次の作業セッションを始めましょう！");
  }

  totalTime = timeLeft;
  isWork = !isWork;
  updateProgress();
  updateTimerDisplay();

  if (autoStartNext) {
    startTimer();
  }
}

function updateProgress() {
  const container = document.getElementById("progress");
  container.innerHTML = "";
  for (let i = 0; i < maxSessions; i++) {
    const dot = document.createElement("div");
    dot.classList.add("progress-dot");
    if (i < currentSession) dot.classList.add("active");
    container.appendChild(dot);
  }
}

// イベント登録
document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);
document.getElementById("skipBtn").addEventListener("click", skipTimer);

// 設定モーダル
const modal = document.getElementById("settingsModal");
document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("workInput").value = workDuration;
  document.getElementById("shortBreakInput").value = shortBreak;
  document.getElementById("longBreakInput").value = longBreak;
  document.getElementById("autoStartCheckbox").checked = autoStartNext;
  document.getElementById("soundCheckbox").checked = soundEnabled; // 🔊 追加
  modal.style.display = "flex";
});

// モーダルを閉じる
document.getElementById("closeSettings").addEventListener("click", (e) => {
  modal.style.display = "none";
  e.stopPropagation();
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// 設定保存
document.getElementById("saveSettings").addEventListener("click", () => {
  workDuration = parseInt(document.getElementById("workInput").value);
  shortBreak = parseInt(document.getElementById("shortBreakInput").value);
  longBreak = parseInt(document.getElementById("longBreakInput").value);
  autoStartNext = document.getElementById("autoStartCheckbox").checked;
  soundEnabled = document.getElementById("soundCheckbox").checked; // 🔊 追加

  localStorage.setItem("workDuration", workDuration);
  localStorage.setItem("shortBreak", shortBreak);
  localStorage.setItem("longBreak", longBreak);
  localStorage.setItem("autoStartNext", autoStartNext);
  localStorage.setItem("soundEnabled", soundEnabled); // 🔊 追加

  timeLeft = workDuration * 60;
  totalTime = timeLeft;
  updateTimerDisplay();
  modal.style.display = "none";
});

// 初期化
updateProgress();
updateTimerDisplay();
