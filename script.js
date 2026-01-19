/* =============================================
   GLOBAL VARIABLES
   ============================================= */

// Array to store all active timer objects
const timers = [];

// Maximum number of timers allowed simultaneously
const MAX_TIMERS = 3;

// Web Audio API context for playing notification sounds
let audioContext = null;

/* =============================================
   AUDIO FUNCTIONS
   ============================================= */

/**
 * Initializes the Web Audio API context
 * Must be called after user interaction (browser security requirement)
 */
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

/**
 * Plays a pleasant chime notification when a timer completes
 * Creates a 4-note ascending melody using oscillators
 */
function playNotificationSound() {
    initAudio();

    // Musical notes for the chime (frequencies in Hz)
    const notes = [880, 1100, 1320, 880];  // A5, C#6, E6, A5 - creates a pleasant arpeggio
    const noteDuration = 0.15;              // Duration of each note in seconds

    // Play each note in sequence
    notes.forEach((freq, index) => {
        // Create oscillator (sound generator) and gain node (volume control)
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect: oscillator -> gain -> speakers
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set oscillator to sine wave for a smooth, pleasant tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * noteDuration);

        // Volume envelope: quick attack, gradual decay
        // Starts at 0, ramps to 0.8 (loud), then fades to 0.01
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * noteDuration);
        gainNode.gain.linearRampToValueAtTime(0.8, audioContext.currentTime + index * noteDuration + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * noteDuration + noteDuration);

        // Schedule note to play and stop
        oscillator.start(audioContext.currentTime + index * noteDuration);
        oscillator.stop(audioContext.currentTime + index * noteDuration + noteDuration);
    });
}

/* =============================================
   TIME UTILITY FUNCTIONS
   ============================================= */

/**
 * Converts total seconds to HH:MM:SS format string
 * @param {number} seconds - Total seconds to convert
 * @returns {string} Formatted time string (e.g., "01:30:45")
 */
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Converts hours, minutes, seconds inputs to total seconds
 * @param {string|number} hours - Hours value
 * @param {string|number} minutes - Minutes value
 * @param {string|number} seconds - Seconds value
 * @returns {number} Total seconds
 */
