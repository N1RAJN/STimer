const timerContainer = document.getElementById("timerContainer");
const timerToggleButton = document.getElementById("timerToggleButton");
const timerStopButton = document.getElementById("timerStopButton");
const timerButtonState = document.getElementById("buttonState");
const buttonSvgPath = document.getElementById("buttonSVGPath");
const timer = document.getElementById("timer");
const timerMinutes = document.getElementById("timerMinutes");
const timerSeconds = document.getElementById("timerSeconds");

const counterDelay = 1000; // milliseconds

var timerStarted = false;
var counterPaused = true;

var pauseDuration = { minutes: 0, seconds: 0 };
var sessionDuration = { minutes: 0, seconds: 0 };

var timerId;

const SVGPaths = {
    Pause: "M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z",
    Play: "M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z",
};

const toggleControlButton = (e) => {
    e.preventDefault();
    const bState = timerButtonState.innerHTML;
    timerButtonState.innerHTML = bState == "Play" ? "Pause" : "Play";
    buttonSvgPath.setAttribute("d", SVGPaths[timerButtonState.innerHTML]);
};

const counter = () => {
    timerId = setInterval(() => {
        sessionDuration.seconds = (sessionDuration.seconds + 1) % 60;
        if (sessionDuration.seconds === 0) {
            sessionDuration.minutes = sessionDuration.minutes + 1;
            let displayedMinute = sessionDuration.minutes
                .toString()
                .padStart(2, "0");
            timerMinutes.innerHTML = displayedMinute;
        }
        let displayedSecond = sessionDuration.seconds
            .toString()
            .padStart(2, "0");
        timerSeconds.innerHTML = displayedSecond;
        //counter();
    }, counterDelay);
};

const startTimer = () => {
    timerStarted = true;
    counterPaused = false;
    toggleTimerStopButton(); // display it
    counter();
};

const toggleTimer = () => {
    if (!counterPaused) {
        counterPaused = true;
        clearTimeout(timerId);
    } else {
        counterPaused = false;
        counter();
    }
};
const resetTimer = () => {
    clearTimeout(timerId);
    timerStarted = false;
    counterPaused = true;
    sessionDuration.minutes = 0;
    sessionDuration.seconds = 0;
    timerMinutes.innerHTML = "00";
    timerSeconds.innerHTML = "00";
    timerButtonState.innerHTML = "Play";
    buttonSvgPath.setAttribute("d", SVGPaths["Play"]);
    toggleTimerStopButton();
};

const toggleTimerStopButton = () => {
    if (!timerStarted) {
        timerStopButton.style.display = "none";
    } else {
        timerStopButton.style.display = "flex";
    }
};

timerToggleButton.addEventListener("click", (e) => {
    if (!timerStarted) {
        startTimer();
    } else {
        toggleTimer();
    }
    toggleControlButton(e);
});

timerStopButton.addEventListener("click", (e) => {
    e.preventDefault();
    resetTimer();
});
