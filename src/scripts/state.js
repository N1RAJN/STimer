import { sessionSorts, sessionTimeFilter } from "./utils.js";
export const state = {
    currentSort: sessionSorts.Recency.ascending,
    currentFilter: sessionTimeFilter.Day,
    timerStarted: false,
    timerPaused: true,
    isSessionListHidden: true,
    restoredSession: false,
    localCopyCreated: false,
    stopwatchMode: true,
};
export const globals = {
    countdownDurationSec: 3600,
    selectedTag: null,
    tagEditBuffer: {
        Added: [],
        Deleted: [],
        Updated: {
            // NewTag : OldTag
        },
    },
    sessionDurationSec: 0,
    allSessions: {}, // list of all session (ungrouped)
    sessionTags: [], // list of all session tags
    allSessionsByDate: {}, // list of all session grouped by date
    sessionsToPopulate: [], // list of session to be displayed in session list
    sessionTimerId: 0, // ID of session timer
    localSessionId: 0, // ID of timer for local storage of session info
    pauseStartedDate: 0,
    sessionStartedDate: null,
    pauseEndedDate: null,
    sessionEndedDate: 0,
    sessionToView: null, // Info of session to be displayed
    sessionInfo: {
        StartedAt: 0,
        EndedAt: 0,
        Duration: 0,
        PauseDuration: 0,
        PausesInSession: [],
        Title: "",
        Description: "",
        Tags: [],
        Resources: "",
    },
};
