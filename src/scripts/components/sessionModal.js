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
            const tag = addSessionTagInput.value;
            const tagDiv = document.createElement("div");
            tagDiv.innerHTML = tag;
            tagDiv.className = "Session-Tag-Card";
            tagDiv.id = `session-${tag}`;
            sessionTagsList.appendChild(tagDiv);

            let tagDivCopy = tagDiv.cloneNode(true);
            tagDivCopy.id = `setting-${tag}`;
            tagsListSettings.appendChild(tagDivCopy);

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
            if (state.restoredSession) state.restoredSession = false;
            state.localCopyCreated = false;

            const response = await result.text();
            const message = response.split("#");
            console.log(message[0]);

            // Add the saved session to the all session list
            globals.allSessions[message[1]] = JSON.parse(
                JSON.stringify(globals.sessionInfo),
            );

            const dateString = currDate.toDateString();
            if (!globals.allSessionsByDate[dateString]) {
                globals.allSessionsByDate[dateString] = {
                    totalSessionDuration: 0,
                    sessions: [],
                };
            }
            globals.allSessionsByDate[dateString].totalSessionDuration +=
                globals.sessionInfo.Duration;
            globals.allSessionsByDate[dateString].sessions.push(
                globals.sessionInfo,
            );
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
