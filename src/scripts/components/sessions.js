import {
    sessionTitle,
    sessionDescription,
    sessionResources,
    sessionTagsList,
    tagsListSettings,
} from "../elements.js";
import { state, globals } from "../state.js";
import { initHeatmap } from "./heatmap.js";

export async function saveSessionInfo() {
    const selectedTags = document.getElementsByClassName("Selected");
    globals.sessionInfo.StartedAt = +globals.sessionStartedDate.getTime();
    globals.sessionInfo.EndedAt = +globals.sessionEndedDate.getTime();
    Array.from(selectedTags).map((tag) => {
        globals.sessionInfo.Tags.push(tag.innerHTML);
        tag.classList.remove("Selected");
    });
    globals.sessionInfo.Duration = globals.sessionDurationSec;
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
    console.log(globals.sessionInfo);
    globals.sessionInfo.PausesInSession[size - 1].EndedAt =
        +globals.pauseEndedDate.getTime();
    localStorage.setItem("activeSession", JSON.stringify(globals.sessionInfo));
}

export function storeSessionLocal() {
    let sessionCopy = JSON.parse(JSON.stringify(globals.sessionInfo));
    sessionCopy.StartedAt = +globals.sessionStartedDate.getTime();
    if (!state.timerPaused) sessionCopy.Duration = globals.sessionDurationSec;

    sessionCopy.EndedAt = +new Date().getTime();
    let size = sessionCopy.PausesInSession.length;
    if (state.timerPaused && state.localCopyCreated) {
        sessionCopy.PausesInSession[size - 1].EndedAt = +new Date().getTime();
    }
    sessionCopy.Resources = sessionResources.value.trim();

    // Immediately create a local copy on session start;
    // Only after atleast saveIntervalMs that we declare the session as unsaved
    if (state.localCopyCreated && state.sessionSaved) {
        localStorage.setItem("sessionSaved", JSON.stringify(false));
        state.sessionSaved = false;
    }

    localStorage.setItem("activeSession", JSON.stringify(sessionCopy));
    if (!state.localCopyCreated) state.localCopyCreated = true;
}

export function restoreUnsavedSession(showSessionInfoDialog) {
    const unsavedSession = localStorage.getItem("sessionSaved");
    // sessionSaved key is removed on successful session save
    if (unsavedSession == null) return;
    state.sessionSaved = false;
    globals.sessionInfo = JSON.parse(localStorage.getItem("activeSession"));
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
        for (const session of Object.values(globals.allSessions)) {
            const dateString = new Date(session.StartedAt).toDateString();
            let dateEntry = globals.allSessionsByDate?.[dateString] ?? {
                totalSessionDuration: 0,
                sessions: [],
            };
            dateEntry.totalSessionDuration += session.Duration;
            dateEntry.sessions.push(session);
            globals.allSessionsByDate[dateString] = dateEntry;
        }
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
    initHeatmap();
}

export async function getAndPopulateTagsList() {
    try {
        const result = await fetch("/api/getTags");
        if (!result.ok) {
            console.error("Fetching the tags failed.");
            return;
        }
        const tags = await result.json();
        globals.sessionTags = tags;
        tags.forEach((tag) => {
            const tagDiv = document.createElement("div");
            tagDiv.innerHTML = tag;
            tagDiv.className = "Session-Tag-Card";
            sessionTagsList.appendChild(tagDiv);
            tagsListSettings.appendChild(tagDiv);
        });
    } catch (err) {
        console.error(err);
    }
}
