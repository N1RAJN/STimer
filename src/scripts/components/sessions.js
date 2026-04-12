import {
    sessionTitle,
    sessionDescription,
    sessionResources,
    sessionTagsList,
} from "../elements.js";

import { state, globals } from "../state.js";
export async function saveSessionInfo() {
    const selectedTags = document.getElementsByClassName("Selected");
    globals.sessionInfo.StartedAt = +globals.sessionStartedDate.getTime();
    globals.sessionInfo.EndedAt = +globals.sessionEndedDate.getTime();
    Array.from(selectedTags).map((tag) => {
        globals.sessionInfo.Tags.push(tag.innerHTML);
        tag.classList.remove("Selected");
    });
    globals.sessionInfo.Duration =
        globals.sessionDuration.minutes * 60 + globals.sessionDuration.seconds;
    globals.sessionInfo.Title = sessionTitle.value;
    globals.sessionInfo.Description = sessionDescription.value;
    globals.sessionInfo.Resources = sessionResources.value.trim();
    localStorage.setItem("activeSession", JSON.stringify(globals.sessionInfo));
    try {
        const result = await fetch("api/storeSession", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(globals.sessionInfo),
        });
        return result;
    } catch (err) {
        console.error(err);
    }
}
export function savePauseInfo() {
    let size = globals.sessionInfo.PausesInSession.length;
    globals.sessionInfo.PausesInSession[size - 1].EndedAt =
        +globals.pauseEndedDate.getTime();
    let localSessionCopy = JSON.parse(localStorage.getItem("activeSession"));
    localSessionCopy.PausesInSession[size - 1].EndedAt =
        +globals.pauseEndedDate.getTime();
    localStorage.setItem("activeSession", JSON.stringify(localSessionCopy));
}
export function storeSessionLocal() {
    let sessionCopy = JSON.parse(JSON.stringify(globals.sessionInfo));
    sessionCopy.StartedAt = +globals.sessionStartedDate.getTime();
    if (!state.timerPaused) {
        sessionCopy.Duration =
            globals.sessionDuration.minutes * 60 +
            globals.sessionDuration.seconds;
    }
    sessionCopy.EndedAt = +new Date().getTime();
    let size = sessionCopy.PausesInSession.length;
    if (state.timerPaused) {
        sessionCopy.PausesInSession[size - 1].EndedAt = +new Date().getTime();
    }
    sessionCopy.Resources = sessionResources.value.trim();
    localStorage.setItem("activeSession", JSON.stringify(sessionCopy));
}

export function restoreUnsavedSession(showSessionInfoDialog) {
    const session = localStorage.getItem("activeSession");
    if (!session) return;
    state.sessionUnsaved = true;
    globals.sessionInfo = JSON.parse(session);
    globals.sessionStartedDate = new Date(globals.sessionInfo.StartedAt);
    globals.sessionEndedDate = new Date(globals.sessionInfo.EndedAt);
    sessionResources.value = globals.sessionInfo.Resources;
    showSessionInfoDialog("Unsaved Session.", "Save session");
}
async function getSessionList() {
    try {
        const sessions = await fetch("/api/getSession", {
            method: "POST",
            body: JSON.stringify({
                sort: "Today",
                timeRange: 40000,
            }),
        });
        globals.allSessions = await sessions.json();
    } catch (err) {
        console.error(err);
    }
}
export async function initializeSessionList(
    filterSessionList,
    sortSessionList,
    populateSessionList,
) {
    await getSessionList();
    filterSessionList();
    sortSessionList();
    populateSessionList();
}
export async function getAndPopulateTagsList() {
    try {
        const result = await fetch("/api/getTags");
        if (!result.ok) {
            console.error("Fetching the tags failed.");
            return;
        }
        const tags = await result.json();
        tags.forEach((tag) => {
            const tagDiv = document.createElement("div");
            tagDiv.innerHTML = tag;
            tagDiv.className = "Session-Tag-Card";
            sessionTagsList.appendChild(tagDiv);
        });
    } catch (err) {
        console.error(err);
    }
}
