import {
    sessionDate,
    sessionDescription,
    sessionTitle,
    sessionResources,
    addSessionTagButton,
    addSessionTagInput,
    sessionInfoDialog,
    sessionInfoDialogCloseButton,
    sessionInfoDialogHeader,
    sessionInfoSaveButton,
    sessionTagsList,
    tagsListSettings,
} from "../elements.js";

import { state, globals } from "../state.js";
import { customEvents, currDate } from "../utils.js";
function resetSessionInfoInputs() {
    [sessionDate, sessionDescription, sessionTitle, sessionResources].forEach(
        (input) => {
            input.value = "";
        },
    );
    addSessionTagButton.innerHTML = "+";
    addSessionTagInput.style.visibility = "hidden";
}
export function showSessionInfoDialog(
    header = "Session Completed!",
    button = "Save Session",
) {
    sessionDate.value = globals.sessionStartedDate.toDateString();
    sessionInfoDialogHeader.innerHTML = header;
    sessionInfoSaveButton.innerText = button;
    sessionInfoDialog.showModal();
}

export function initSessionModal(
    resetSessionTimer,
    filterSessionList,
    sortSessionList,
    populateSessionList,
    saveSessionInfo,
    calculateAlphaOfCell,
) {
    document.addEventListener(customEvents.TimerStopped, () => {
        showSessionInfoDialog();
    });
    sessionTagsList.addEventListener("click", (e) => {
        const classes = e.target.classList;
        if (classes.contains("Session-Tag-Card")) {
            if (classes.contains("Selected")) {
                e.target.classList.remove("Selected");
            } else {
                e.target.classList.add("Selected");
            }
        }
    });

    sessionInfoDialogCloseButton.addEventListener("click", () => {
        sessionInfoDialog.close();
    });

    sessionInfoSaveButton.addEventListener("click", (e) => {
        e.preventDefault();
        sessionInfoDialog.close();
    });

    addSessionTagButton.addEventListener("click", () => {
        const buttonText = addSessionTagButton.innerHTML;
        if (buttonText == "+") {
            addSessionTagButton.innerHTML = "x";
            addSessionTagInput.style.visibility = "visible";
            addSessionTagInput.focus();
        } else {
            addSessionTagButton.innerHTML = "+";
            addSessionTagInput.style.visibility = "hidden";
            addSessionTagInput.value = "";
        }
    });

    addSessionTagInput.addEventListener("keypress", (e) => {
        if (e.key == "Enter") {
            const tagDiv = document.createElement("div");
            tagDiv.innerHTML = addSessionTagInput.value;
            tagDiv.className = "Session-Tag-Card";
            sessionTagsList.appendChild(tagDiv);
            tagsListSettings.appendChild(tagDiv.cloneNode(true));
            addSessionTagButton.innerHTML = "+";
            addSessionTagInput.style.visibility = "hidden";
            addSessionTagInput.value = "";
        }
    });

    sessionInfoDialog.addEventListener("close", async () => {
        if (state.timerStarted) return;
        try {
            const result = await saveSessionInfo();
            if (!result.ok) {
                console.error("Some Error Occured!");
                return;
            }
            localStorage.removeItem("sessionSaved");
            localStorage.removeItem("activeSession");
            state.sessionSaved = true;

            const response = await result.text();
            const message = response.split("#");
            console.log(message[0]);

            const dateString = currDate.toDateString();
            // Add the saved session to the all session list
            globals.allSessions[message[1]] = JSON.parse(
                JSON.stringify(globals.sessionInfo),
            );
            console.log(globals.allSessionsByDate);
            globals.allSessionsByDate[dateString].totalSessionDuration +=
                globals.sessionInfo.Duration;
            const alpha = calculateAlphaOfCell(dateString);
            document.getElementById(`${dateString}`).style.backgroundColor =
                `rgba(255, 255, 255, ${alpha})`;
            resetSessionTimer();

            // TODO: think of a better way of doing this
            filterSessionList();
            sortSessionList();
            populateSessionList();

            resetSessionInfoInputs();
        } catch (err) {
            console.log(err);
        }
    });
}
