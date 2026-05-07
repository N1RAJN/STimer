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
    tagSettingContextMenu,
    editTagButton,
    deleteTagButton,
} from "../elements.js";

import { state, globals } from "../state.js";

function displaySettingsModal() {
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
}
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

function showAddSettingTagsInput() {
    const buttonText = addSessionTagSettingButton.innerHTML;
    if (buttonText == "+") {
        addSessionTagSettingButton.innerHTML = "x";
        addSessionTagSettingInput.style.visibility = "visible";
        addSessionTagSettingInput.focus();
    } else {
        hideSessionTagInput();
    }
}

function addSettingTags(e) {
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
}

function deselectAllCards() {
    tagSettingContextMenu.style.display = "none";
    for (const card of tagsListSettings.getElementsByClassName(
        "Session-Tag-Card",
    )) {
        card.classList.remove("Selected");
    }
    globals.selectedTag = null;
}

function showContextMenu(e) {
    e.preventDefault();
    const classes = e.target.classList;
    if (classes.contains("Session-Tag-Card")) {
        tagSettingContextMenu.style.left = `${e.pageX + 10}px`;
        tagSettingContextMenu.style.top = `${e.pageY + 10}px`;
        tagSettingContextMenu.style.display = "flex";
        e.target.classList.add("Selected");
        globals.selectedTag = e.target;
    }
}

function editSessionTag(e) {
    e.stopPropagation();
    let tagEdited = false;
    const editingTag = globals.selectedTag;
    const oldTag = editingTag.innerHTML;
    editingTag.contentEditable = "true";
    editingTag.classList.remove("Selected");
    editingTag.focus();
    editingTag.addEventListener("keydown", enterHandler);

    editingTag.addEventListener("blur", escapeHandler);
    tagSettingContextMenu.style.display = "none";

    function enterHandler(e) {
        if (e.key == "Enter") {
            e.preventDefault();
            tagEdited = true;
            editingTag.contentEditable = "false";
            editingTag.blur();
            globals.tagEditBuffer.Updated.push({
                old: oldTag,
                new: editingTag.innerHTML,
            });
        }
    }
    function escapeHandler() {
        if (!tagEdited) {
            editingTag.innerHTML = oldTag;
            editingTag.contentEditable = "false";
        }
        editingTag.removeEventListener("keydown", enterHandler);
        editingTag.removeEventListener("blur", escapeHandler);
        globals.selectedTag = null;
        state.editedTag = false;
    }
}

function deleteSessionTag(e) {
    e.stopPropagation();
    globals.tagEditBuffer.Deleted.push(globals.selectedTag.innerHTML);
}

function saveSettings(toggleTimerMode) {
    if (timerModeDropdown.value == "Countdown") {
        const min = countdownDurationMinutes.value;
        const sec = countdownDurationSeconds.value;
        if (min || sec) {
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
}

export function initSettings(toggleTimerMode) {
    settingsButton.addEventListener("click", displaySettingsModal);

    settingsModalCloseButton.addEventListener("click", () => {
        hideSessionTagInput();
        settingsModal.close();
    });

    timerModeDropdown.addEventListener("change", () => {
        toggleCountdownDurationContainer();
    });

    addSessionTagSettingButton.addEventListener(
        "click",
        showAddSettingTagsInput,
    );
    addSessionTagSettingInput.addEventListener("keypress", addSettingTags);

    document.addEventListener("click", (e) => {
        if (
            !e.target.closest(
                "Session-Tag-Card" &&
                    !e.target.closest("Tag-Setting-Context-Menu"),
            )
        )
            deselectAllCards();
    });

    tagsListSettings.addEventListener("contextmenu", (e) => {
        deselectAllCards();
        showContextMenu(e);
    });

    editTagButton.addEventListener("click", editSessionTag);

    deleteTagButton.addEventListener("click", deleteSessionTag);

    settingsModalSaveButton.addEventListener("click", () => {
        saveSettings(toggleTimerMode);
    });
}