function parseTime(hours, minutes, seconds) {
    return (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
}

/* =============================================
   UI UPDATE FUNCTIONS
   ============================================= */

/**
 * Updates the visual state of the three "+" buttons
 * Disables buttons based on how many timers are active
 */
function updateAddButtons() {
    const buttons = [
        document.getElementById('addBtn1'),
        document.getElementById('addBtn2'),
        document.getElementById('addBtn3')
    ];

    // Disable buttons for each active timer (left to right)
    buttons.forEach((btn, index) => {
        btn.disabled = index < timers.length;
        btn.style.opacity = index < timers.length ? '0.3' : '1';
    });
}

/**
 * Creates the HTML element structure for a new timer
 * @param {number} id - Unique identifier for this timer
 * @returns {HTMLElement} The timer wrapper element
 */
function createTimerElement(id) {
    const wrapper = document.createElement('div');
    wrapper.className = 'timer-wrapper';
    wrapper.id = `timer-wrapper-${id}`;

    // Timer HTML structure includes:
    // 1. Circular display with progress ring
    // 2. Time input fields (hours:minutes:seconds)
    // 3. Control buttons (Start, Reset, Remove)
    wrapper.innerHTML = `
        <div class="timer">
            <div class="timer-circle" id="timer-circle-${id}" style="--progress: 360deg;">
                <span class="timer-display" id="timer-display-${id}">00:00:00</span>
            </div>
        </div>
        <div class="time-input-group" id="input-group-${id}">
            <input type="number" class="time-input" id="hours-${id}" min="0" max="99" placeholder="HH" value="0">
            <span class="time-separator">:</span>
            <input type="number" class="time-input" id="minutes-${id}" min="0" max="59" placeholder="MM" value="0">
            <span class="time-separator">:</span>
            <input type="number" class="time-input" id="seconds-${id}" min="0" max="59" placeholder="SS" value="0">
        </div>
        <div class="timer-controls">
            <button class="timer-btn btn-start" id="start-btn-${id}" onclick="startTimer(${id})">Start</button>
            <button class="timer-btn btn-reset" id="reset-btn-${id}" onclick="resetTimer(${id})">Reset</button>
            <button class="timer-btn btn-remove" onclick="removeTimer(${id})">Remove</button>
        </div>
    `;

    return wrapper;
}

/* =============================================
   TIMER MANAGEMENT FUNCTIONS
   ============================================= */

/**
 * Adds a new timer to the page
 * Called when user clicks one of the "+" buttons
 */
function addTimer() {
    // Don't exceed maximum timer limit
    if (timers.length >= MAX_TIMERS) return;

    // Initialize audio context on first user interaction
    initAudio();

    // Create unique ID using timestamp
    const id = Date.now();

    // Create timer object to track state
    const timer = {
        id,
        totalSeconds: 0,      // Original duration set by user
        remainingSeconds: 0,  // Current countdown value
        intervalId: null,     // Reference to setInterval for stopping
        isRunning: false      // Whether timer is currently counting down
    };

    timers.push(timer);

    // Add timer element to the DOM
    const container = document.getElementById('timersContainer');
    container.appendChild(createTimerElement(id));

    // Update "+" button states
    updateAddButtons();
}

/**
 * Starts, pauses, or resumes a timer
 * @param {number} id - The timer ID to control
 */
function startTimer(id) {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;

    const startBtn = document.getElementById(`start-btn-${id}`);
    const inputGroup = document.getElementById(`input-group-${id}`);

    if (timer.isRunning) {
        // PAUSE: Stop the countdown interval
        clearInterval(timer.intervalId);
        timer.isRunning = false;
        startBtn.textContent = 'Resume';
        startBtn.className = 'timer-btn btn-start';
    } else {
        // START or RESUME
        if (timer.remainingSeconds === 0) {
            // New start - read values from input fields
            const hours = document.getElementById(`hours-${id}`).value;
            const minutes = document.getElementById(`minutes-${id}`).value;
            const seconds = document.getElementById(`seconds-${id}`).value;

            timer.totalSeconds = parseTime(hours, minutes, seconds);
            timer.remainingSeconds = timer.totalSeconds;

            // Don't start if no time was entered
            if (timer.totalSeconds === 0) return;
        }

        // Hide input fields while timer is running
        inputGroup.style.display = 'none';
        timer.isRunning = true;
        startBtn.textContent = 'Pause';
        startBtn.className = 'timer-btn btn-pause';

        // Start countdown - tick() runs every 1000ms (1 second)
        timer.intervalId = setInterval(() => tick(id), 1000);
    }
}

/**
 * Handles one second of countdown for a timer
 * Updates display, progress ring, and checks for completion
 * @param {number} id - The timer ID to tick
 */
function tick(id) {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;

    // Decrement remaining time
    timer.remainingSeconds--;

    const display = document.getElementById(`timer-display-${id}`);
    const circle = document.getElementById(`timer-circle-${id}`);

    // Update the time display
    display.textContent = formatTime(timer.remainingSeconds);

    // Update circular progress ring
    // --progress CSS variable controls the conic-gradient angle (360deg = full, 0deg = empty)
    const progress = (timer.remainingSeconds / timer.totalSeconds) * 360;
    circle.style.setProperty('--progress', `${progress}deg`);

    // Update color based on remaining time percentage
    const percentRemaining = timer.remainingSeconds / timer.totalSeconds;
    circle.classList.remove('warning', 'danger', 'completed');

    if (percentRemaining <= 0.1) {
        // Red color when 10% or less remaining
        circle.classList.add('danger');
    } else if (percentRemaining <= 0.25) {
        // Orange color when 25% or less remaining
        circle.classList.add('warning');
    }

    // Check if timer has completed
    if (timer.remainingSeconds <= 0) {
        // Stop the interval
        clearInterval(timer.intervalId);
        timer.isRunning = false;

        // Add completed styling (triggers pulse animation)
        circle.classList.add('completed');

        // Reset button state
        const startBtn = document.getElementById(`start-btn-${id}`);
        startBtn.textContent = 'Start';
        startBtn.className = 'timer-btn btn-start';

        // Play notification sound
        playNotificationSound();
    }
}

/**
 * Resets a timer to its initial state
 * @param {number} id - The timer ID to reset
 */
function resetTimer(id) {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;

    // Stop any running countdown
    clearInterval(timer.intervalId);
    timer.isRunning = false;
    timer.remainingSeconds = 0;
    timer.totalSeconds = 0;

    // Get DOM elements
    const display = document.getElementById(`timer-display-${id}`);
    const circle = document.getElementById(`timer-circle-${id}`);
    const startBtn = document.getElementById(`start-btn-${id}`);
    const inputGroup = document.getElementById(`input-group-${id}`);

    // Reset visual state
    display.textContent = '00:00:00';
    circle.style.setProperty('--progress', '360deg');  // Full ring
    circle.classList.remove('warning', 'danger', 'completed');
    startBtn.textContent = 'Start';
    startBtn.className = 'timer-btn btn-start';
    inputGroup.style.display = 'flex';  // Show input fields again

    // Reset input field values
    document.getElementById(`hours-${id}`).value = 0;
    document.getElementById(`minutes-${id}`).value = 0;
    document.getElementById(`seconds-${id}`).value = 0;
}

/**
 * Removes a timer from the page completely
 * @param {number} id - The timer ID to remove
 */
function removeTimer(id) {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;

    // Stop any running countdown
    clearInterval(timer.intervalId);

    // Remove from timers array
    const index = timers.indexOf(timer);
    timers.splice(index, 1);

    // Remove DOM element
    const wrapper = document.getElementById(`timer-wrapper-${id}`);
    wrapper.remove();

    // Update "+" button states
    updateAddButtons();
}
