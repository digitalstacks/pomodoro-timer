let timeLeft;
let timerId = null;
let isWorkTime = true;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const modeText = document.getElementById('mode-text');
const toggleButton = document.getElementById('toggle-mode');

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

document.addEventListener('click', (e) => {
    const timePicker = document.getElementById('time-picker');
    const reminderButton = document.getElementById('set-reminder');
    
    if (!timePicker.contains(e.target) && !reminderButton.contains(e.target)) {
        timePicker.style.display = 'none';
    }
});

document.addEventListener('click', (e) => {
    const focusModal = document.getElementById('focus-modal');
    const startButton = document.getElementById('start');
    const focusModalContent = document.querySelector('.focus-modal-content');
    
    if (focusModal.style.display === 'flex' && 
        !focusModalContent.contains(e.target) && 
        !startButton.contains(e.target)) {
        focusModal.style.display = 'none';
        if (timerId === null) {
            startButton.textContent = 'Start';
        }
    }
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

function updateDisplay(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update the display elements
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    // Update the browser tab title
    const mode = isWorkTime ? 'Work' : 'Break';
    document.title = `${timeString} - ${mode} Timer`;
}

function switchMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
    modeText.textContent = isWorkTime ? 'Work Time' : 'Break Time';
    updateDisplay(timeLeft);
    updateToggleButtonText();
}

function startTimer() {
    if (timerId !== null) return;
    
    // Show focus modal only during work time
    if (isWorkTime && (!document.getElementById('focus-display').style.display || 
        document.getElementById('focus-display').style.display === 'none')) {
        document.getElementById('focus-modal').style.display = 'flex';
        return;
    }
    
    if (!timeLeft) {
        timeLeft = WORK_TIME;
    }

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay(timeLeft);

        if (timeLeft === 0) {
            clearInterval(timerId);
            timerId = null;
            switchMode();
            alert(isWorkTime ? 'Break time is over! Time to work!' : 'Work time is over! Take a break!');
        }
    }, 1000);

    startButton.textContent = 'Pause';
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isWorkTime = true;
    timeLeft = WORK_TIME;
    modeText.textContent = 'Work Time';
    updateDisplay(timeLeft);
    startButton.textContent = 'Start';
    
    // Clear focus
    const focusDisplay = document.getElementById('focus-display');
    const focusText = document.getElementById('focus-text');
    focusDisplay.style.display = 'none';
    focusText.textContent = '';
}

function manualModeSwitch() {
    clearInterval(timerId);
    timerId = null;
    startButton.textContent = 'Start';
    switchMode();
    updateToggleButtonText();
}

function updateToggleButtonText() {
    const toggleIcon = document.getElementById('toggle-mode');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggleIcon.textContent = isDark ? '☀️' : '🌙';
}

function addFiveMinutes() {
    timeLeft += 5 * 60; // Add 5 minutes in seconds
    updateDisplay(timeLeft);
}

startButton.addEventListener('click', () => {
    if (timerId === null) {
        startTimer();
    } else {
        clearInterval(timerId);
        timerId = null;
        startButton.textContent = 'Start';
    }
});

resetButton.addEventListener('click', resetTimer);
toggleButton.addEventListener('click', () => {
    toggleTheme();
    manualModeSwitch();
});

// Initialize the display
timeLeft = WORK_TIME;
updateDisplay(timeLeft);
updateToggleButtonText();

document.getElementById('add-time').addEventListener('click', addFiveMinutes);

function setReminder() {
    const timePicker = document.getElementById('time-picker');
    timePicker.style.display = timePicker.style.display === 'none' ? 'block' : 'none';
}

function confirmReminder() {
    const timeInput = document.getElementById('reminder-time').value;
    if (!timeInput) {
        alert("Please select a time");
        return;
    }

    const [hours, minutes] = timeInput.split(':');
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours));
    reminderTime.setMinutes(parseInt(minutes));
    reminderTime.setSeconds(0);
    
    if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime - now;

    // Request notification permission
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Timer Reminder', {
                body: "LFG!! Time to set your timer!",
                icon: '/favicon.ico'
            });
        } else {
            alert("Time to start your Pomodoro session!");
        }
    }, timeUntilReminder);

    alert(`Reminder set for ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`);
    document.getElementById('time-picker').style.display = 'none';
}

document.getElementById('set-reminder').addEventListener('click', setReminder);
document.getElementById('confirm-reminder').addEventListener('click', confirmReminder);

document.getElementById('close-picker').addEventListener('click', () => {
    document.getElementById('time-picker').style.display = 'none';
});

// Add new functions for handling focus
function setFocus() {
    const focusInput = document.getElementById('focus-input');
    const focusText = document.getElementById('focus-text');
    const focusDisplay = document.getElementById('focus-display');
    const focusModal = document.getElementById('focus-modal');
    
    if (focusInput.value.trim() === '') {
        alert('Please enter what you\'re focusing on');
        return;
    }
    
    focusText.textContent = focusInput.value;
    focusDisplay.style.display = 'block';
    focusModal.style.display = 'none';
    focusInput.value = '';
    
    // Start the timer after setting focus
    startTimer();
}

// Add event listeners
document.getElementById('confirm-focus').addEventListener('click', setFocus);
document.getElementById('focus-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') setFocus();
});

document.getElementById('close-focus').addEventListener('click', () => {
    document.getElementById('focus-modal').style.display = 'none';
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const focusModal = document.getElementById('focus-modal');
        focusModal.style.display = 'none';
    }
}); 