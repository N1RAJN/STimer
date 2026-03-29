import {
    sessionInfo,
    sessionDuration,
    sessionStartedDate,
    sessionEndedDate,
    pauseStartedDate,
    pauseEndedDate,
    sessionTag,
    sessionDescription,
    sessionResources,
    sessionTitle,
} from "./timer.js";

export const saveSessionInfo = async () => {
    sessionInfo.endedAt = sessionEndedDate.toISOString();
    sessionInfo.startedAt = sessionStartedDate.toISOString();
    sessionInfo.duration =
        sessionDuration.minutes * 60 + sessionDuration.seconds;
    sessionTag.value.split("#").forEach((tag) => {
        if (tag.trim()) {
            sessionInfo.tags.push(tag);
        }
    });
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
