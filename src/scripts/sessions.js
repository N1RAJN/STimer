import {
    sessionInfo,
    sessionDuration,
    sessionStartedDate,
    sessionEndedDate,
    pauseStartedDate,
    pauseEndedDate,
    sessionDescription,
    sessionResources,
    sessionTitle,
} from "./timer.js";

export const saveSessionInfo = async () => {
    const selectedTags = document.getElementsByClassName("Selected");
    Array.from(selectedTags).map((tag) => {
        sessionInfo.tags.push(tag.innerHTML);
        tag.classList.remove("Selected");
    });
    sessionInfo.endedAt = sessionEndedDate.toISOString();
    sessionInfo.startedAt = sessionStartedDate.toISOString();
    sessionInfo.duration =
        sessionDuration.minutes * 60 + sessionDuration.seconds;
    sessionInfo.title = sessionTitle.value;
    sessionInfo.description = sessionDescription.value;
    sessionInfo.resources = sessionResources.value.trim();
    try {
        const result = await fetch("api/storeSession", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sessionInfo),
        });
        return result;
    } catch (err) {
        // Handled by the callback of dialog eventlistener
        throw err;
    }
};
export const savePauseInfo = () => {
    const pauseEndedAt = pauseEndedDate.toISOString();
    const pauseStartedAt = pauseStartedDate.toISOString();
    sessionInfo.pausesInSession.push({
        startedAt: pauseStartedAt,
        endedAt: pauseEndedAt,
    });
};
