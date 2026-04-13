import { sessionSorts, sessionTimeFilter } from "./utils.js";
export const state = {
    currentSort: sessionSorts.Recency.ascending,
    currentFilter: sessionTimeFilter.Day,
    timerStarted: false,
    timerPaused: true,
    isSessionListHidden: true,
    sessionSaved: true,
    localCopyCreated: false,
};
export const globals = {
    sessionDuration: { minutes: 0, seconds: 0 },
    allSessions: {},
    sessionsToPopulate: [],
    sessionTimerId: 0,
    localSessionId: 0,
    pauseStartedDate: 0,
    sessionStartedDate: 0,
    pauseEndedDate: 0,
    sessionEndedDate: 0,
    sessionInfo: {
        StartedAt: 0,
        EndedAt: 0,
        Duration: "",
        PausesInSession: [],
        Title: "",
        Description: "",
        Tags: [],
        Resources: "",
    },
};
