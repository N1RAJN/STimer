import {
    sessionTitle,
    sessionDescription,
    sessionResources,
    sessionTagsList,
} from "../elements.js";

import { state, globals } from "../state.js";
export async function saveSessionInfo() {
    const selectedTags = document.getElementsByClassName("Selected");
    if (!state.sessionUnsaved) {
        globals.sessionInfo.StartedAt = +globals.sessionStartedDate.getTime();
        globals.sessionInfo.EndedAt = +globals.sessionEndedDate.getTime();
    }
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
    const pauseInfo = {
        startedAt: +globals.pauseStartedDate.getTime(),
        endedAt: +globals.pauseEndedDate.getTime(),
    };
    globals.sessionInfo.PausesInSession.push(pauseInfo);
    let localSessionCopy = JSON.parse(localStorage.getItem("activeSession"));
    localSessionCopy.PausesInSession[
        localSessionCopy.PausesInSession.length - 1
    ] = pauseInfo;
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
    let pauses = sessionCopy.PausesInSession;
    if (state.timerPaused) {
        const pause = {
            StartedAt: globals.pauseStartedDate.getTime(),
            EndedAt: +new Date().getTime(),
        };
        if (pauses.length == 0) {
            pauses.push(pause);
        } else {
            pauses[pauses.length - 1] = pause;
        }
        sessionCopy.PausesInSession = pauses;
    }
    sessionCopy.Resources = sessionResources.value.trim();
    localStorage.setItem("activeSession", JSON.stringify(sessionCopy));
}

export function restoreUnsavedSession(showSessionInfoDialog) {
    const session = localStorage.getItem("activeSession");
    if (!session) return;
    state.sessionUnsaved = true;
    globals.sessionInfo = JSON.parse(session);
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
