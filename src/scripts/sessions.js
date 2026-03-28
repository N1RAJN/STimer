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
    sessionInfo.tag = sessionTag.value;
    sessionInfo.title = sessionTitle.value;
    sessionInfo.description = sessionDescription.value;
    sessionResources.value.split("\n").forEach((link) => {
        if (link.trim()) sessionInfo.resources.push(link);
    });
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
