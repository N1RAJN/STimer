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
        sessionInfo.Tags.push(tag.innerHTML);
        tag.classList.remove("Selected");
    });
    sessionInfo.EndedAt = +sessionEndedDate.getTime();
    sessionInfo.StartedAt = +sessionStartedDate.getTime();
    sessionInfo.Duration =
        sessionDuration.minutes * 60 + sessionDuration.seconds;
    sessionInfo.Title = sessionTitle.value;
    sessionInfo.Description = sessionDescription.value;
    sessionInfo.Resources = sessionResources.value.trim();
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
    const pauseStartedAt = +pauseStartedDate.getTime();
    const pauseEndedAt = +pauseEndedDate.getTime();
    sessionInfo.PausesInSession.push({
        startedAt: pauseStartedAt,
        endedAt: pauseEndedAt,
    });
};
