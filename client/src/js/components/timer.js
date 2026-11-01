/**
 * Interactive Practice Stopwatch & Sprint Timer Component
 */

let timerInterval = null;
let secondsLeft = 0;
let isRunning = false;

export function setupPracticeTimer() {
    const timerDisplay = document.getElementById("timer-display");
    const startBtn = document.getElementById("timer-start-btn");
    const resetBtn = document.getElementById("timer-reset-btn");
    const presetBtns = document.querySelectorAll(".timer-preset-btn");

    if (!timerDisplay || !startBtn) return;

    presetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const mins = parseInt(btn.getAttribute("data-mins")) || 15;
            setTimerSeconds(mins * 60);
        });
    });

    startBtn.addEventListener("click", () => {
        if (isRunning) {
            pauseTimer();
        } else {
            if (secondsLeft <= 0) setTimerSeconds(15 * 60);
            startTimer();
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            resetTimer();
        });
    }

    updateDisplay();
}

function setTimerSeconds(secs) {
    pauseTimer();
    secondsLeft = secs;
    updateDisplay();
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    updateStartButtonUI(true);

    timerInterval = setInterval(() => {
        if (secondsLeft > 0) {
            secondsLeft--;
            updateDisplay();
        } else {
            pauseTimer();
            alert("⏰ Practice Sprint Finished! Take a short break or review your solution.");
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    updateStartButtonUI(false);
}

function resetTimer() {
    pauseTimer();
    secondsLeft = 15 * 60;
    updateDisplay();
}

function updateDisplay() {
    const timerDisplay = document.getElementById("timer-display");
    if (!timerDisplay) return;

    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateStartButtonUI(active) {
    const startBtn = document.getElementById("timer-start-btn");
    if (!startBtn) return;
    if (active) {
        startBtn.innerHTML = `<i data-lucide="pause"></i> Pause`;
        startBtn.classList.remove("btn-primary");
        startBtn.classList.add("btn-warning");
    } else {
        startBtn.innerHTML = `<i data-lucide="play"></i> Start Sprint`;
        startBtn.classList.remove("btn-warning");
        startBtn.classList.add("btn-primary");
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
