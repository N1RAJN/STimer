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
        globals.tagEditBuffer.Added.push(addSessionTagSettingInput.value);
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
    if (
        classes.contains("Session-Tag-Card") &&
        e.target.contentEditable != "true"
    ) {
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
            if (oldTag != editingTag.innerHTML) {
                globals.tagEditBuffer.Updated[editingTag.innerHTML] = oldTag;
            }
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
        console.log(globals.tagEditBuffer);
    }
}

function deleteSessionTag(e) {
    e.stopPropagation();
    // TODO: soft remove the cards, completely remove after saving and removed from db
    // tagsListSettings.removeChild(globals.selectedTag);

    globals.selectedTag.style.display = "none";
    globals.tagEditBuffer.Deleted.push(globals.selectedTag.innerHTML);
    tagSettingContextMenu.style.display = "none";
}

function resolveTagEditHistory() {
    const addedBuffer = globals.tagEditBuffer.Added;
    const deleteBuffer = globals.tagEditBuffer.Deleted;
    const updateBuffer = globals.tagEditBuffer.Updated;
    for (let [newTag, oldTag] of Object.entries(updateBuffer)) {
        // Walk back the update chain and connect the latest tag name with the original one
        while (updateBuffer[oldTag]) {
            updateBuffer[newTag] = updateBuffer[oldTag];
            delete updateBuffer[oldTag];
            oldTag = updateBuffer[newTag];
        }
        const index = deleteBuffer.indexOf(newTag);
        // If this tag was deleted, replace the current entry (newest name) with original one
        if (index > -1) {
            deleteBuffer[index] = updateBuffer[newTag];
            delete updateBuffer[newTag];
        }
    }
    const updates = Object.entries(updateBuffer);
    addedBuffer.forEach((addedTag, addedIndex) => {
        for (let [newTag, oldTag] of updates) {
            if (addedTag == oldTag) {
                addedBuffer[addedIndex] = newTag;
                delete updateBuffer[newTag];
            }
        }
    });
    for (let delIdx in deleteBuffer) {
        let addIdx = addedBuffer.indexOf(deleteBuffer[delIdx]);
        if (addIdx > -1) {
            addedBuffer.splice(addIdx, 1);
            deleteBuffer.splice(delIdx, 1);
        }
    }
}

async function saveSessionTagsEdits() {
    if (
        Object.keys(globals.tagEditBuffer.Updated).length > 0 ||
        globals.tagEditBuffer.Deleted.length > 0 ||
        globals.tagEditBuffer.Added.length > 0
    ) {
        try {
            const response = await fetch("/api/updateTags", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(globals.tagEditBuffer),
            });
            if (!response.ok ){
                console.err("Some Error Occuered");
                return;
            }
            const message = await response.text();
            console.log(message);
        } catch (err) {
            console.err(err);
        }
    }
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
    resolveTagEditHistory();
    saveSessionTagsEdits();
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
