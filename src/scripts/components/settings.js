import {
    settingsButton,
    settingsModal,
    settingsModalCloseButton,
    timerModeDropdown,
    countdownDurationContainer,
    settingsModalSaveButton,
    countdownDurationMinutes,
    countdownDurationSeconds,
} from "../elements.js";

import { state, globals } from "../state.js";

function toggleCountdownDurationContainer() {
    if (timerModeDropdown.value == "Countdown") {
        countdownDurationContainer.style.display = "flex";
    } else {
        countdownDurationContainer.style.display = "none";
    }
}
export function initSettings(toggleTimerMode) {
    settingsButton.addEventListener("click", () => {
        if (state.timerStarted) return;
        if (state.stopwatchMode) {
            countdownDurationContainer.style.display = "none";
            timerModeDropdown.value = "Stopwatch";
        } else {
            countdownDurationContainer.style.display = "flex";
            timerModeDropdown.value = "Countdown";
        }
        countdownDurationMinutes.value =
            localStorage.getItem("countDownDurationMin") ?? "60";
        countdownDurationSeconds.value =
            localStorage.getItem("countDownDurationSec") ?? "00";
        settingsModal.showModal();
    });

    settingsModalCloseButton.addEventListener("click", () => {
        settingsModal.close();
    });

    timerModeDropdown.addEventListener("change", () => {
        toggleCountdownDurationContainer();
    });

    settingsModalSaveButton.addEventListener("click", () => {
        if (timerModeDropdown.value == "Countdown") {
            const min = countdownDurationMinutes.value;
            const sec = countdownDurationSeconds.value;
            if (min && sec) {
                globals.countdownDurationSec = +min * 60 + +sec;
                // unary + for conversion to int
                localStorage.setItem("countDownDurationMin", min);
                localStorage.setItem("countDownDurationSec", sec);
            }
            state.stopwatchMode = false;
        } else {
            state.stopwatchMode = true;
        }
        toggleTimerMode();
        settingsModal.close();
    });
}
