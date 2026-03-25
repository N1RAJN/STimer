import {
    sessionInfo,
    sessionDuration,
    sessionStartedDate,
    sessionEndedDate,
    pauseStartedDate,
    pauseEndedDate,
} from "./timer.js";
export const saveSessionInfo = () => {
    sessionInfo.endedAt = sessionEndedDate.toISOString();
    sessionInfo.startedAt = sessionStartedDate.toISOString();
    sessionInfo.duration = { ...sessionDuration };
    console.log(sessionInfo);
};
export const savePauseInfo = () => {
    const pauseEndedAt = pauseEndedDate.toISOString();
    const pauseStartedAt = pauseStartedDate.toISOString();
    sessionInfo.pausesInSession.push({
        startedAt: pauseStartedAt,
        endedAt: pauseEndedAt,
    });
};
