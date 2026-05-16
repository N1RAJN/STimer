import {
    sessionList,
    toggleSessionListButton,
    timerContainer,
    heatmapContainer,
    sessionListContainer,
    sessionFilterDropdown,
    sessionSortDropdown,
} from "../elements.js";
import { state, globals } from "../state.js";
import {
    sessionTimeFilter,
    sessionSorts,
    customEvents,
    formatDurationSec,
} from "../utils.js";

export function populateSessionList() {
    sessionList.innerHTML = "";
    globals.sessionsToPopulate.forEach(([sessionId, session]) => {
        const sessionInfoCard = document.createElement("div");
        sessionInfoCard.classList.add("Session-Info-Card");
        sessionInfoCard.id = sessionId;

        const sessionInfoCardTitle = document.createElement("div");
        sessionInfoCardTitle.classList.add("Session-Info-Card-Title");
        sessionInfoCardTitle.innerHTML = session.Title ? session.Title : "—";

        const sessionInfoCardTimestamp = document.createElement("div");
        sessionInfoCardTimestamp.classList.add("Session-Info-Card-Timestamp");

        const sessionDate = new Date(session.StartedAt);

        if (state.currentFilter != sessionTimeFilter.Day) {
            const timestampDate = document.createElement("span");
            timestampDate.classList.add("Timestamp-Date");
            timestampDate.innerHTML = sessionDate.toLocaleString(
                "en-US",
                formatSessionOptions(),
            );
            sessionInfoCardTimestamp.appendChild(timestampDate);
        }

        const timestampTime = document.createElement("span");
        timestampTime.classList.add("Timestamp-Time");
        timestampTime.innerHTML = sessionDate.toLocaleString("en-US", {
            hour: "numeric",
            hour12: true,
            minute: "numeric",
        });

        const timestampDuration = document.createElement("span");
        timestampDuration.classList.add("Timestamp-Duration");

        const formattedDuration = formatDurationSec(session.Duration);
        timestampDuration.innerHTML = formattedDuration;

        sessionInfoCardTimestamp.appendChild(timestampTime);
        sessionInfoCardTimestamp.appendChild(timestampDuration);

        sessionInfoCard.appendChild(sessionInfoCardTitle);
        sessionInfoCard.appendChild(sessionInfoCardTimestamp);

        sessionList.appendChild(sessionInfoCard);

        sessionInfoCard.addEventListener("click", (e) => {
            if (e.currentTarget.className == "Session-Info-Card") {
                globals.sessionToView = e.currentTarget;
                document.dispatchEvent(
                    new CustomEvent(customEvents.SessionView),
                );
            }
        });
    });
}

function formatSessionOptions() {
    let formatOptions = {};
    if (
        state.currentFilter <= sessionTimeFilter.Week ||
        state.currentFilter == sessionTimeFilter.Month
    ) {
        formatOptions.weekday = "short";
        formatOptions.day = "numeric";
    }
    if (state.currentFilter <= sessionTimeFilter.Year) {
        formatOptions.month = "short";
    }
    if (state.currentFilter <= sessionTimeFilter.All) {
        formatOptions.year = "numeric";
    }
    return formatOptions;
}

export function filterSessionList() {
    globals.sessionsToPopulate = Object.entries(globals.allSessions).filter(
        ([_, sessionObj]) => sessionObj.StartedAt >= state.currentFilter,
    );
}

export function sortSessionList() {
    globals.sessionsToPopulate.sort(state.currentSort);
}

export function initSessionList(showSessionViewModal) {
    toggleSessionListButton.addEventListener("click", () => {
        if (state.timerStarted) return;
        sessionListContainer.style.display = state.isSessionListHidden
            ? "flex"
            : "none";
        heatmapContainer.style.display = state.isSessionListHidden
            ? "none"
            : "flex";
        state.isSessionListHidden = !state.isSessionListHidden;
        timerContainer.style.marginTop = state.isSessionListHidden
            ? "6rem"
            : "1rem";
        timerContainer.style.marginBottom = state.isSessionListHidden
            ? "6rem"
            : "1rem";
    });

    sessionFilterDropdown.addEventListener("change", () => {
        state.currentFilter = sessionTimeFilter[sessionFilterDropdown.value];
        filterSessionList();
        sortSessionList();
        populateSessionList();
    });

    sessionSortDropdown.addEventListener("change", () => {
        const sort = sessionSortDropdown.value.split(".");
        state.currentSort = sessionSorts[sort[0]][sort[1]];
        sortSessionList();
        populateSessionList();
    });
}
