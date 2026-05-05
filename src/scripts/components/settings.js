import {
    sessionTagsList,
    settingsButton,
    settingsModal,
    tagsListSettings,
    settingsModalCloseButton,
    timerModeDropdown,
    countdownDurationContainer,
    settingsModalSaveButton,
    countdownDurationMinutes,
    countdownDurationSeconds,
    addSessionTagSettingButton,
    addSessionTagSettingInput,
} from "../elements.js";

import { state, globals } from "../state.js";

function hideSessionTagInput() {
    addSessionTagSettingButton.innerHTML = "+";
    addSessionTagSettingInput.style.visibility = "hidden";
    addSessionTagSettingInput.value = "";
}
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
        hideSessionTagInput();
        settingsModal.close();
    });

    timerModeDropdown.addEventListener("change", () => {
        toggleCountdownDurationContainer();
    });

    addSessionTagSettingButton.addEventListener("click", () => {
        const buttonText = addSessionTagSettingButton.innerHTML;
        if (buttonText == "+") {
            addSessionTagSettingButton.innerHTML = "x";
            addSessionTagSettingInput.style.visibility = "visible";
            addSessionTagSettingInput.focus();
        } else {
            hideSessionTagInput();
        }
    });
    addSessionTagSettingInput.addEventListener("keypress", (e) => {
        if (e.key == "Enter") {
            const tagDiv = document.createElement("div");
            tagDiv.innerHTML = addSessionTagSettingInput.value;
            tagDiv.className = "Session-Tag-Card";
            sessionTagsList.appendChild(tagDiv);
            tagsListSettings.appendChild(tagDiv.cloneNode(true));
            addSessionTagSettingButton.innerHTML = "+";
            addSessionTagSettingInput.style.visibility = "hidden";
            addSessionTagSettingInput.value = "";
        }
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
        hideSessionTagInput();
        settingsModal.close();
    });
}
