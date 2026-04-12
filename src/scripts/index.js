import {
    saveSessionInfo,
    savePauseInfo,
    storeSessionLocal,
    restoreUnsavedSession,
    initializeSessionList,
    getAndPopulateTagsList,
} from "./components/sessions.js";
import { initTimer, resetSessionTimer } from "./components/timer.js";
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

initializeSessionList(filterSessionList, sortSessionList, populateSessionList);
getAndPopulateTagsList();

initSessionModal(
    resetSessionTimer,
    filterSessionList,
    sortSessionList,
    populateSessionList,
    saveSessionInfo,
);
restoreUnsavedSession(showSessionInfoDialog);
initSessionList();
initTimer(showSessionInfoDialog, storeSessionLocal, savePauseInfo);
