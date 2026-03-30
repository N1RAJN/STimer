import { saveSessionInfo, savePauseInfo } from "./sessions.js";
import { SVGPaths } from "./svgs.js";

const timerContainer = document.getElementById("timerContainer");
const timerToggleButton = document.getElementById("timerToggleButton");
const timerStopButton = document.getElementById("timerStopButton");
const timerButtonState = document.getElementById("buttonState");
const buttonSvgPath = document.getElementById("buttonSVGPath");
const timerMinutes = document.getElementById("timerMinutes");
const timerSeconds = document.getElementById("timerSeconds");
const sessionInfoDialog = document.getElementById("sessionInfoDialog");
const sessionTagsList = document.getElementById("sessionTagsList");
const sessionInfoSaveButton = document.getElementById("sessionInfoSaveButton");
const sessionInfoDialogCloseButton = document.getElementById(
    "sessionInfoDialogCloseButton",
);
const sessionDate = document.getElementById("sessionDate");
export const sessionTitle = document.getElementById("sessionTitle");
export const sessionDescription = document.getElementById("sessionDescription");
export const sessionResources = document.getElementById("sessionResources");

const counterDelayMS = 1000;
var timerStarted = false;
var counterPaused = true;
var sessionTimerId;

export var sessionDuration = { minutes: 0, seconds: 0 };
export var pauseStartedDate;
export var sessionStartedDate;
export var pauseEndedDate;
export var sessionEndedDate;
export var sessionInfo = {
    startedAt: "",
    endedAt: "",
    duration: "",
    pausesInSession: [
        /*
        {
            startedAt: "",
            endedAt: "",
        },*/
    ],
    title: "", // General indication of what I did (eg, neetcode )
    description: "", // What I did specifically (eg backtracking, problem name)
    tags: [], // What kind of work did I spend my time on (eg DSA)
    resources: "", // Resources that I used (eg link of the problem i solved, solutions i may have used)
};

(async () => {
    const result = await fetch("/api/getTags");
    if (!result.ok) {
        console.error("Fetching the tags failed.");
        return;
    }
    const tags = await result.json();
})();

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
        pauseEndedDate = new Date();
        savePauseInfo();
        counterPaused = false;
        sessionTimer();
    }
};

const resetDisplayedTimer = () => {
    clearTimeout(sessionTimerId);
    timerStarted = false;
    counterPaused = true;
    timerMinutes.innerHTML = "00";
    timerSeconds.innerHTML = "00";
    timerButtonState.innerHTML = "Play";
    buttonSvgPath.setAttribute("d", SVGPaths["Play"]);
    toggleFullScreenTimer();
    toggleTimerStopButton();
};

const resetSessionTimer = () => {
    sessionDuration.minutes = 0;
    sessionDuration.seconds = 0;
    pauseStartedDate = null;
    sessionStartedDate = null;
    sessionInfo = {
        startedAt: "",
        endedAt: "",
        pausesInSession: [],
        title: "",
        description: "",
        tags: [],
        resources: "",
    };
};

const resetSessionInfoInputs = () => {
    [sessionDate, sessionDescription, sessionTitle, sessionResources].forEach(
        (input) => {
            input.value = "";
        },
    );
};

const showSessionInfoDialog = () => {
    sessionDate.value = sessionStartedDate.toDateString();
    sessionInfoDialog.showModal();
};

timerToggleButton.addEventListener("click", () => {
    if (!timerStarted) startSessionTimer();
    else toggleSessionTimer();
    toggleTimerControlButton(e);
});

timerStopButton.addEventListener("click", () => {
    sessionEndedDate = new Date();
    if (counterPaused) {
        pauseEndedDate = new Date();
        savePauseInfo();
    }
    resetDisplayedTimer();
    showSessionInfoDialog();
});

sessionInfoDialogCloseButton.addEventListener("click", () => {
    sessionInfoDialog.close();
});

sessionInfoSaveButton.addEventListener("click", (e) => {
    e.preventDefault();
    sessionInfoDialog.close();
});

sessionInfoDialog.addEventListener("close", async () => {
    try {
        const result = await saveSessionInfo();
        if (!result.ok) {
            console.log("Some Error Occured!");
            return;
        }
        const message = await result.text();
        console.log(message);
        resetSessionInfoInputs();
    } catch (err) {
        console.log(err);
    }
    resetSessionTimer();
});
