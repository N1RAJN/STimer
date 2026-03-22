import { saveSessionInfo, savePauseInfo } from "./sessions.js";
import { SVGPaths } from "./svgs.js";

const timerContainer = document.getElementById("timerContainer");
const timerToggleButton = document.getElementById("timerToggleButton");
const timerStopButton = document.getElementById("timerStopButton");
const timerButtonState = document.getElementById("buttonState");
const buttonSvgPath = document.getElementById("buttonSVGPath");
const timerMinutes = document.getElementById("timerMinutes");
const timerSeconds = document.getElementById("timerSeconds");

const counterDelayMS = 1000;

var timerStarted = false;
var counterPaused = true;
var sessionTimerId;

export var sessionDuration = { minutes: 0, seconds: 0 };
export var pauseStartedDate;
export var sessionStartedDate;
export var sessionInfo = {
    startedAt: "",
    endedAt: "",
    pausesInSession: [
        /*
        {
            startedAt: "",
            endedAt: "",
        },*/
    ],
    title: "", // General indication of what I did (eg, neetcode )
    description: "", // What I did specifically (eg backtracking, problem name)
    tag: "", // What kind of work did I spend my time on (eg DSA)
    resources: "", // Resources that I used (eg link of the problem i solved, solutions i may have used)
};

const sessionTimer = () => {
    sessionTimerId = setInterval(() => {
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
    }, counterDelayMS);
};
const toggleTimerControlButton = (e) => {
    e.preventDefault();
    const buttonState = timerButtonState.innerHTML;
    timerButtonState.innerHTML = buttonState == "Play" ? "Pause" : "Play";
    buttonSvgPath.setAttribute("d", SVGPaths[timerButtonState.innerHTML]);
};

const toggleTimerStopButton = () => {
    timerStopButton.style.display = timerStarted ? "flex" : "none";
};
const toggleFullScreenTimer = () => {
    timerContainer.classList.add("is-Animating");
    timerStopButton.classList.add("is-Animating");
    setTimeout(() => {
        timerContainer.classList.remove("is-Animating");
        timerStopButton.classList.remove("is-Animating");
    }, 1000);
    timerContainer.style.marginTop = timerStarted ? "8rem" : "4rem";
    timerContainer.style.scale = timerStarted ? 1.6 : 1;
};

const startSessionTimer = () => {
    sessionStartedDate = new Date();
    timerStarted = true;
    counterPaused = false;
    toggleFullScreenTimer();
    toggleTimerStopButton();
    sessionTimer();
};

const toggleSessionTimer = () => {
    if (!counterPaused) {
        counterPaused = true;
        clearInterval(sessionTimerId);
        pauseStartedDate = new Date();
    } else {
        savePauseInfo();
        counterPaused = false;
        sessionTimer();
    }
};

const resetDisplayedTimer = () => {
    timerMinutes.innerHTML = "00";
    timerSeconds.innerHTML = "00";
    timerButtonState.innerHTML = "Play";
    buttonSvgPath.setAttribute("d", SVGPaths["Play"]);
    toggleFullScreenTimer();
    toggleTimerStopButton();
};

const resetSessionTimer = () => {
    clearTimeout(sessionTimerId);
    timerStarted = false;
    counterPaused = true;
    sessionDuration.minutes = 0;
    sessionDuration.seconds = 0;
    pauseStartedDate = undefined;
    sessionStartedDate = undefined;
    sessionInfo = {
        startedAt: "",
        endedAt: "",
        pausesInSession: [],
        title: "",
        description: "",
        tag: "",
        resources: "",
    };
};

timerToggleButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (!timerStarted) startSessionTimer();
    else toggleSessionTimer();
    toggleTimerControlButton(e);
});

timerStopButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (counterPaused) savePauseInfo();
    saveSessionInfo();
    resetSessionTimer();
    resetDisplayedTimer();
});
