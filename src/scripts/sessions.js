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
    unsaved,
} from "./timer.js";

export const saveSessionInfo = async () => {
    const selectedTags = document.getElementsByClassName("Selected");
    if (!unsaved) {
        sessionInfo.StartedAt = +sessionStartedDate.getTime();
        sessionInfo.EndedAt = +sessionEndedDate.getTime();
    }
    Array.from(selectedTags).map((tag) => {
        sessionInfo.Tags.push(tag.innerHTML);
        tag.classList.remove("Selected");
    });
    sessionInfo.Duration =
        sessionDuration.minutes * 60 + sessionDuration.seconds;
    sessionInfo.Title = sessionTitle.value;
    sessionInfo.Description = sessionDescription.value;
    sessionInfo.Resources = sessionResources.value.trim();
    localStorage.setItem("activeSession", JSON.stringify(sessionInfo));
    const result = await fetch("api/storeSession", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionInfo),
    });
    return result;
};
export const savePauseInfo = () => {
    const pauseInfo = {
        startedAt: +pauseStartedDate.getTime(),
        endedAt: +pauseEndedDate.getTime(),
    };
    sessionInfo.PausesInSession.push(pauseInfo);
    let localSessionCopy = JSON.parse(localStorage.getItem("activeSession"));
    localSessionCopy.PausesInSession[
        localSessionCopy.PausesInSession.length - 1
    ] = pauseInfo;
    localStorage.setItem("activeSession", JSON.stringify(localSessionCopy));
};
