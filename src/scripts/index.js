import {
    saveSessionInfo,
    savePauseInfo,
    storeSessionLocal,
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
import { calculateAlphaOfCell, initHeatmap } from "./components/heatmap.js";
import { initSettings } from "./components/settings.js";
import { showSessionViewModal } from "./components/sessionView.js";

initializeSessionList(
    filterSessionList,
    sortSessionList,
    populateSessionList,
    initHeatmap,
);
getAndPopulateTagsList(showSessionInfoDialog);

initSessionModal(
    resetSessionTimer,
    filterSessionList,
    sortSessionList,
    populateSessionList,
    saveSessionInfo,
    calculateAlphaOfCell,
);

initTimer(showSessionInfoDialog, storeSessionLocal, savePauseInfo);
initSessionList(showSessionViewModal);
initSettings(toggleTimerMode);
