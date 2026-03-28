import {
    sessionInfo,
    sessionDuration,
    sessionStartedDate,
    sessionEndedDate,
    pauseStartedDate,
    pauseEndedDate,
} from "./timer.js";
export const saveSessionInfo = async () => {
    sessionInfo.endedAt = sessionEndedDate.toISOString();
    sessionInfo.startedAt = sessionStartedDate.toISOString();
    sessionInfo.duration =
        sessionDuration.minutes * 60 + sessionDuration.seconds;
    try {
        const result = await fetch("api/storeSession", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sessionInfo),
        });
        const data = await result.text();
        console.log(data);
    } catch (err) {
        console.error(err);
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
