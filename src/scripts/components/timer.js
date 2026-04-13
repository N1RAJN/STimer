import {
    buttonSvgPath,
    timerMinutes,
    timerSeconds,
    timerToggleButton,
    timerButtonState,
    timerContainer,
    timerStopButton,
    addResourceButton,
    sessionListContainer,
} from "../elements.js";
import { state, globals } from "../state.js";
import { SVGPaths, counterDelayMS, saveIntervalMs } from "../utils.js";

function sessionTimer() {
    globals.sessionTimerId = setInterval(() => {
        globals.sessionDuration.seconds =
            (globals.sessionDuration.seconds + 1) % 60;
        if (globals.sessionDuration.seconds === 0) {
            globals.sessionDuration.minutes =
                globals.sessionDuration.minutes + 1;
            let displayedMinute = globals.sessionDuration.minutes
                .toString()
                .padStart(2, "0");
            timerMinutes.innerHTML = displayedMinute;
        }
        let displayedSecond = globals.sessionDuration.seconds
            .toString()
            .padStart(2, "0");
        timerSeconds.innerHTML = displayedSecond;
    }, counterDelayMS);
}

function toggleTimerControlButton() {
    const buttonState = timerButtonState.innerHTML;
    timerButtonState.innerHTML = buttonState == "Play" ? "Pause" : "Play";
    buttonSvgPath.setAttribute("d", SVGPaths[timerButtonState.innerHTML]);
}

function toggleTimerStopButton() {
    timerStopButton.style.display = state.timerStarted ? "flex" : "none";
    addResourceButton.style.display = state.timerStarted ? "flex" : "none";
}

function toggleFullScreenTimer() {
    timerContainer.classList.add("is-Animating");
    timerStopButton.classList.add("is-Animating");
    setTimeout(() => {
        timerContainer.classList.remove("is-Animating");
        timerStopButton.classList.remove("is-Animating");
    }, 1000);
    if (!state.isSessionListHidden) {
        sessionListContainer.style.display = "none";
        state.isSessionListHidden = true;
    }
    timerContainer.style.marginTop = state.timerStarted ? "10rem" : "6rem";
    timerContainer.style.scale = state.timerStarted ? 1.6 : 1;
}

function startSessionTimer(storeSessionLocal) {
    globals.sessionStartedDate = new Date();
    state.timerStarted = true;
    state.timerPaused = false;
    globals.localSessionId = setInterval(storeSessionLocal, saveIntervalMs);
    toggleFullScreenTimer();
    toggleTimerStopButton();
    sessionTimer();
}

function toggleSessionTimer(savePauseInfo) {
    if (!state.timerPaused) {
        state.timerPaused = true;
        globals.pauseStartedDate = new Date();
        globals.sessionInfo.PausesInSession.push({
            StartedAt: +new Date().getTime(),
            EndedAt: null,
        });
        clearInterval(globals.sessionTimerId);
    } else {
        state.timerPaused = false;
        globals.pauseEndedDate = new Date();
        savePauseInfo();
        sessionTimer();
    }
}

function resetDisplayedTimer() {
    clearTimeout(globals.sessionTimerId);
    clearTimeout(globals.localSessionId);
    state.timerStarted = false;
    state.timerPaused = true;
    timerMinutes.innerHTML = "00";
    timerSeconds.innerHTML = "00";
    timerButtonState.innerHTML = "Play";
    buttonSvgPath.setAttribute("d", SVGPaths["Play"]);
    toggleFullScreenTimer();
    toggleTimerStopButton();
}

export function resetSessionTimer() {
    globals.sessionDuration.minutes = 0;
    globals.sessionDuration.seconds = 0;
    globals.sessionInfo = {
        StartedAt: 0,
        EndedAt: 0,
        PausesInSession: [],
        Title: "",
        Description: "",
        Tags: [],
        Resources: "",
    };
}
export function initTimer(
    showSessionInfoDialog,
    storeSessionLocal,
    savePauseInfo,
) {
    timerToggleButton.addEventListener("click", () => {
        if (!state.timerStarted) {
            startSessionTimer(storeSessionLocal);
            storeSessionLocal();
        } else toggleSessionTimer(savePauseInfo);
        toggleTimerControlButton();
    });

    timerStopButton.addEventListener("click", () => {
        globals.sessionEndedDate = new Date();
        if (state.timerPaused) {
            globals.pauseEndedDate = globals.sessionEndedDate;
            savePauseInfo();
        }
        resetDisplayedTimer();
        showSessionInfoDialog("Session Completed!", "Save Session");
    });

    addResourceButton.addEventListener("click", () => {
        showSessionInfoDialog("Add Resources You Used.", "Add");
    });
}
