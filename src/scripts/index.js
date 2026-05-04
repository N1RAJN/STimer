import {
    saveSessionInfo,
    savePauseInfo,
    storeSessionLocal,
    restoreUnsavedSession,
    initializeSessionList,
    getAndPopulateTagsList,
} from "./components/sessions.js";
import {
    initTimer,
    toggleTimerMode,
    resetSessionTimer,
} from "./components/timer.js";
import {
    initSessionModal,
    showSessionInfoDialog,
} from "./components/sessionModal.js";
import {
    filterSessionList,
    sortSessionList,
    populateSessionList,
    initSessionList,
} from "./components/sessionList.js";
import { initHeatmap } from "./components/heatmap.js";
import { initSettings } from "./components/settings.js";

initializeSessionList(
    filterSessionList,
    sortSessionList,
    populateSessionList,
    initHeatmap,
);
getAndPopulateTagsList();

initSessionModal(
    resetSessionTimer,
    filterSessionList,
    sortSessionList,
    populateSessionList,
    saveSessionInfo,
);

restoreUnsavedSession(showSessionInfoDialog);

initTimer(showSessionInfoDialog, storeSessionLocal, savePauseInfo);
initSessionList();
initSettings(toggleTimerMode);
