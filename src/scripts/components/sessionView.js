import {
    sessionViewModal,
    sessionViewModalCloseButton,
    sessionViewTitle,
    sessionViewTags,
    sessionViewResources,
    sessionViewStartedDate,
    sessionViewEndedDate,
    sessionViewDuration,
    sessionViewDescription,
} from "../elements.js";
import { globals } from "../state.js";
import { customEvents } from "../utils.js";
export function showSessionViewModal(sessionId) {
    const session = globals.allSessions[sessionId];
    sessionViewTitle.value = session.Title;
    sessionViewResources.value = session.Resources;
    sessionViewDescription.value = session.Description;
    sessionViewTags.innerHTML = session.Tags.join(" ");
    sessionViewStartedDate.innerHTML = session.StartedAt;
    sessionViewEndedDate.innerHTML = session.EndedAt;
    sessionViewDuration.innerHTML = session.Duration;
    sessionViewModal.showModal();
}

document.addEventListener(customEvents.SessionView, () => {
    showSessionViewModal(globals.sessionToView.id);
});
sessionViewModalCloseButton.addEventListener("click", () => {
    sessionViewModal.close();
});
