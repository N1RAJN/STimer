import { sessionInfo, sessionStartedDate, pauseStartedDate } from "./timer.js";
export const saveSessionInfo = () => {
    sessionInfo.endedAt = new Date().toISOString();
    sessionInfo.startedAt = sessionStartedDate.toISOString();
    console.log(sessionInfo);
};
export const savePauseInfo = () => {
    const pauseEndedAt = new Date().toISOString();
    const pauseStartedAt = pauseStartedDate.toISOString();
    sessionInfo.pausesInSession.push({
        startedAt: pauseStartedAt,
        endedAt: pauseEndedAt,
    });
};
